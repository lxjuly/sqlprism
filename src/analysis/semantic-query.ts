import type { SqlExpression } from "../ast/expression";
import type { SelectStatement } from "../ast/statement";
import { containsAggregate, expressionLabel } from "./metadata";
import { normalizeStatement } from "./normalize";
import type {
  SemanticAggregate,
  SemanticPredicate,
  SemanticQuery,
  SemanticReference,
  SemanticSelection,
  SemanticSource,
} from "../semantic/model";

const AGGREGATE_FUNCTIONS = new Set(["sum", "count", "avg", "min", "max"]);

export function toSemanticQuery(statement: SelectStatement): SemanticQuery {
  const normalized = normalizeStatement(statement);

  return {
    source: normalized.from
      ? {
          path: normalized.from.path.join("."),
          alias: normalized.from.alias?.name ?? null,
        }
      : null,
    joins: normalized.joins.map((join) => ({
      type: join.joinType,
      source: {
        path: join.source.path.join("."),
        alias: join.source.alias?.name ?? null,
      },
      predicate: join.on ? expressionToPredicate(join.on) : null,
      expression: join.on ? expressionLabel(join.on) : null,
    })),
    selections: normalized.projections.map((projection) =>
      toSemanticSelection(projection.expression, projection.alias?.name ?? null),
    ),
    filters: normalized.where
      ? [
          {
            expression: expressionLabel(normalized.where),
            predicate: expressionToPredicate(normalized.where),
          },
        ]
      : [],
    groupBy: normalized.groupBy.map(expressionLabel),
    orderBy: normalized.orderBy.map((item) => ({
      expression: expressionLabel(item.expression),
      direction: item.direction,
      alias: item.expression.type === "column" ? item.expression.name : null,
      reference: expressionToReference(item.expression),
    })),
    limit: normalized.limit,
  };
}

function toSemanticSelection(
  expression: SqlExpression,
  alias: string | null,
): SemanticSelection {
  const expressionText = expressionLabel(expression);
  return {
    kind: containsAggregate(expression) ? "measure" : "dimension",
    label: alias ?? expressionText,
    alias,
    expression: expressionText,
    reference: expressionToReference(expression),
    aggregate: expressionToAggregate(expression),
  };
}

function expressionToReference(expression: SqlExpression): SemanticReference | null {
  if (expression.type !== "column" || !expression.table) {
    return null;
  }

  return {
    source: expression.table,
    field: expression.name,
  };
}

function expressionToAggregate(expression: SqlExpression): SemanticAggregate | null {
  if (expression.type !== "call") {
    return null;
  }

  const fn = expression.callee.toLowerCase();
  if (!AGGREGATE_FUNCTIONS.has(fn)) {
    return null;
  }

  const arg = expression.args[0];
  const reference = arg ? expressionToReference(arg) : null;
  if (!reference) {
    return null;
  }

  return {
    function: fn as SemanticAggregate["function"],
    reference,
  };
}

function expressionToPredicate(expression: SqlExpression): SemanticPredicate | null {
  if (expression.type !== "binary") {
    return null;
  }

  const left = expressionToReference(expression.left);
  if (!left) {
    return null;
  }

  if (expression.right.type === "literal") {
    return {
      left,
      operator: expression.operator,
      right: {
        kind: "literal",
        value: expression.right.value,
      },
    };
  }

  const rightReference = expressionToReference(expression.right);
  if (!rightReference) {
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
