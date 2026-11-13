import { loadAssetFile } from "./loadAssetFile.js";

export type ResourceDefinition = {
  name: string;
  uri: string;
  title: string;
  description: string;
  file: string;
};

export const resourceCatalog: ResourceDefinition[] = [
  {
    name: "graph-executor-domain-model",
    uri: "ontology://graph-executor-domain-model",
    title: "Graph Executor Domain Model",
    description: "Lower-level ontology: node labels, properties, and edge types",
    file: "graph-executor-domain-model.md",
  },
  {
    name: "graph-executor-interpretation-rules",
    uri: "rules://graph-executor-interpretation-rules",
    title: "Graph Executor Interpretation Rules",
    description: "Lower-level rules for interpreting user commands into GQL (Cypher)",
    file: "graph-executor-interpretation-rules.md",
  },
  {
    name: "graph-executor-command-patterns",
    uri: "patterns://graph-executor-command-patterns",
    title: "Graph Executor Command Patterns",
    description: "Lower-level Cypher patterns for graph commands",
    file: "graph-executor-command-patterns.md",
  },
  {
    name: "graph-executor-command-interpreter",
    uri: "skill://graph-executor-command-interpreter",
    title: "Graph Executor Command Interpreter Skill",
    description:
      "Lower-level skill for interpreting declarative graph commands into GQL (Cypher)",
    file: "graph-executor-skill.md",
  },
  {
    name: "graph-organizer-domain-model",
    uri: "ontology://graph-organizer-domain-model",
    title: "Graph Organizer Domain Model",
    description:
      "Upper-level planning ontology over Graph Executor: Priority, Urgency, Effort",
    file: "graph-organizer-domain-model.md",
  },
  {
    name: "graph-organizer-interpretation-rules",
    uri: "rules://graph-organizer-interpretation-rules",
    title: "Graph Organizer Interpretation Rules",
    description: "Upper-level rules for planning and triage commands",
    file: "graph-organizer-interpretation-rules.md",
  },
  {
    name: "graph-organizer-command-patterns",
    uri: "patterns://graph-organizer-command-patterns",
    title: "Graph Organizer Command Patterns",
    description: "Upper-level Cypher patterns for planning operations",
    file: "graph-organizer-command-patterns.md",
  },
  {
    name: "graph-organizer",
    uri: "skill://graph-organizer",
    title: "Graph Organizer Skill",
    description:
      "Upper-level skill for planning, triage, priority, urgency, and effort",
    file: "graph-organizer-skill.md",
  },
];

export class UnknownResourceUriError extends Error {
  constructor(uri: string) {
    super(`Unknown resource URI: ${uri}`);
    this.name = "UnknownResourceUriError";
  }
}

export function readResource(uri: string): string {
  const resource = resourceCatalog.find((item) => item.uri === uri);
  if (!resource) {
    throw new UnknownResourceUriError(uri);
  }

  return loadAssetFile(resource.file);
}
