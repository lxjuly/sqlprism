import { Grouping, Identifier, Literal, Select, type Expr } from "./expr";
import { TokenType, type Token } from "./token";

export class Parser {
  private current = 0;

  constructor(private readonly tokens: Token[]) {}

  parse(): Select {
    return this.parseSelect();
  }

  parseSelect(): Select {
    this.consume(TokenType.SELECT, "Expected SELECT at the start of the query.");

    const columns = this.parseProjectionList();
    let from: Identifier | null = null;
    let where: Expr | null = null;
    const groupBy: Expr[] = [];

    if (this.match(TokenType.FROM)) {
      from = new Identifier(this.consume(TokenType.IDENTIFIER, "Expected table name after FROM."));
    }

    if (this.match(TokenType.WHERE)) {
      where = this.expression();
    }

    if (this.match(TokenType.GROUP)) {
      this.consume(TokenType.BY, "Expected BY after GROUP.");
      groupBy.push(...this.parseExpressionList());
    }

    this.consume(TokenType.EOF, "Expected end of query.");
    return new Select(columns, from, where, groupBy);
  }

  expression(): Expr {
    return this.primary();
  }

  equality(): Expr {
    return this.primary();
  }

  primary(): Expr {
    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      return new Literal(this.previous().literal);
    }

    if (this.match(TokenType.IDENTIFIER)) {
      return new Identifier(this.previous());
    }

    if (this.match(TokenType.LEFT_PAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expected ')' after expression.");
      return new Grouping(expr);
    }

    throw new Error(`Expected expression at token ${this.peek().lexeme || this.peek().type}.`);
  }

  private parseProjectionList(): Expr[] {
    if (this.match(TokenType.STAR)) {
      return [new Identifier(this.previous())];
    }

    return this.parseExpressionList();
  }

  private parseExpressionList(): Expr[] {
    const expressions: Expr[] = [this.expression()];

    while (this.match(TokenType.COMMA)) {
      expressions.push(this.expression());
    }

    return expressions;
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }

    return false;
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) {
      return this.advance();
    }

    throw new Error(message);
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) {
      return type === TokenType.EOF;
    }

    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) {
      this.current += 1;
    }

    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }
}
