import type { Token } from "./token";

export interface ParseIssue {
  message: string;
  line: number;
  column: number;
  token: string;
}

export class ParseError extends Error {
  readonly issue: ParseIssue;

  constructor(message: string, token: Token) {
    super(message);
    this.name = "ParseError";
    this.issue = {
      message,
      line: token.line,
      column: token.column,
      token: token.lexeme || token.type,
    };
  }
}
