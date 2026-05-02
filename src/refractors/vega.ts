import type { Visitor } from "../core/expr";
import { Grouping, Identifier, Literal, Select } from "../core/expr";

export interface VegaSpec {
  mark: string;
  encoding: Record<string, unknown>;
  meta?: Record<string, unknown>;
}

export class VegaRefractor implements Visitor<VegaSpec> {
  visitSelectExpr(expr: Select): VegaSpec {
    return {
      mark: "bar",
      encoding: {
        fields: expr.columns.map((column) => column.accept(this)),
        from: expr.from?.accept(this) ?? null,
        groupBy: expr.groupBy.map((item) => item.accept(this)),
      },
      meta: {
        status: "placeholder",
      },
    };
  }

  visitGroupingExpr(expr: Grouping): VegaSpec {
    return expr.expression.accept(this);
  }

  visitLiteralExpr(expr: Literal): VegaSpec {
    return {
      mark: "text",
      encoding: {
        value: expr.value,
      },
    };
  }

  visitIdentifierExpr(expr: Identifier): VegaSpec {
    return {
      mark: "text",
      encoding: {
        field: expr.name.lexeme,
      },
    };
  }
}
