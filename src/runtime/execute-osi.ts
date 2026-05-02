import type { OsiAggregate, OsiPredicate, OsiQuery, OsiReference } from "../generators/osi";

export type RuntimeScalar = string | number | null;
export type RuntimeRow = Record<string, RuntimeScalar>;
export type RuntimeDataset = Record<string, RuntimeRow[]>;

type RuntimeSourceRow = Record<string, RuntimeRow>;

export function executeOsiQuery(
  query: OsiQuery,
  datasets: RuntimeDataset,
): RuntimeRow[] {
  const sourceKey = query.sourceAlias ?? query.source;
  if (!query.source || !sourceKey) {
    return [];
  }

  const baseRows = datasets[query.source] ?? [];
  let rows: RuntimeSourceRow[] = baseRows.map((row) => ({
    [sourceKey]: row,
  }));

  for (const join of query.joins) {
    const joinKey = join.sourceAlias ?? join.source;
    const joinRows = datasets[join.source] ?? [];
    const nextRows: RuntimeSourceRow[] = [];

    for (const left of rows) {
      for (const right of joinRows) {
        const candidate = {
          ...left,
          [joinKey]: right,
        };

        if (!join.predicate || evaluatePredicate(join.predicate, candidate)) {
          nextRows.push(candidate);
        }
      }
    }

    rows = nextRows;
  }

  for (const filter of query.filters) {
    rows = rows.filter((row) => !filter.predicate || evaluatePredicate(filter.predicate, row));
  }

  const grouped = query.groupBy.length > 0 || query.select.some((item) => item.aggregate);
  const materialized = grouped
    ? aggregateRows(rows, query)
    : rows.map((row) => projectScalarRow(row, query));

  const ordered = applyOrderBy(materialized, query);
  return query.limit === null ? ordered : ordered.slice(0, query.limit);
}

function aggregateRows(rows: RuntimeSourceRow[], query: OsiQuery): RuntimeRow[] {
  const groups = new Map<string, RuntimeSourceRow[]>();

  for (const row of rows) {
    const key = JSON.stringify(
      query.select
        .filter((item) => !item.aggregate && item.reference)
        .map((item) => readReference(row, item.reference as OsiReference)),
    );
    const bucket = groups.get(key) ?? [];
    bucket.push(row);
    groups.set(key, bucket);
  }

  return Array.from(groups.values()).map((groupRows) => {
    const output: RuntimeRow = {};

    for (const item of query.select) {
      const key = item.alias ?? item.reference?.field ?? item.expression;

      if (item.aggregate) {
        output[key] = computeAggregate(groupRows, item.aggregate);
      } else if (item.reference) {
        output[key] = readReference(groupRows[0], item.reference);
      } else {
        output[key] = null;
      }
    }

    return output;
  });
}

function projectScalarRow(row: RuntimeSourceRow, query: OsiQuery): RuntimeRow {
  const output: RuntimeRow = {};

  for (const item of query.select) {
    const key = item.alias ?? item.reference?.field ?? item.expression;
    output[key] = item.reference ? readReference(row, item.reference) : null;
  }

  return output;
}

function applyOrderBy(rows: RuntimeRow[], query: OsiQuery): RuntimeRow[] {
  if (query.orderBy.length === 0) {
    return rows;
  }

  const ordered = [...rows];
  ordered.sort((left, right) => {
    for (const order of query.orderBy) {
      const key = order.alias ?? order.reference?.field ?? presentExpression(order.expression);
      const leftValue = left[key];
      const rightValue = right[key];

      if (leftValue === rightValue) {
        continue;
      }

      if (leftValue === null) {
        return 1;
      }

      if (rightValue === null) {
        return -1;
      }

      if (leftValue < rightValue) {
        return order.direction === "asc" ? -1 : 1;
      }

      if (leftValue > rightValue) {
        return order.direction === "asc" ? 1 : -1;
      }
    }

    return 0;
  });

  return ordered;
}

function computeAggregate(rows: RuntimeSourceRow[], aggregate: OsiAggregate): RuntimeScalar {
  const values = rows
    .map((row) => readReference(row, aggregate.reference))
    .filter((value): value is number => typeof value === "number");

  switch (aggregate.function) {
    case "sum":
      return values.reduce((total, value) => total + value, 0);
    case "count":
      return rows.length;
    case "avg":
      return values.length === 0
        ? null
        : values.reduce((total, value) => total + value, 0) / values.length;
    case "min":
      return values.length === 0 ? null : Math.min(...values);
    case "max":
      return values.length === 0 ? null : Math.max(...values);
  }
}

function evaluatePredicate(predicate: OsiPredicate, row: RuntimeSourceRow): boolean {
  const left = readReference(row, predicate.left);
  const right =
    predicate.right.kind === "reference"
      ? readReference(row, predicate.right.reference)
      : predicate.right.value;

  switch (predicate.operator) {
    case "=":
      return left === right;
    case "!=":
      return left !== right;
    case ">":
      return compare(left, right) > 0;
    case ">=":
      return compare(left, right) >= 0;
    case "<":
      return compare(left, right) < 0;
    case "<=":
      return compare(left, right) <= 0;
    default:
      return false;
  }
}

function compare(left: RuntimeScalar, right: RuntimeScalar): number {
  if (left === null || right === null) {
    return 0;
  }

  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  return String(left).localeCompare(String(right));
}

function readReference(row: RuntimeSourceRow, reference: OsiReference): RuntimeScalar {
  const source = row[reference.source];
  return source?.[reference.field] ?? null;
}

function presentExpression(expression: string): string {
  const parts = expression.split(".");
  return parts[parts.length - 1];
}
