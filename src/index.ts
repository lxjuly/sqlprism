export type { SqlExpression } from "./ast/expression";
export type {
  JoinClause,
  OrderByItem,
  SqlAlias,
  SelectItem,
  SelectStatement,
  SqlStatement,
  TableSource,
} from "./ast/statement";
export type { ParseIssue } from "./parser/errors";
export type { ParseOptions } from "./parser";
export type { OsiQuery } from "./generators/osi";
export type { VegaLiteSpec } from "./generators/vega";

import { normalizeStatement } from "./analysis/normalize";
import { getSourceBindings, resolveColumnSource } from "./analysis/scope";
import { generateDuckDbSql } from "./generators/duckdb";
import { generateOsi } from "./generators/osi";
import { generateSql } from "./generators/sql";
import { generateVegaLite } from "./generators/vega";
import { parse, parseOne } from "./parser";
import { executeOsiQuery } from "./runtime/execute-osi";
import { demoDataset } from "./runtime/mock-data";

export { demoDataset, executeOsiQuery, generateDuckDbSql, generateOsi, generateSql, generateVegaLite, getSourceBindings, parse, parseOne, resolveColumnSource };

export interface RefractOptions {
  read?: string;
  outputs?: Array<"ast" | "duckdb" | "osi" | "vega">;
}

export interface RefractResult {
  ast: import("./ast/statement").SelectStatement;
  duckdb?: string;
  osi?: import("./generators/osi").OsiQuery;
  vega?: import("./generators/vega").VegaLiteSpec;
}

export function refract(sql: string, options: RefractOptions = {}): RefractResult {
  const ast = normalizeStatement(parseOne(sql, { dialect: options.read }));
  const outputs = new Set(options.outputs ?? ["ast", "duckdb", "osi", "vega"]);

  return {
    ast,
    duckdb: outputs.has("duckdb") ? generateDuckDbSql(ast) : undefined,
    osi: outputs.has("osi") ? generateOsi(ast) : undefined,
    vega: outputs.has("vega") ? generateVegaLite(ast) : undefined,
  };
}
