#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="/opt/mywebapp"
DB_NAME="taskdb"
DB_USER="mywebapp"
DB_PASSWORD="$(openssl rand -hex 16)"
SERVICE_FILE="/etc/systemd/system/mywebapp.service"
SOCKET_FILE="/etc/systemd/system/mywebapp.socket"
NGINX_SITE="/etc/nginx/sites-available/mywebapp"
SUDOERS_FILE="/etc/sudoers.d/operator"

if [[ "$EUID" -ne 0 ]]; then
    echo "Run this script as root or with sudo" >&2
    exit 1
fi

echo "==> Installing packages"
apt-get update -qq
apt-get install -y --no-install-recommends \
    curl gnupg ca-certificates mariadb-server nginx

if ! command -v node &>/dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

echo "==> Creating system users"

if ! id student &>/dev/null; then
    useradd -m -s /bin/bash student
fi
usermod -aG sudo student

if ! id teacher &>/dev/null; then
    useradd -m -s /bin/bash teacher
fi
usermod -aG sudo teacher
echo 'teacher:12345678' | chpasswd
passwd --expire teacher

if ! id app &>/dev/null; then
    useradd --system --no-create-home --shell /usr/sbin/nologin app
fi

if ! id operator &>/dev/null; then
    useradd -m -s /bin/bash operator
fi
echo 'operator:12345678' | chpasswd
passwd --expire operator

echo "==> Configuring MariaDB"
systemctl enable --now mariadb

mariadb -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mariadb -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'127.0.0.1' IDENTIFIED BY '${DB_PASSWORD}';"
mariadb -e "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'127.0.0.1';"
mariadb -e "FLUSH PRIVILEGES;"

echo "==> Deploying application to ${APP_DIR}"
mkdir -p "${APP_DIR}"
cp -r "${REPO_DIR}/app/." "${APP_DIR}/"
chown -R app:app "${APP_DIR}"

cd "${APP_DIR}"
npm ci --omit=dev
npm run build

echo "==> Installing systemd unit files"
sed "s/PLACEHOLDER_PASSWORD/${DB_PASSWORD}/g" \
    "${REPO_DIR}/deploy/mywebapp.service" > "${SERVICE_FILE}"
cp "${REPO_DIR}/deploy/mywebapp.socket" "${SOCKET_FILE}"

systemctl daemon-reload
systemctl enable mywebapp.socket
systemctl start mywebapp.socket

echo "==> Configuring nginx"
cp "${REPO_DIR}/deploy/nginx.conf" "${NGINX_SITE}"
ln -sf "${NGINX_SITE}" /etc/nginx/sites-enabled/mywebapp
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl enable --now nginx
systemctl reload nginx

echo "==> Configuring operator sudo rules"
cat > "${SUDOERS_FILE}" <<'EOF'
operator ALL=(ALL) NOPASSWD: \
    /usr/bin/systemctl start mywebapp, \
    /usr/bin/systemctl stop mywebapp, \
    /usr/bin/systemctl restart mywebapp, \
    /usr/bin/systemctl status mywebapp, \
    /usr/bin/systemctl reload nginx
EOF
chmod 440 "${SUDOERS_FILE}"
visudo -cf "${SUDOERS_FILE}"

echo "==> Creating gradebook"
echo "10" > /home/student/gradebook
chown student:student /home/student/gradebook

echo "==> Locking default ubuntu user"
if id ubuntu &>/dev/null; then
    passwd -l ubuntu
fi

echo "==> Verifying deployment"
sleep 2
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -H "Accept: text/html" http://127.0.0.1:8080/ || true)
if [[ "$HTTP_STATUS" == "200" ]]; then
    echo "Service is up and running"
else
    echo "Warning: service returned HTTP ${HTTP_STATUS}. Check: systemctl status mywebapp.service"
fi

echo ""
echo "==> Installation complete"
echo "    DB password stored in: ${SERVICE_FILE}"
echo "    Access the app via: http://<vm-ip>/"
