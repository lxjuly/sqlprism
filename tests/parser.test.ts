import { describe, expect, it } from "vitest";
import { parseOne } from "../src";
import { analyticalQueries } from "./fixtures/queries";

describe("parseOne", () => {
  it("parses grouped aggregates with aliases", () => {
    const ast = parseOne(analyticalQueries.groupedRevenue);

    expect(ast.type).toBe("select");
    expect(ast.projections).toHaveLength(2);
    expect(ast.projections[1].alias).toBe("total_revenue");
    expect(ast.from?.name).toEqual(["sales"]);
    expect(ast.groupBy).toHaveLength(1);
    expect(ast.orderBy[0].direction).toBe("desc");
    expect(ast.limit).toBe(10);
  });

  it("parses joins and filters", () => {
    const ast = parseOne(analyticalQueries.joinedRevenue);

    expect(ast.joins).toHaveLength(1);
    expect(ast.joins[0].joinType).toBe("inner");
    expect(ast.where?.type).toBe("binary");
    expect(ast.groupBy).toHaveLength(1);
  });

  it("preserves expression shape for arithmetic filters", () => {
    const ast = parseOne(analyticalQueries.arithmeticFilter);

    expect(ast.where?.type).toBe("binary");
    if (ast.where?.type === "binary") {
      expect(ast.where.left.type).toBe("binary");
      expect(ast.where.operator).toBe(">");
    }
  });
});
