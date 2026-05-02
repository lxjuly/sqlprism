import type { SqlExpression } from "../ast/expression";
import type { SelectStatement } from "../ast/statement";
import { expressionLabel } from "../analysis/metadata";
import { normalizeStatement } from "../analysis/normalize";

export interface OsiReference {
  source: string;
  field: string;
}

export interface OsiAggregate {
  function: "sum" | "count" | "avg" | "min" | "max";
  reference: OsiReference;
}

export interface OsiPredicate {
  left: OsiReference;
  operator: string;
  right:
    | {
        kind: "literal";
        value: string | number | null;
      }
    | {
        kind: "reference";
        reference: OsiReference;
      };
}

export interface OsiQuery {
  source: string | null;
  sourceAlias: string | null;
  joins: Array<{
    type: string;
    source: string;
    sourceAlias: string | null;
    on: string | null;
    predicate: OsiPredicate | null;
  }>;
  select: Array<{
    expression: string;
    alias: string | null;
    reference: OsiReference | null;
    aggregate: OsiAggregate | null;
  }>;
  filters: Array<{
    expression: string;
    predicate: OsiPredicate | null;
  }>;
  groupBy: string[];
  orderBy: Array<{
    expression: string;
    direction: "asc" | "desc";
    alias: string | null;
    reference: OsiReference | null;
  }>;
  limit: number | null;
}

export function generateOsi(statement: SelectStatement): OsiQuery {
  const normalized = normalizeStatement(statement);

  return {
    source: normalized.from ? normalized.from.path.join(".") : null,
    sourceAlias: normalized.from?.alias?.name ?? null,
    joins: normalized.joins.map((join) => ({
      type: join.joinType,
      source: join.source.path.join("."),
      sourceAlias: join.source.alias?.name ?? null,
      on: join.on ? expressionToSemanticString(join.on) : null,
      predicate: join.on ? expressionToPredicate(join.on) : null,
    })),
    select: normalized.projections.map((projection) => ({
      expression: expressionToSemanticString(projection.expression),
      alias: projection.alias?.name ?? null,
      reference: expressionToReference(projection.expression),
      aggregate: expressionToAggregate(projection.expression),
    })),
    filters: normalized.where
      ? [
          {
            expression: expressionToSemanticString(normalized.where),
            predicate: expressionToPredicate(normalized.where),
          },
        ]
      : [],
    groupBy: normalized.groupBy.map(expressionToSemanticString),
    orderBy: normalized.orderBy.map((item) => ({
      expression: expressionToSemanticString(item.expression),
      direction: item.direction,
      alias: item.expression.type === "column" ? item.expression.name : null,
      reference: expressionToReference(item.expression),
    })),
    limit: normalized.limit,
  };
}

function expressionToSemanticString(expression: SqlExpression): string {
  return expressionLabel(expression);
}

function expressionToReference(expression: SqlExpression): OsiReference | null {
  if (expression.type !== "column" || !expression.table) {
    return null;
  }

  return {
    source: expression.table,
    field: expression.name,
  };
}

function expressionToAggregate(expression: SqlExpression): OsiAggregate | null {
  if (expression.type !== "call") {
    return null;
  }

  const fn = expression.callee.toLowerCase();
  if (!["sum", "count", "avg", "min", "max"].includes(fn)) {
    return null;
  }

  const arg = expression.args[0];
  const reference = arg ? expressionToReference(arg) : null;
  if (!reference) {
    return null;
  }

  return {
    function: fn as OsiAggregate["function"],
    reference,
  };
}

function expressionToPredicate(expression: SqlExpression): OsiPredicate | null {
  if (expression.type !== "binary") {
    return null;
  }

  const left = expressionToReference(expression.left);
  if (!left || expression.right.type !== "literal") {
    const rightReference = expressionToReference(expression.right);
    if (!left || !rightReference) {
      return null;
    }

    return {
      left,
      operator: expression.operator,
      right: {
        kind: "reference",
        reference: rightReference,
      },
    };
  }

  return {
    left,
    operator: expression.operator,
    right: {
      kind: "literal",
      value: expression.right.value,
    },
  };
}
