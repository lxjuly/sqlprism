import type { SqlExpression } from "../ast/expression";
import type { SelectStatement } from "../ast/statement";
import { expressionLabel } from "../analysis/metadata";
import { normalizeStatement } from "../analysis/normalize";
import { getSourceBindings } from "../analysis/scope";

export interface OsiQuery {
  source: string | null;
  sourceAlias: string | null;
  joins: Array<{
    type: string;
    source: string;
    sourceAlias: string | null;
    on: string | null;
  }>;
  select: Array<{
    expression: string;
    alias: string | null;
  }>;
  filters: string[];
  groupBy: string[];
  orderBy: Array<{
    expression: string;
    direction: "asc" | "desc";
  }>;
  limit: number | null;
}

export function generateOsi(statement: SelectStatement): OsiQuery {
  const normalized = normalizeStatement(statement);
  const sourceBindings = getSourceBindings(normalized);

  return {
    source: normalized.from ? normalized.from.path.join(".") : null,
    sourceAlias: normalized.from?.alias?.name ?? null,
    joins: normalized.joins.map((join) => ({
      type: join.joinType,
      source: join.source.path.join("."),
      sourceAlias: join.source.alias?.name ?? null,
      on: join.on ? expressionToSemanticString(join.on) : null,
    })),
    select: normalized.projections.map((projection) => ({
      expression: expressionToSemanticString(projection.expression),
      alias: projection.alias?.name ?? null,
    })),
    filters: normalized.where ? [expressionToSemanticString(normalized.where)] : [],
    groupBy: normalized.groupBy.map(expressionToSemanticString),
    orderBy: normalized.orderBy.map((item) => ({
      expression: expressionToSemanticString(item.expression),
      direction: item.direction,
    })),
    limit: normalized.limit,
  };
}

function expressionToSemanticString(expression: SqlExpression): string {
  return expressionLabel(expression);
}
