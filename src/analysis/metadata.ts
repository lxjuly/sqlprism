import type {
  FunctionCallExpression,
  SqlExpression,
} from "../ast/expression";
import type { SelectItem, SelectStatement } from "../ast/statement";

const AGGREGATE_FUNCTIONS = new Set([
  "avg",
  "count",
  "max",
  "min",
  "sum",
]);

export interface ProjectionMetadata {
  item: SelectItem;
  isAggregate: boolean;
  label: string;
}

export function getProjectionMetadata(statement: SelectStatement): ProjectionMetadata[] {
  return statement.projections.map((item) => ({
    item,
    isAggregate: containsAggregate(item.expression),
    label: item.alias ?? expressionLabel(item.expression),
  }));
}

export function containsAggregate(expression: SqlExpression): boolean {
  switch (expression.type) {
    case "call":
      return (
        AGGREGATE_FUNCTIONS.has(expression.callee.toLowerCase()) ||
        expression.args.some(containsAggregate)
      );
    case "binary":
      return containsAggregate(expression.left) || containsAggregate(expression.right);
    case "unary":
      return containsAggregate(expression.operand);
    case "group":
      return containsAggregate(expression.expression);
    default:
      return false;
  }
}

export function expressionLabel(expression: SqlExpression): string {
  switch (expression.type) {
    case "column":
      return expression.parts.join(".");
    case "identifier":
      return expression.name;
    case "literal":
      return String(expression.value);
    case "call":
      return functionLabel(expression);
    case "binary":
      return `${expressionLabel(expression.left)} ${expression.operator} ${expressionLabel(expression.right)}`;
    case "unary":
      return `${expression.operator} ${expressionLabel(expression.operand)}`;
    case "group":
      return expressionLabel(expression.expression);
    case "star":
      return "*";
  }
}

function functionLabel(expression: FunctionCallExpression): string {
  return `${expression.callee}(${expression.args.map(expressionLabel).join(", ")})`;
}
