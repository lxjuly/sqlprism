import type {
  BinaryExpression,
  ColumnExpression,
  FunctionCallExpression,
  GroupExpression,
  LiteralExpression,
  SqlExpression,
  StarExpression,
  UnaryExpression,
} from "./expression";

export interface ExpressionVisitor<R> {
  column(expression: ColumnExpression): R;
  literal(expression: LiteralExpression): R;
  call(expression: FunctionCallExpression): R;
  binary(expression: BinaryExpression): R;
  unary(expression: UnaryExpression): R;
  group(expression: GroupExpression): R;
  star(expression: StarExpression): R;
}

export function visitExpression<R>(
  expression: SqlExpression,
  visitor: ExpressionVisitor<R>,
): R {
  switch (expression.type) {
    case "column":
      return visitor.column(expression);
    case "literal":
      return visitor.literal(expression);
    case "call":
      return visitor.call(expression);
    case "binary":
      return visitor.binary(expression);
    case "unary":
      return visitor.unary(expression);
    case "group":
      return visitor.group(expression);
    case "star":
      return visitor.star(expression);
  }
}
