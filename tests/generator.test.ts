import { describe, expect, it } from "vitest";
import {
  demoDataset,
  executeOsiQuery,
  getSourceBindings,
  generateDuckDbSql,
  generateOsi,
  generateVegaLite,
  parseOne,
  refract,
  resolveColumnSource,
  toSemanticQuery,
} from "../src";
import { analyticalQueries } from "./fixtures/queries";

describe("generators", () => {
  it("generates duckdb sql from parsed ast", () => {
    const ast = parseOne(analyticalQueries.groupedRevenue);

    expect(generateDuckDbSql(ast)).toBe(
      analyticalQueries.groupedRevenue,
    );
  });

  it("generates an osi-shaped semantic payload", () => {
    const ast = parseOne(
      "SELECT region, SUM(revenue) AS total_revenue FROM sales WHERE revenue > 100 GROUP BY region",
    );
    const osi = generateOsi(ast);

    expect(osi.source).toBe("sales");
    expect(osi.select[1].alias).toBe("total_revenue");
    expect(osi.filters[0].expression).toBe("sales.revenue > 100");
    expect(osi.groupBy).toEqual(["sales.region"]);
    expect(osi.select[1].aggregate?.function).toBe("sum");
  });

  it("generates a best-effort vega-lite spec", () => {
    const ast = parseOne(analyticalQueries.trendQuery);
    const spec = generateVegaLite(ast);

    expect(spec.mark).toBe("line");
    expect(spec.$schema).toContain("vega-lite");
    expect(spec.encoding.x).toEqual({
      field: "order_date",
      type: "temporal",
      sort: undefined,
      axis: { format: "%b %d" },
    });
    expect(spec.encoding.y).toEqual({
      field: "total_revenue",
      type: "quantitative",
      axis: { format: "~s" },
    });
  });

  it("uses bar charts for grouped categorical aggregates", () => {
    const ast = parseOne(analyticalQueries.groupedRevenue);
    const spec = generateVegaLite(ast);

    expect(spec.mark).toBe("bar");
    expect(spec.encoding.x).toEqual({
      field: "region",
      type: "nominal",
      sort: undefined,
      axis: undefined,
    });
    expect(spec.encoding.y).toEqual({
      field: "total_revenue",
      type: "quantitative",
      axis: { format: "~s" },
    });
  });

  it("keeps refract as a convenience wrapper", () => {
    const result = refract(analyticalQueries.groupedRevenue);

    expect(result.ast.type).toBe("select");
    expect(result.duckdb).toContain("GROUP BY sales.region");
    expect(result.osi?.source).toBe("sales");
    expect(result.vega?.mark).toBe("bar");
  });

  it("resolves source bindings for qualified and unqualified columns", () => {
    const ast = parseOne(analyticalQueries.joinedRevenue);
    const sources = getSourceBindings(ast);

    expect(sources.map((source) => source.visibleName)).toEqual(["o", "i", "s"]);

    const resolved = resolveColumnSource(ast, {
      type: "column",
      path: ["o", "user_id"],
      table: "o",
      name: "user_id",
    });

    expect(resolved?.source.path).toEqual(["orders"]);
  });

  it("executes osi payloads against the mock runtime", () => {
    const ast = parseOne(analyticalQueries.joinedRevenue);
    const osi = generateOsi(ast);
    const rows = executeOsiQuery(osi, demoDataset);

    expect(rows).toEqual([
      { user_id: "1", total: 5.5 },
      { user_id: "2", total: 3 },
    ]);
  });

  it("builds a semantic query model from analytical sql", () => {
    const ast = parseOne(analyticalQueries.groupedRevenue);
    const semantic = toSemanticQuery(ast);

    expect(semantic.source?.path).toBe("sales");
    expect(semantic.selections.map((selection) => selection.kind)).toEqual([
      "dimension",
      "measure",
    ]);
    expect(semantic.selections[1].aggregate?.function).toBe("sum");
    expect(semantic.groupBy).toEqual(["sales.region"]);
  });
});
