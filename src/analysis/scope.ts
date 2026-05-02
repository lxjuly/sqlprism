import type { ColumnExpression } from "../ast/expression";
import type { SelectStatement, TableSource } from "../ast/statement";

export interface SourceBinding {
  visibleName: string;
  source: TableSource;
}

export function getSourceBindings(statement: SelectStatement): SourceBinding[] {
  const sources: TableSource[] = [];

  if (statement.from) {
    sources.push(statement.from);
  }

  for (const join of statement.joins) {
    sources.push(join.source);
  }

  return sources.map((source) => ({
    visibleName: source.alias?.name ?? source.path[source.path.length - 1],
    source,
  }));
}

export function resolveColumnSource(
  statement: SelectStatement,
  column: ColumnExpression,
): SourceBinding | null {
  const sources = getSourceBindings(statement);

  if (column.table) {
    return (
      sources.find((source) => source.visibleName === column.table) ??
      sources.find((source) => source.source.path.join(".") === column.table) ??
      null
    );
  }

  if (sources.length === 1) {
    return sources[0];
  }

  return null;
}

export function isColumnQualified(column: ColumnExpression): boolean {
  return column.table !== null;
}
