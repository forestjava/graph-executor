import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import type { Neo4jService } from "../neo4j/service.js";

export function registerTools(server: McpServer, neo4jService: Neo4jService) {
  server.registerTool(
    "health",
    {
      title: "Health",
      description: "Health check",
    },
    async () => ({
      content: [{ type: "text", text: "OK" }],
    }),
  );

  server.registerTool(
    "execute",
    {
      title: "Execute Cypher",
      description: "Execute a Cypher query against Neo4j",
      inputSchema: z.object({
        query: z.string(),
        parameters: z.record(z.string(), z.unknown()).optional(),
      }),
    },
    async ({ query, parameters }) => {
      const result = await neo4jService.execute(query, parameters ?? {});

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        structuredContent: result,
      };
    },
  );
}
