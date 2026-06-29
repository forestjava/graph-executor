import type { McpServer } from "@modelcontextprotocol/server";
import { loadAssetFile } from "./loadAssetFile.js";

const markdownMimeType = "text/markdown";

export function registerResources(server: McpServer) {
  server.registerResource(
    "graph-executor-domain-model",
    "ontology://graph-executor-domain-model",
    {
      title: "Graph Executor Domain Model",
      description: "Ontology: node labels, properties, and edge types",
      mimeType: markdownMimeType,
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: markdownMimeType,
          text: loadAssetFile("graph-executor-domain-model.md"),
        },
      ],
    }),
  );

  server.registerResource(
    "graph-executor-interpretation-rules",
    "rules://graph-executor-interpretation-rules",
    {
      title: "Graph Executor Interpretation Rules",
      description: "Rules for interpreting user commands into GQL (Cypher)",
      mimeType: markdownMimeType,
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: markdownMimeType,
          text: loadAssetFile("graph-executor-interpretation-rules.md"),
        },
      ],
    }),
  );

  server.registerResource(
    "graph-executor-command-patterns",
    "patterns://graph-executor-command-patterns",
    {
      title: "Graph Executor Command Patterns",
      description: "Cypher patterns for graph organizer operations",
      mimeType: markdownMimeType,
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: markdownMimeType,
          text: loadAssetFile("graph-executor-command-patterns.md"),
        },
      ],
    }),
  );

  server.registerResource(
    "graph-executor-command-interpreter",
    "skill://graph-executor-command-interpreter",
    {
      title: "Graph Executor Command Interpreter Skill",
      description:
        "Skill for interpreting declarative graph commands into GQL (Cypher)",
      mimeType: markdownMimeType,
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: markdownMimeType,
          text: loadAssetFile("graph-executor-skill.md"),
        },
      ],
    }),
  );

  server.registerResource(
    "graph-organizer-domain-model-extension",
    "ontology://graph-organizer-domain-model-extension",
    {
      title: "Graph Organizer Domain Model Extension",
      description: "Planning ontology extension: Priority, Urgency, Effort",
      mimeType: markdownMimeType,
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: markdownMimeType,
          text: loadAssetFile("graph-organizer-domain-model-extension.md"),
        },
      ],
    }),
  );

  server.registerResource(
    "graph-organizer-interpretation-rules-extension",
    "rules://graph-organizer-interpretation-rules-extension",
    {
      title: "Graph Organizer Interpretation Rules Extension",
      description:
        "Extended rules for interpreting planning/triage commands",
      mimeType: markdownMimeType,
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: markdownMimeType,
          text: loadAssetFile(
            "graph-organizer-interpretation-rules-extension.md",
          ),
        },
      ],
    }),
  );

  server.registerResource(
    "graph-organizer-command-patterns-extension",
    "patterns://graph-organizer-command-patterns-extension",
    {
      title: "Graph Organizer Command Patterns Extension",
      description: "Extended Cypher patterns for planning operations",
      mimeType: markdownMimeType,
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: markdownMimeType,
          text: loadAssetFile("graph-organizer-command-patterns-extension.md"),
        },
      ],
    }),
  );

  server.registerResource(
    "graph-organizer",
    "skill://graph-organizer",
    {
      title: "Graph Organizer Skill",
      description:
        "Skill for planning, triage, priority/urgency/effort",
      mimeType: markdownMimeType,
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: markdownMimeType,
          text: loadAssetFile("graph-organizer-skill.md"),
        },
      ],
    }),
  );
}
