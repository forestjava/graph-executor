import neo4j, { type Driver } from "neo4j-driver";
import { env } from "../../config/env.js";
import { neo4jSerialize } from "./serialize.js";

export type ExecuteResult = {
  records: Record<string, unknown>[];
};

type Neo4jConfig = {
  uri: string;
  user: string;
  password: string;
  database: string;
};

export class Neo4jService {
  private readonly config: Neo4jConfig;
  private readonly driver: Driver;

  constructor() {
    this.config = {
      uri: env.NEO4J_URI,
      user: env.NEO4J_USER,
      password: env.NEO4J_PASSWORD,
      database: env.NEO4J_DATABASE,
    };

    this.driver = neo4j.driver(
      this.config.uri,
      neo4j.auth.basic(this.config.user, this.config.password),
    );
  }

  async start(): Promise<void> {
    await this.driver.verifyConnectivity();
  }

  async execute(
    query: string,
    parameters: Record<string, unknown> = {},
  ): Promise<ExecuteResult> {
    const { records } = await this.driver.executeQuery(query, parameters, {
      database: this.config.database,
    });

    return {
      records: records.map((record) => {
        const row: Record<string, unknown> = {};
        for (const key of record.keys) {
          if (typeof key !== "string") {
            continue;
          }
          row[key] = neo4jSerialize(record.get(key));
        }
        return row;
      }),
    };
  }

  async close(): Promise<void> {
    await this.driver.close();
  }
}
