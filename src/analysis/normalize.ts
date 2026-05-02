import type { SelectStatement } from "../ast/statement";
import { getSourceBindings, isColumnQualified } from "./scope";

export function normalizeStatement(statement: SelectStatement): SelectStatement {
  const bindings = getSourceBindings(statement);

  if (bindings.length !== 1) {
    return statement;
  }

  const onlySource = bindings[0].visibleName;

  const qualify = (expression: SelectStatement["where"]): SelectStatement["where"] => {
    if (!expression) {
      return expression;
    }

    switch (expression.type) {
      case "column":
        if (isColumnQualified(expression)) {
          return expression;
        }
        return {
          ...expression,
          table: onlySource,
          path: [onlySource, expression.name],
        };
      case "call":
        return {
          ...expression,
          args: expression.args.map((arg) => qualify(arg) as typeof arg),
        };
      case "binary":
        return {
          ...expression,
          left: qualify(expression.left) as typeof expression.left,
          right: qualify(expression.right) as typeof expression.right,
        };
      case "unary":
        return {
          ...expression,
          operand: qualify(expression.operand) as typeof expression.operand,
        };
      case "group":
        return {
          ...expression,
          expression: qualify(expression.expression) as typeof expression.expression,
        };
      default:
        return expression;
    }
  };

  return {
    ...statement,
    projections: statement.projections.map((projection) => ({
      ...projection,
      expression: qualify(projection.expression) as typeof projection.expression,
    })),
    where: qualify(statement.where),
    groupBy: statement.groupBy.map((expression) => qualify(expression) as typeof expression),
    orderBy: statement.orderBy.map((item) => ({
      ...item,
      expression: qualify(item.expression) as typeof item.expression,
    })),
    joins: statement.joins.map((join) => ({
      ...join,
      on: qualify(join.on),
    })),
  };
}
