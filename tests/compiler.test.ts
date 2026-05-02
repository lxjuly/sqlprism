import { describe, expect, it } from "vitest";
import { refract } from "../src";

describe("refract", () => {
  it("returns placeholder refracted outputs for a simple query", () => {
    const sql = "SELECT region FROM sales GROUP BY region";
    const result = refract(sql);

    expect(result.osi.source).toBe("sales");
    expect(result.osi.select).toContain("region");
    expect(result.vega.mark).toBe("bar");
  });
});
