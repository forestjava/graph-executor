import type { McpServer } from "@modelcontextprotocol/server";
import type { Neo4jService } from "./neo4j/service.js";
import { registerTools } from "./tools/registerTools.js";
import { registerResources } from "./resources/registerResources.js";

export function registerDomain(server: McpServer, neo4jService: Neo4jService) {
  registerTools(server, neo4jService);
  registerResources(server);
}
