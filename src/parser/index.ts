import type { SelectStatement } from "../ast/statement";
import { Parser } from "./parser";
import { Scanner } from "./scanner";
import type { Token } from "./token";

export interface ParseOptions {
  dialect?: string;
  errorLevel?: "raise" | "collect";
}

export function scan(sql: string): Token[] {
  const scanner = new Scanner(sql);
  return scanner.scanTokens();
}

export function parse(sql: string, _options: ParseOptions = {}): SelectStatement[] {
  const parser = new Parser(scan(sql));
  return parser.parse();
}

export function parseOne(sql: string, _options: ParseOptions = {}): SelectStatement {
  const parser = new Parser(scan(sql));
  return parser.parseOne();
}
