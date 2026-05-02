export enum TokenType {
  SELECT = "SELECT",
  FROM = "FROM",
  WHERE = "WHERE",
  GROUP = "GROUP",
  BY = "BY",
  ORDER = "ORDER",
  LIMIT = "LIMIT",
  AS = "AS",
  JOIN = "JOIN",
  INNER = "INNER",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
  FULL = "FULL",
  OUTER = "OUTER",
  CROSS = "CROSS",
  ON = "ON",
  ASC = "ASC",
  DESC = "DESC",
  AND = "AND",
  OR = "OR",
  NOT = "NOT",
  NULL = "NULL",
  IDENTIFIER = "IDENTIFIER",
  NUMBER = "NUMBER",
  STRING = "STRING",
  COMMA = "COMMA",
  DOT = "DOT",
  LEFT_PAREN = "LEFT_PAREN",
  RIGHT_PAREN = "RIGHT_PAREN",
  EQUAL = "EQUAL",
  BANG_EQUAL = "BANG_EQUAL",
  GREATER = "GREATER",
  GREATER_EQUAL = "GREATER_EQUAL",
  LESS = "LESS",
  LESS_EQUAL = "LESS_EQUAL",
  PLUS = "PLUS",
  MINUS = "MINUS",
  SLASH = "SLASH",
  PERCENT = "PERCENT",
  STAR = "STAR",
  SEMICOLON = "SEMICOLON",
  EOF = "EOF",
}

export type LiteralValue = number | string | null;

export interface Token {
  type: TokenType;
  lexeme: string;
  literal: LiteralValue;
  line: number;
  column: number;
}

export const KEYWORDS = new Map<string, TokenType>([
  ["select", TokenType.SELECT],
  ["from", TokenType.FROM],
  ["where", TokenType.WHERE],
  ["group", TokenType.GROUP],
  ["by", TokenType.BY],
  ["order", TokenType.ORDER],
  ["limit", TokenType.LIMIT],
  ["as", TokenType.AS],
  ["join", TokenType.JOIN],
  ["inner", TokenType.INNER],
  ["left", TokenType.LEFT],
  ["right", TokenType.RIGHT],
  ["full", TokenType.FULL],
  ["outer", TokenType.OUTER],
  ["cross", TokenType.CROSS],
  ["on", TokenType.ON],
  ["asc", TokenType.ASC],
  ["desc", TokenType.DESC],
  ["and", TokenType.AND],
  ["or", TokenType.OR],
  ["not", TokenType.NOT],
  ["null", TokenType.NULL],
]);
