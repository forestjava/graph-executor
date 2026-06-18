import type http from "node:http";
import { createMcpServer } from "../bootstrap/createMcpServer.js";
import type { Neo4jService } from "../domain/neo4j/service.js";
import { createStatelessTransport } from "../bootstrap/createTransportContext.js";

export async function httpHandler(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  neo4jService: Neo4jService,
) {
  const parsedBody = await readJsonBody(req);
  const server = createMcpServer(neo4jService);
  const transport = createStatelessTransport();

  res.on("close", () => {
    void transport.close();
    void server.close();
  });

  await server.connect(transport);
  await transport.handleRequest(req, res, parsedBody);
}

async function readJsonBody(req: http.IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : undefined;
}
