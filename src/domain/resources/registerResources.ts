import type { McpServer } from "@modelcontextprotocol/server";
import { readResource, resourceCatalog } from "./resourceCatalog.js";

const markdownMimeType = "text/markdown";

export function registerResources(server: McpServer) {
  for (const resource of resourceCatalog) {
    server.registerResource(
      resource.name,
      resource.uri,
      {
        title: resource.title,
        description: resource.description,
        mimeType: markdownMimeType,
      },
      async (uri) => ({
        contents: [
          {
            uri: uri.href,
            mimeType: markdownMimeType,
            text: readResource(resource.uri),
          },
        ],
      }),
    );
  }
}
