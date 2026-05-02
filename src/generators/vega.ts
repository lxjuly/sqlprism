import type { SelectStatement } from "../ast/statement";
import { toSemanticQuery } from "../analysis/semantic-query";
import type { SemanticQuery, SemanticSelection } from "../semantic/model";

export interface VegaLiteSpec {
  $schema?: string;
  title?: string;
  mark: string;
  encoding: Record<string, unknown>;
  data?: Record<string, unknown>;
  description?: string;
}

export function generateVegaLite(statement: SelectStatement): VegaLiteSpec {
  return semanticQueryToVegaLite(toSemanticQuery(statement));
}

export function semanticQueryToVegaLite(query: SemanticQuery): VegaLiteSpec {
  const dimensions = query.selections.filter((selection) => selection.kind === "dimension");
  const measures = query.selections.filter((selection) => selection.kind === "measure");

  const mark = chooseMark(dimensions, measures);
  const encoding: Record<string, unknown> = {};
  const primaryDimension = dimensions[0];
  const secondaryDimension = dimensions[1];
  const primaryMeasure = measures[0];

  if (primaryDimension) {
    encoding.x = {
      field: presentField(primaryDimension.label),
      type: inferFieldType(primaryDimension.label, false),
      sort: inferSort(query, primaryDimension.label),
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

  encoding.tooltip = query.selections.map((selection) => ({
    field: presentField(selection.label),
    type: inferFieldType(selection.label, selection.kind === "measure"),
    title: presentField(selection.label),
  }));

  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: inferTitle(query),
    description: inferDescription(query),
    mark,
    encoding,
    data: query.source
      ? {
          name: query.source.path,
        }
      : undefined,
  };
}

function chooseMark(
  dimensions: SemanticSelection[],
  measures: SemanticSelection[],
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
  query: SemanticQuery,
  label: string,
): string | undefined {
  const order = query.orderBy.find((item) => item.alias === label || presentField(item.expression) === label);

  if (!order) {
    return undefined;
  }

  return order.direction === "desc" ? "-x" : "x";
}

function inferTitle(query: SemanticQuery): string {
  const source = query.source?.path.split(".").at(-1) ?? "query";
  const grouped = query.groupBy.length > 0;
  return grouped ? `Aggregated view of ${source}` : `Query view of ${source}`;
}

function inferDescription(query: SemanticQuery): string {
  const grouped = query.groupBy.length > 0;
  const joined = query.joins.length > 0;
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
