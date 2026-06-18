import { Neo4jService } from "../domain/neo4j/service.js";

export function createNeo4jService() {
  return new Neo4jService();
}
