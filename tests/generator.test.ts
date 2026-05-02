import { describe, expect, it } from "vitest";
import {
  getSourceBindings,
  generateDuckDbSql,
  generateOsi,
  generateVegaLite,
  parseOne,
  refract,
  resolveColumnSource,
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
    expect(osi.filters).toEqual(["sales.revenue > 100"]);
    expect(osi.groupBy).toEqual(["sales.region"]);
  });

  it("generates a best-effort vega-lite spec", () => {
    const ast = parseOne(analyticalQueries.trendQuery);
    const spec = generateVegaLite(ast);

    expect(spec.mark).toBe("bar");
    expect(spec.encoding.x).toEqual({
      field: "order_date",
      type: "temporal",
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

    expect(sources.map((source) => source.visibleName)).toEqual(["o", "s"]);

    const resolved = resolveColumnSource(ast, {
      type: "column",
      path: ["o", "user_id"],
      table: "o",
      name: "user_id",
    });

    expect(resolved?.source.path).toEqual(["orders"]);
  });
});
