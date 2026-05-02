import type { SelectStatement } from "../ast/statement";
import { getProjectionMetadata, type ProjectionMetadata } from "../analysis/metadata";
import { normalizeStatement } from "../analysis/normalize";

export interface VegaLiteSpec {
  $schema?: string;
  title?: string;
  mark: string;
  encoding: Record<string, unknown>;
  data?: Record<string, unknown>;
  description?: string;
}

export function generateVegaLite(statement: SelectStatement): VegaLiteSpec {
  const normalized = normalizeStatement(statement);
  const projections = getProjectionMetadata(normalized);
  const dimensions = projections.filter((projection) => !projection.isAggregate);
  const measures = projections.filter((projection) => projection.isAggregate);

  const mark = chooseMark(dimensions, measures);
  const encoding: Record<string, unknown> = {};
  const primaryDimension = dimensions[0];
  const secondaryDimension = dimensions[1];
  const primaryMeasure = measures[0];

  if (primaryDimension) {
    encoding.x = {
      field: presentField(primaryDimension.label),
      type: inferFieldType(primaryDimension.label, false),
      sort: inferSort(normalized, primaryDimension.label),
      axis: inferAxis(primaryDimension.label),
    };
  }

  if (primaryMeasure) {
    encoding.y = {
      field: presentField(primaryMeasure.label),
      type: inferFieldType(primaryMeasure.label, true),
      axis: inferAxis(primaryMeasure.label),
    };
  } else if (secondaryDimension) {
    encoding.y = {
      field: presentField(secondaryDimension.label),
      type: inferFieldType(secondaryDimension.label, false),
      axis: inferAxis(secondaryDimension.label),
    };
  }

  if (secondaryDimension && primaryMeasure) {
    encoding.color = {
      field: presentField(secondaryDimension.label),
      type: inferFieldType(secondaryDimension.label, false),
    };
  }

  encoding.tooltip = projections.map((projection) => ({
    field: presentField(projection.label),
    type: inferFieldType(projection.label, projection.isAggregate),
    title: presentField(projection.label),
  }));

  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: inferTitle(normalized),
    description: inferDescription(normalized),
    mark,
    encoding,
    data: normalized.from
      ? {
          name: normalized.from.path.join("."),
        }
      : undefined,
  };
}

function chooseMark(
  dimensions: ProjectionMetadata[],
  measures: ProjectionMetadata[],
): string {
  const primaryDimension = dimensions[0];
  const primaryMeasure = measures[0];

  if (primaryDimension && primaryMeasure && isTemporalLabel(primaryDimension.label)) {
    return "line";
  }

  if (primaryDimension && primaryMeasure) {
    return "bar";
  }

  if (dimensions.length >= 2) {
    return "point";
  }

  return "point";
}

function inferFieldType(
  label: string,
  isAggregate: boolean,
): "nominal" | "temporal" | "quantitative" {
  if (isAggregate || /revenue|price|count|amount|sum|avg|total|metric|value/i.test(label)) {
    return "quantitative";
  }

  if (isTemporalLabel(label)) {
    return "temporal";
  }

  return "nominal";
}

function isTemporalLabel(label: string): boolean {
  return /date|time|day|week|month|quarter|year/i.test(label);
}

function inferAxis(label: string): Record<string, string> | undefined {
  if (isTemporalLabel(label)) {
    return { format: "%b %d" };
  }

  if (/revenue|price|amount|total|sum|avg/i.test(label)) {
    return { format: "~s" };
  }

  return undefined;
}

function inferSort(
  statement: SelectStatement,
  label: string,
): string | undefined {
  const order = statement.orderBy.find((item) => {
    return item.expression.type === "column" && item.expression.name === label;
  });

  if (!order) {
    return undefined;
  }

  return order.direction === "desc" ? "-x" : "x";
}

function inferTitle(statement: SelectStatement): string {
  const source = statement.from?.path.at(-1) ?? "query";
  const grouped = statement.groupBy.length > 0;
  return grouped ? `Aggregated view of ${source}` : `Query view of ${source}`;
}

function inferDescription(statement: SelectStatement): string {
  const grouped = statement.groupBy.length > 0;
  const joined = statement.joins.length > 0;
  const parts = [
    grouped ? "Grouped analytical query" : "Ungrouped query",
    joined ? "with joins" : "without joins",
  ];
  return parts.join(" ");
}

function presentField(label: string): string {
  if (label.includes("(") || label === "*") {
    return label;
  }

  const parts = label.split(".");
  return parts[parts.length - 1];
}
