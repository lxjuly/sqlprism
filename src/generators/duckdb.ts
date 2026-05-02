import type { SelectStatement } from "../ast/statement";
import { generateSql } from "./sql";

export function generateDuckDbSql(statement: SelectStatement): string {
  return generateSql(statement, { dialect: "duckdb" });
}
