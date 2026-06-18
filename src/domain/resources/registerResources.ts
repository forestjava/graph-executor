import type { McpServer } from "@modelcontextprotocol/server";
import { composeSkillContent } from "./composeSkillContent.js";
import { loadAssetFile } from "./loadAssetFile.js";

const markdownMimeType = "text/markdown";

export function registerResources(server: McpServer) {
  server.registerResource(
    "graph-organizer-domain-model",
    "ontology://graph-organizer-domain-model",
    {
      title: "Graph Organizer Domain Model",
      description: "Ontology: node labels, properties, and edge types",
      mimeType: markdownMimeType,
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: markdownMimeType,
          text: loadAssetFile("graph-organizer-domain-model.md"),
        },
      ],
    }),
  );

  server.registerResource(
    "graph-organizer-interpretation-rules",
    "rules://graph-organizer-interpretation-rules",
    {
      title: "Graph Organizer Interpretation Rules",
      description: "Rules for interpreting user commands into Cypher",
      mimeType: markdownMimeType,
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: markdownMimeType,
          text: loadAssetFile("graph-organizer-interpretation-rules.md"),
        },
      ],
    }),
  );

  server.registerResource(
    "graph-organizer-command-patterns",
    "patterns://graph-organizer-command-patterns",
    {
      title: "Graph Organizer Command Patterns",
      description: "Cypher patterns for graph organizer operations",
      mimeType: markdownMimeType,
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: markdownMimeType,
          text: loadAssetFile("graph-organizer-command-patterns.md"),
        },
      ],
    }),
  );

  server.registerResource(
    "graph-organizer-command-interpreter",
    "skill://graph-organizer-command-interpreter",
    {
      title: "Graph Organizer Command Interpreter",
      description:
        "Skill for interpreting declarative graph commands into Cypher",
      mimeType: markdownMimeType,
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: markdownMimeType,
          text: composeSkillContent(),
        },
      ],
    }),
  );
}
