import { McpServer } from "@modelcontextprotocol/server";
import type { Neo4jService } from "../domain/neo4j/service.js";
import { registerDomain } from "../domain/registerDomain.js";

export function createMcpServer(neo4jService: Neo4jService) {
  const server = new McpServer({
    name: "graph-executor",
    version: "2.0.0",
    title: "Graph Executor",
    description: "MCP server with tools for manipulating the graph database",
  });

  registerDomain(server, neo4jService);
  return server;
}
