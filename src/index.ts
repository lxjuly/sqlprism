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
export type {
  SemanticAggregate,
  SemanticFilter,
  SemanticJoin,
  SemanticOrder,
  SemanticPredicate,
  SemanticQuery,
  SemanticReference,
  SemanticSelection,
  SemanticSource,
} from "./semantic/model";

import { normalizeStatement } from "./analysis/normalize";
import { toSemanticQuery } from "./analysis/semantic-query";
import { getSourceBindings, resolveColumnSource } from "./analysis/scope";
import { generateDuckDbSql } from "./generators/duckdb";
import { generateOsi, semanticQueryToOsi } from "./generators/osi";
import { generateSql } from "./generators/sql";
import { generateVegaLite, semanticQueryToVegaLite } from "./generators/vega";
import { parse, parseOne } from "./parser";
import { executeOsiQuery } from "./runtime/execute-osi";
import { demoDataset } from "./runtime/mock-data";

export { demoDataset, executeOsiQuery, generateDuckDbSql, generateOsi, generateSql, generateVegaLite, getSourceBindings, parse, parseOne, resolveColumnSource, semanticQueryToOsi, semanticQueryToVegaLite, toSemanticQuery };

export interface RefractOptions {
  read?: string;
  outputs?: Array<"ast" | "duckdb" | "osi" | "vega">;
}

export interface RefractResult {
  ast: import("./ast/statement").SelectStatement;
  semantic?: import("./semantic/model").SemanticQuery;
  duckdb?: string;
  osi?: import("./generators/osi").OsiQuery;
  vega?: import("./generators/vega").VegaLiteSpec;
}

export function refract(sql: string, options: RefractOptions = {}): RefractResult {
  const ast = normalizeStatement(parseOne(sql, { dialect: options.read }));
  const semantic = toSemanticQuery(ast);
  const outputs = new Set(options.outputs ?? ["ast", "duckdb", "osi", "vega"]);

  return {
    ast,
    semantic,
    duckdb: outputs.has("duckdb") ? generateDuckDbSql(ast) : undefined,
    osi: outputs.has("osi") ? semanticQueryToOsi(semantic) : undefined,
    vega: outputs.has("vega") ? semanticQueryToVegaLite(semantic) : undefined,
  };
}
