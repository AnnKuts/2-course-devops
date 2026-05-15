import http from "http";
import minimist from "minimist";
import { initDb } from "./db";
import { createApp } from "./app";

const argv = minimist(process.argv.slice(2));

const host = argv["host"] || "127.0.0.1";
const port = Number(argv["port"]) || 8080;
const useSocketActivation =
  argv["socket-activation"] === true || argv["socket-activation"] === "true";

const dbConfig = {
  host: argv["db-host"] || "127.0.0.1",
  port: Number(argv["db-port"]) || 3306,
  database: argv["db-name"] || "taskdb",
  user: argv["db-user"] || "mywebapp",
  password: argv["db-password"] || "",
};

initDb(dbConfig);

const app = createApp();
const server = http.createServer(app);

if (useSocketActivation) {
  server.listen({ fd: 3 }, () => {
    console.log("mywebapp listening on systemd socket fd:3");
  });
} else {
  server.listen(port, host, () => {
    console.log(`mywebapp listening on ${host}:${port}`);
  });
}
