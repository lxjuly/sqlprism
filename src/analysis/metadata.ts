import type {
  FunctionCallExpression,
  SqlExpression,
} from "../ast/expression";
import type { SelectItem, SelectStatement } from "../ast/statement";
import { resolveColumnSource } from "./scope";

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

export interface ColumnMetadata {
  label: string;
  sourceName: string | null;
  isQualified: boolean;
}

export function getProjectionMetadata(statement: SelectStatement): ProjectionMetadata[] {
  return statement.projections.map((item) => ({
    item,
    isAggregate: containsAggregate(item.expression),
    label: item.alias?.name ?? expressionLabel(item.expression),
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
      return expression.path.join(".");
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
      return expression.table ? `${expression.table}.*` : "*";
  }
}

export function getStatementColumns(statement: SelectStatement): ColumnMetadata[] {
  return collectColumns(statement).map((column) => {
    const source = resolveColumnSource(statement, column);
    return {
      label: expressionLabel(column),
      sourceName: source?.source.path.join(".") ?? null,
      isQualified: column.table !== null,
    };
  });
}

function functionLabel(expression: FunctionCallExpression): string {
  return `${expression.callee}(${expression.args.map(expressionLabel).join(", ")})`;
}

function collectColumns(statement: SelectStatement) {
  const columns: Array<Extract<SqlExpression, { type: "column" }>> = [];

  for (const projection of statement.projections) {
    walkExpression(projection.expression, columns);
  }

  if (statement.where) {
    walkExpression(statement.where, columns);
  }

  for (const expression of statement.groupBy) {
    walkExpression(expression, columns);
  }

  for (const item of statement.orderBy) {
    walkExpression(item.expression, columns);
  }

  for (const join of statement.joins) {
    if (join.on) {
      walkExpression(join.on, columns);
    }
  }

  return columns;
}

function walkExpression(
  expression: SqlExpression,
  columns: Array<Extract<SqlExpression, { type: "column" }>>,
): void {
  switch (expression.type) {
    case "column":
      columns.push(expression);
      break;
    case "call":
      for (const arg of expression.args) {
        walkExpression(arg, columns);
      }
      break;
    case "binary":
      walkExpression(expression.left, columns);
      walkExpression(expression.right, columns);
      break;
    case "unary":
      walkExpression(expression.operand, columns);
      break;
    case "group":
      walkExpression(expression.expression, columns);
      break;
    default:
      break;
  }
}
