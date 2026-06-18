import http from "node:http";
import { createNeo4jService } from "./bootstrap/createNeo4jService.js";
import { env } from "./config/env.js";
import { httpHandler } from "./transport/httpHandler.js";

const neo4jService = createNeo4jService();

const server = http.createServer((req, res) => {
  httpHandler(req, res, neo4jService).catch((error) => {
    console.error(error);
    if (!res.headersSent) {
      const message = error instanceof Error ? error.message : String(error);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end(message);
    }
  });
});

await neo4jService.start();
server.listen(env.PORT, () => {
  console.log(`graph-executor listening on port ${env.PORT}`);
});
