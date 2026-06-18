import { loadAssetFile } from "./loadAssetFile.js";

export function composeSkillContent(): string {
  const frontMatter = loadAssetFile("skill-front-matter.yml");
  const domainModel = loadAssetFile("graph-organizer-domain-model.md");
  const interpretationRules = loadAssetFile(
    "graph-organizer-interpretation-rules.md",
  );
  const commandPatterns = loadAssetFile("graph-organizer-command-patterns.md");

  return [
    "---",
    frontMatter.trimEnd(),
    "---",
    "",
    domainModel.trimEnd(),
    "",
    interpretationRules.trimEnd(),
    "",
    commandPatterns.trimEnd(),
    "",
  ].join("\n");
}
