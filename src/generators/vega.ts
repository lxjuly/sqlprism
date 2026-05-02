import type { SelectStatement } from "../ast/statement";
import { getProjectionMetadata } from "../analysis/metadata";

export interface VegaLiteSpec {
  mark: string;
  encoding: Record<string, unknown>;
  data?: Record<string, unknown>;
}

export function generateVegaLite(statement: SelectStatement): VegaLiteSpec {
  const projections = getProjectionMetadata(statement);
  const dimensions = projections.filter((projection) => !projection.isAggregate);
  const measures = projections.filter((projection) => projection.isAggregate);

  const mark = chooseMark(statement, dimensions.length, measures.length);
  const encoding: Record<string, unknown> = {};

  if (dimensions[0]) {
    encoding.x = {
      field: dimensions[0].label,
      type: inferFieldType(dimensions[0].label),
    };
  }

  if (measures[0]) {
    encoding.y = {
      field: measures[0].label,
      type: "quantitative",
    };
  } else if (dimensions[1]) {
    encoding.y = {
      field: dimensions[1].label,
      type: inferFieldType(dimensions[1].label),
    };
  }

  if (dimensions[1] && measures[0]) {
    encoding.color = {
      field: dimensions[1].label,
      type: inferFieldType(dimensions[1].label),
    };
  }

  return {
    mark,
    encoding,
    data: statement.from
      ? {
          name: statement.from.alias ?? statement.from.name.join("."),
        }
      : undefined,
  };
}

function chooseMark(
  statement: SelectStatement,
  dimensionCount: number,
  measureCount: number,
): string {
  if (statement.groupBy.length > 0 && measureCount > 0) {
    return "bar";
  }

  if (dimensionCount > 0 && measureCount > 0 && /date|time/i.test(statement.projections[0]?.alias ?? "")) {
    return "line";
  }

  return "point";
}

function inferFieldType(label: string): "nominal" | "temporal" {
  return /date|time/i.test(label) ? "temporal" : "nominal";
}
