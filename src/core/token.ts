export enum TokenType {
  SELECT = "SELECT",
  FROM = "FROM",
  WHERE = "WHERE",
  GROUP = "GROUP",
  BY = "BY",
  AS = "AS",
  IDENTIFIER = "IDENTIFIER",
  NUMBER = "NUMBER",
  STRING = "STRING",
  COMMA = "COMMA",
  DOT = "DOT",
  LEFT_PAREN = "LEFT_PAREN",
  RIGHT_PAREN = "RIGHT_PAREN",
  EQUAL = "EQUAL",
  GREATER = "GREATER",
  LESS = "LESS",
  STAR = "STAR",
  EOF = "EOF",
}

export type LiteralValue = number | string | null;

export interface Token {
  type: TokenType;
  lexeme: string;
  literal: LiteralValue;
  line: number;
}

export const KEYWORDS = new Map<string, TokenType>([
  ["select", TokenType.SELECT],
  ["from", TokenType.FROM],
  ["where", TokenType.WHERE],
  ["group", TokenType.GROUP],
  ["by", TokenType.BY],
  ["as", TokenType.AS],
]);
