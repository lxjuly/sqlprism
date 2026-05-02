import type { Grouping, Identifier, Literal, Select } from "../core/expr";

export interface RefractorVisitor<R> {
  visitSelectExpr(expr: Select): R;
  visitGroupingExpr(expr: Grouping): R;
  visitLiteralExpr(expr: Literal): R;
  visitIdentifierExpr(expr: Identifier): R;
}
