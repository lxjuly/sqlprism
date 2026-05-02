import type { SqlExpression } from "./expression";

export type SqlStatement = SelectStatement;

export interface SqlAlias {
  name: string;
}

export interface SelectStatement {
  type: "select";
  projections: SelectItem[];
  from: TableSource | null;
  joins: JoinClause[];
  where: SqlExpression | null;
  groupBy: SqlExpression[];
  orderBy: OrderByItem[];
  limit: number | null;
}

export interface SelectItem {
  expression: SqlExpression;
  alias: SqlAlias | null;
}

export interface OrderByItem {
  expression: SqlExpression;
  direction: "asc" | "desc";
}

export interface TableSource {
  type: "table";
  path: string[];
  alias: SqlAlias | null;
}

export interface JoinClause {
  type: "join";
  joinType: "inner" | "left" | "right" | "full" | "cross";
  source: TableSource;
  on: SqlExpression | null;
}
