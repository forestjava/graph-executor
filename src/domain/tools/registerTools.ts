import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import type { Neo4jService } from "../neo4j/service.js";
import {
  readResource,
  resourceCatalog,
  UnknownResourceUriError,
} from "../resources/resourceCatalog.js";

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

  server.registerTool(
    "list_resources",
    {
      title: "List Resources",
      description: "Return the resource catalog",
    },
    async () => ({
      content: [{ type: "text", text: JSON.stringify(resourceCatalog, null, 2) }],
    }),
  );

  server.registerTool(
    "read_resource",
    {
      title: "Read Resource",
      description: "Return the full text of a resource by uri",
      inputSchema: z.object({
        uri: z.string(),
      }),
    },
    async ({ uri }) => {
      try {
        const text = readResource(uri);
        return {
          content: [{ type: "text", text }],
        };
      } catch (error) {
        if (error instanceof UnknownResourceUriError) {
          return {
            isError: true,
            content: [{ type: "text", text: error.message }],
          };
        }
        throw error;
      }
    },
  );
}
