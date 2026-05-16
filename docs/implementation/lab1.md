# Web Service Deployment with Automation

## Table of Contents

- [Variant](#variant)
- [Application](#application)
- [Development Setup](#development-setup)
- [Deployment](#deployment)
- [Testing](#testing)
  - [Endpoints via Nginx](#test-endpoints-via-nginx-port-80)
  - [Zod validation edge cases](#test-zod-runtime-validation-edge-cases)
  - [Health probes](#test-health-endpoints-directly-not-proxied-by-nginx)
  - [Operator permissions](#test-operator-user-permissions)
  - [DB schema verification](#verify-database-schema-after-automated-migration)
  - [DB local access only](#verify-db-is-only-accessible-locally)


### Variant
- group list number: 10
```js
const N = 10;
const V2 = (N % 2) + 1;
const V3 = (N % 3) + 1;
const V5 = (N % 5) + 1;

console.log(`V2=${V2}, V3=${V3}, V5=${V5}`);
```

```terminaloutput
V2=1, V3=2, V5=1

=== Code Execution Successful ===
```
- V2=1: configuration method - command-line arguments; database — MariaDB
- V3=2: web application theme - Task Tracker
- V5=1: port - 8080


## Application

**Task Tracker** — a service for tracking tasks.

### Task object fields

| Field | Type | Description |
|---|---|---|
| id | INT | Primary key, auto-increment |
| title | VARCHAR(255) | Task title |
| status | ENUM | `pending` or `done` |
| created_at | DATETIME | Creation timestamp |

### API Endpoints

| Method | Path | Description | Accept |
|---|---|---|---|
| GET | `/` | List of all business endpoints | `text/html` only |
| GET | `/tasks` | Get all tasks | `text/html` or `application/json` |
| POST | `/tasks` | Create a new task (body: `{"title": "..."}`) | `text/html` or `application/json` |
| POST | `/tasks/:id/done` | Mark task as done | `text/html` or `application/json` |
| GET | `/health/alive` | Liveness probe — always returns 200 OK | any |
| GET | `/health/ready` | Readiness probe — 200 if DB connected, 500 otherwise | any |

### Accept Header Behavior

Business endpoints respond based on the `Accept` header:
- `Accept: text/html` — returns a plain HTML page (table for lists, no JS, no CSS)
- `Accept: application/json` — returns JSON data

## Development Setup

### Prerequisites

- Node.js >= 18
- MariaDB

### Install dependencies

```bash
cd app
npm install
```

### Run in development mode

```bash
cd app
npm run dev -- --host 127.0.0.1 --port 8080 \
  --db-host 127.0.0.1 --db-port 3306 \
  --db-name taskdb --db-user mywebapp --db-password secret
```

### Build

```bash
cd app
npm run build
```

### Run migration

```bash
cd app
node dist/migrate.js \
  --db-host 127.0.0.1 --db-port 3306 \
  --db-name taskdb --db-user mywebapp --db-password secret
```

### Run production

```bash
cd app
node dist/index.js \
  --host 127.0.0.1 --port 8080 \
  --db-host 127.0.0.1 --db-port 3306 \
  --db-name taskdb --db-user mywebapp --db-password secret
```


## Deployment

### Base Image

Ubuntu Server 22.04 LTS — [Official download](https://ubuntu.com/download/server)

Choose: **Ubuntu Server 22.04.x LTS (64-bit)**

### VM Requirements

| Resource | Minimum |
|---|---|
| CPU | 1 core |
| RAM | 1 GB |
| Disk | 10 GB |
| Network | 1 NIC (bridged or NAT with port forwarding) |

### OS Installation Notes

No special disk partitioning required. Default Ubuntu Server installation is sufficient.

### First Login

Log in via console or SSH with the default `ubuntu` user created during OS setup.

```bash
ssh ubuntu@<vm-ip>
```

### Running the Automation Script

```bash
git clone https://github.com/AnnKuts/2-course-devops.git
cd 2-course-devops
sudo bash deploy/install.sh
```

The script performs:
1. Install required packages (Node.js, MariaDB, Nginx)
2. Create system users (student, teacher, app, operator)
3. Create MariaDB database and user
4. Deploy the application to `/opt/mywebapp`
5. Run database migration automatically via `ExecStartPre` before the service starts
6. Install and enable systemd socket + service
7. Configure Nginx as reverse proxy on port 80
8. Lock the default `ubuntu` system user
9. Create `/home/student/gradebook` with value `10`

After the script completes, the system is fully operational.

### User Credentials

| User | Password | Notes |
|---|---|---|
| student | set during OS install | sudo access |
| teacher | `12345678` | must change on first login |
| operator | `12345678` | must change on first login; limited sudo |
| app | — | system user that runs the application (`User=app` in `mywebapp.service`), no login shell |

---

## Testing

### Check service status

```bash
systemctl status mywebapp.socket
systemctl status mywebapp.service
```

### Test endpoints via Nginx (port 80)

```bash
curl -H 'Accept: text/html' http://localhost/
 ```

Expected: 
```HTML
<!DOCTYPE html>
<html>
<body>
<h1>mywebapp &mdash; Task Tracker</h1>
<ul>
  <li>GET /tasks &mdash; get all tasks</li>
  <li>POST /tasks &mdash; create a new task</li>
  <li>POST /tasks/:id/done &mdash; mark task as done</li>
</ul>
</body>
</html>
```

```bash
curl -H 'Accept: application/json' http://localhost/tasks
```
Expected:

```JSON
[{"id":3,"title":"Buy groceries","status":"pending","created_at":"2026-05-15T23:08:16.000Z"},{"id":2,"title":"Купити каву","status":"pending","created_at":"2026-05-15T22:46:28.000Z"},{"id":1,"title":"Купити каву викладачу з DevOps","status":"done","created_at":"2026-05-15T22:44:47.000Z"}]
```

```bash
curl -H 'Accept: text/html' http://localhost/tasks
```
Expected: 
```HTML
<!DOCTYPE html>
<html>
<body>
<h1>Tasks</h1>
<table border="1">
  <thead>
    <tr>
      <th>ID</th>
      <th>Title</th>
      <th>Status</th>
      <th>Created At</th>
    </tr>
  </thead>
  <tbody>
    
    <tr>
      <td>3</td>
      <td>Buy groceries</td>
      <td>pending</td>
      <td>Fri May 15 2026 23:08:16 GMT+0000 (Coordinated Universal Time)</td>
    </tr>
    
    <tr>
      <td>2</td>
      <td>Купити каву викладачу з DevOps</td>
      <td>pending</td>
      <td>Fri May 15 2026 22:46:28 GMT+0000 (Coordinated Universal Time)</td>
    </tr>
    
    <tr>
      <td>1</td>
      <td>Купити каву викладачу з DevOps</td>
      <td>done</td>
      <td>Fri May 15 2026 22:44:47 GMT+0000 (Coordinated Universal Time)</td>
    </tr>
    
  </tbody>
</table>
</body>
</html>
```

```bash
curl -X POST http://localhost/tasks \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{"title": "Buy glasses"}'
```
Expected:
```JSON
{"id":4,"title":"Buy glasses","status":"pending","created_at":"2026-05-15T23:15:44.000Z"}
```

```bash
curl -X POST http://localhost/tasks/4/done \
  -H 'Accept: application/json'
```
Expected: 
```JSON
{"id":4,"title":"Buy glasses","status":"done","created_at":"2026-05-15T23:15:44.000Z"}
```

### Test Zod Runtime Validation (Edge Cases)

**Title exceeds 255 characters — expected HTTP 400:**

```bash
curl -X POST http://localhost/tasks \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d "{\"title\": \"$(printf 'A%.0s' {1..260})\"}"
```

Expected response:
```json
{"errors":{"_errors":[],"title":{"_errors":["title must not exceed 255 characters"]}}}
```

**Title is blank (whitespace only) — expected HTTP 400:**

```bash
curl -X POST http://localhost/tasks \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{"title": "   "}'
```

Expected response:
```json
{"errors":{"_errors":[],"title":{"_errors":["title must not be empty"]}}}
```

**Invalid task ID (zero) — expected HTTP 400:**

```bash
curl -X POST http://localhost/tasks/0/done \
  -H 'Accept: application/json'
```

Expected response:
```json
{"errors":{"_errors":[],"id":{"_errors":["id must be a positive integer"]}}}
```

### Test health endpoints directly (not proxied by Nginx)

```bash
curl http://127.0.0.1:8080/health/alive
curl http://127.0.0.1:8080/health/ready
```
Expected: `OK`


### Verify health is NOT accessible via Nginx

```bash
curl http://localhost/health/alive
```

Expected: 
```HTML
<html>
<head><title>404 Not Found</title></head>
<body>
<center><h1>404 Not Found</h1></center>
<hr><center>nginx/1.28.3 (Ubuntu)</center>
</body>
</html>```

### Test operator user permissions

```bash
su - operator
sudo systemctl restart mywebapp
sudo systemctl status mywebapp
sudo systemctl reload nginx
sudo systemctl start nginx
```

Last command must be denied. Expected output:

```
Sorry, user operator is not allowed to execute '/usr/bin/systemctl start nginx' as root on ubuntu.
```

### Verify database schema after automated migration

```bash
sudo mariadb -u root -D taskdb -e "SHOW TABLES; DESCRIBE tasks;"
```

Expected output:

```
+------------------+
| Tables_in_taskdb |
+------------------+
| tasks            |
+------------------+

+------------+------------------------+------+-----+-------------------+----------------+
| Field      | Type                   | Null | Key | Default           | Extra          |
+------------+------------------------+------+-----+-------------------+----------------+
| id         | int(10) unsigned       | NO   | PRI | NULL              | auto_increment |
| title      | varchar(255)           | NO   |     | NULL              |                |
| status     | enum('pending','done') | NO   |     | pending           |                |
| created_at | datetime               | NO   |     | CURRENT_TIMESTAMP |                |
+------------+------------------------+------+-----+-------------------+----------------+
```

### Verify DB is only accessible locally

```bash
mysql -u mywebapp -p -h 127.0.0.1 taskdb
```
