import { NodeStreamableHTTPServerTransport } from "@modelcontextprotocol/node";

export function createStatelessTransport() {
  return new NodeStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });
}
