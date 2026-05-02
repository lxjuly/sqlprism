import { Parser } from "./core/parser";
import { Scanner } from "./core/scanner";
import { OsiRefractor, type OsiPayload } from "./refractors/osi";
import { VegaRefractor, type VegaSpec } from "./refractors/vega";

export interface RefractResult {
  vega: VegaSpec;
  osi: OsiPayload;
}

export function refract(sql: string): RefractResult {
  const scanner = new Scanner(sql);
  const tokens = scanner.scanTokens();
  const parser = new Parser(tokens);
  const ast = parser.parse();

  return {
    vega: ast.accept(new VegaRefractor()),
    osi: ast.accept(new OsiRefractor()) as OsiPayload,
  };
}
