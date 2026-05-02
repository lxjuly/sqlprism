import type { Visitor } from "../core/expr";
import { Grouping, Identifier, Literal, Select } from "../core/expr";

export interface OsiPayload {
  source: string | null;
  select: string[];
  filters: unknown[];
  groupBy: string[];
}

export class OsiRefractor implements Visitor<OsiPayload | string | number | null> {
  visitSelectExpr(expr: Select): OsiPayload {
    return {
      source: expr.from?.name.lexeme ?? null,
      select: expr.columns.map((column) => String(column.accept(this))),
      filters: expr.where ? [expr.where.accept(this)] : [],
      groupBy: expr.groupBy.map((item) => String(item.accept(this))),
    };
  }

  visitGroupingExpr(expr: Grouping): string | number | null {
    return expr.expression.accept(this);
  }

  visitLiteralExpr(expr: Literal): string | number | null {
    return expr.value;
  }

  visitIdentifierExpr(expr: Identifier): string {
    return expr.name.lexeme;
  }
}
