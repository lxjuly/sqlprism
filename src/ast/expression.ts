export type SqlExpression =
  | ColumnExpression
  | LiteralExpression
  | FunctionCallExpression
  | BinaryExpression
  | UnaryExpression
  | GroupExpression
  | StarExpression;

export interface ColumnExpression {
  type: "column";
  path: string[];
  table: string | null;
  name: string;
}

export interface LiteralExpression {
  type: "literal";
  value: string | number | null;
}

export interface FunctionCallExpression {
  type: "call";
  callee: string;
  args: SqlExpression[];
}

export interface BinaryExpression {
  type: "binary";
  operator: string;
  left: SqlExpression;
  right: SqlExpression;
}

export interface UnaryExpression {
  type: "unary";
  operator: string;
  operand: SqlExpression;
}

export interface GroupExpression {
  type: "group";
  expression: SqlExpression;
}

export interface StarExpression {
  type: "star";
  table: string | null;
}
