import { describe, expect, it } from "vitest";
import { parseOne } from "../src";
import { analyticalQueries } from "./fixtures/queries";

describe("parseOne", () => {
  it("parses grouped aggregates with aliases", () => {
    const ast = parseOne(analyticalQueries.groupedRevenue);

    expect(ast.type).toBe("select");
    expect(ast.projections).toHaveLength(2);
    expect(ast.projections[1].alias?.name).toBe("total_revenue");
    expect(ast.from?.path).toEqual(["sales"]);
    expect(ast.groupBy).toHaveLength(1);
    expect(ast.orderBy[0].direction).toBe("desc");
    expect(ast.limit).toBe(10);
  });

  it("parses joins and filters", () => {
    const ast = parseOne(analyticalQueries.joinedRevenue);

    expect(ast.joins).toHaveLength(2);
    expect(ast.joins[0].joinType).toBe("inner");
    expect(ast.joins[0].source.alias?.name).toBe("i");
    expect(ast.joins[1].source.alias?.name).toBe("s");
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

  it("keeps explicit table qualifiers in column expressions", () => {
    const ast = parseOne(analyticalQueries.joinedRevenue);
    const firstProjection = ast.projections[0].expression;

    expect(firstProjection.type).toBe("column");
    if (firstProjection.type === "column") {
      expect(firstProjection.table).toBe("o");
      expect(firstProjection.name).toBe("user_id");
    }
  });
});
