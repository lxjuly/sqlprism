import type { SqlExpression } from "../ast/expression";
import type { SelectStatement } from "../ast/statement";
import { expressionLabel } from "../analysis/metadata";

export interface OsiQuery {
  source: string | null;
  joins: Array<{
    type: string;
    source: string;
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
  return {
    source: statement.from ? statement.from.name.join(".") : null,
    joins: statement.joins.map((join) => ({
      type: join.joinType,
      source: join.source.name.join("."),
      on: join.on ? expressionToSemanticString(join.on) : null,
    })),
    select: statement.projections.map((projection) => ({
      expression: expressionToSemanticString(projection.expression),
      alias: projection.alias,
    })),
    filters: statement.where ? [expressionToSemanticString(statement.where)] : [],
    groupBy: statement.groupBy.map(expressionToSemanticString),
    orderBy: statement.orderBy.map((item) => ({
      expression: expressionToSemanticString(item.expression),
      direction: item.direction,
    })),
    limit: statement.limit,
  };
}

function expressionToSemanticString(expression: SqlExpression): string {
  return expressionLabel(expression);
}
