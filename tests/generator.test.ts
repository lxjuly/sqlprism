import { describe, expect, it } from "vitest";
import {
  generateDuckDbSql,
  generateOsi,
  generateVegaLite,
  parseOne,
  refract,
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
    expect(osi.filters).toEqual(["revenue > 100"]);
    expect(osi.groupBy).toEqual(["region"]);
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
    expect(result.duckdb).toContain("GROUP BY region");
    expect(result.osi?.source).toBe("sales");
    expect(result.vega?.mark).toBe("bar");
  });
});
