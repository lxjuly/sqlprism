import type { SqlExpression } from "../ast/expression";
import type {
  JoinClause,
  OrderByItem,
  SqlAlias,
  SelectItem,
  SelectStatement,
  TableSource,
} from "../ast/statement";
import { ParseError } from "./errors";
import { TokenType, type Token } from "./token";

export class Parser {
  private current = 0;

  constructor(private readonly tokens: Token[]) {}

  parse(): SelectStatement[] {
    const statements: SelectStatement[] = [];

    while (!this.isAtEnd()) {
      if (this.match(TokenType.SEMICOLON)) {
        continue;
      }

      statements.push(this.parseSelectStatement());

      if (this.match(TokenType.SEMICOLON)) {
        continue;
      }
    }

    return statements;
  }

  parseOne(): SelectStatement {
    const statements = this.parse();
    if (statements.length === 0) {
      throw new ParseError("Expected a SQL statement.", this.peek());
    }
    return statements[0];
  }

  private parseSelectStatement(): SelectStatement {
    this.consume(TokenType.SELECT, "Expected SELECT at the start of the statement.");

    const projections = this.parseProjectionList();
    const from = this.match(TokenType.FROM) ? this.parseTableSource() : null;
    const joins = this.parseJoins();
    const where = this.match(TokenType.WHERE) ? this.parseExpression() : null;
    const groupBy = this.match(TokenType.GROUP)
      ? this.parseGroupByClause()
      : [];
    const orderBy = this.match(TokenType.ORDER)
      ? this.parseOrderByClause()
      : [];
    const limit = this.match(TokenType.LIMIT) ? this.parseLimitClause() : null;

    return {
      type: "select",
      projections,
      from,
      joins,
      where,
      groupBy,
      orderBy,
      limit,
    };
  }

  private parseProjectionList(): SelectItem[] {
    const projections: SelectItem[] = [this.parseSelectItem()];

    while (this.match(TokenType.COMMA)) {
      projections.push(this.parseSelectItem());
    }

    return projections;
  }

  private parseSelectItem(): SelectItem {
    const expression = this.parseExpression();
    let alias: SqlAlias | null = null;

    if (this.match(TokenType.AS)) {
      alias = this.parseAlias("Expected alias after AS.");
    } else if (this.canReadImplicitAlias()) {
      alias = this.parseAlias("Expected alias.");
    }

    return { expression, alias };
  }

  private parseTableSource(): TableSource {
    const path = this.parseIdentifierPath("Expected table name after FROM.");
    let alias: SqlAlias | null = null;

    if (this.match(TokenType.AS)) {
      alias = this.parseAlias("Expected alias after AS.");
    } else if (this.canReadImplicitAlias()) {
      alias = this.parseAlias("Expected alias.");
    }

    return {
      type: "table",
      path,
      alias,
    };
  }

  private parseJoins(): JoinClause[] {
    const joins: JoinClause[] = [];

    while (true) {
      const joinType = this.parseJoinType();
      if (!joinType) {
        break;
      }

      const source = this.parseTableSource();
      const on = joinType === "cross"
        ? null
        : this.match(TokenType.ON)
          ? this.parseExpression()
          : null;

      joins.push({
        type: "join",
        joinType,
        source,
        on,
      });
    }

    return joins;
  }

  private parseJoinType(): JoinClause["joinType"] | null {
    if (this.match(TokenType.JOIN)) {
      return "inner";
    }

    if (this.match(TokenType.INNER)) {
      this.consume(TokenType.JOIN, "Expected JOIN after INNER.");
      return "inner";
    }

    if (this.match(TokenType.LEFT)) {
      this.match(TokenType.OUTER);
      this.consume(TokenType.JOIN, "Expected JOIN after LEFT.");
      return "left";
    }

    if (this.match(TokenType.RIGHT)) {
      this.match(TokenType.OUTER);
      this.consume(TokenType.JOIN, "Expected JOIN after RIGHT.");
      return "right";
    }

    if (this.match(TokenType.FULL)) {
      this.match(TokenType.OUTER);
      this.consume(TokenType.JOIN, "Expected JOIN after FULL.");
      return "full";
    }

    if (this.match(TokenType.CROSS)) {
      this.consume(TokenType.JOIN, "Expected JOIN after CROSS.");
      return "cross";
    }

    return null;
  }

  private parseGroupByClause(): SqlExpression[] {
    this.consume(TokenType.BY, "Expected BY after GROUP.");
    return this.parseExpressionList();
  }

  private parseOrderByClause(): OrderByItem[] {
    this.consume(TokenType.BY, "Expected BY after ORDER.");
    const orderBy: OrderByItem[] = [this.parseOrderByItem()];

    while (this.match(TokenType.COMMA)) {
      orderBy.push(this.parseOrderByItem());
    }

    return orderBy;
  }

  private parseOrderByItem(): OrderByItem {
    const expression = this.parseExpression();
    let direction: "asc" | "desc" = "asc";

    if (this.match(TokenType.ASC)) {
      direction = "asc";
    } else if (this.match(TokenType.DESC)) {
      direction = "desc";
    }

    return { expression, direction };
  }

  private parseLimitClause(): number {
    const token = this.consume(TokenType.NUMBER, "Expected numeric LIMIT value.");
    return Number(token.literal);
  }

  private parseExpressionList(): SqlExpression[] {
    const expressions: SqlExpression[] = [this.parseExpression()];

    while (this.match(TokenType.COMMA)) {
      expressions.push(this.parseExpression());
    }

    return expressions;
  }

  private parseExpression(): SqlExpression {
    return this.parseOr();
  }

  private parseOr(): SqlExpression {
    let expression = this.parseAnd();

    while (this.match(TokenType.OR)) {
      expression = {
        type: "binary",
        operator: "OR",
        left: expression,
        right: this.parseAnd(),
      };
    }

    return expression;
  }

  private parseAnd(): SqlExpression {
    let expression = this.parseEquality();

    while (this.match(TokenType.AND)) {
      expression = {
        type: "binary",
        operator: "AND",
        left: expression,
        right: this.parseEquality(),
      };
    }

    return expression;
  }

  private parseEquality(): SqlExpression {
    let expression = this.parseComparison();

    while (this.match(TokenType.EQUAL, TokenType.BANG_EQUAL)) {
      expression = {
        type: "binary",
        operator: this.previous().type === TokenType.EQUAL ? "=" : "!=",
        left: expression,
        right: this.parseComparison(),
      };
    }

    return expression;
  }

  private parseComparison(): SqlExpression {
    let expression = this.parseTerm();

    while (
      this.match(
        TokenType.GREATER,
        TokenType.GREATER_EQUAL,
        TokenType.LESS,
        TokenType.LESS_EQUAL,
      )
    ) {
      const operator = this.comparisonOperator(this.previous().type);
      expression = {
        type: "binary",
        operator,
        left: expression,
        right: this.parseTerm(),
      };
    }

    return expression;
  }

  private parseTerm(): SqlExpression {
    let expression = this.parseFactor();

    while (this.match(TokenType.PLUS, TokenType.MINUS)) {
      expression = {
        type: "binary",
        operator: this.previous().type === TokenType.PLUS ? "+" : "-",
        left: expression,
        right: this.parseFactor(),
      };
    }

    return expression;
  }

  private parseFactor(): SqlExpression {
    let expression = this.parseUnary();

    while (this.match(TokenType.STAR, TokenType.SLASH, TokenType.PERCENT)) {
      const operator =
        this.previous().type === TokenType.STAR
          ? "*"
          : this.previous().type === TokenType.SLASH
            ? "/"
            : "%";
      expression = {
        type: "binary",
        operator,
        left: expression,
        right: this.parseUnary(),
      };
    }

    return expression;
  }

  private parseUnary(): SqlExpression {
    if (this.match(TokenType.NOT, TokenType.MINUS)) {
      return {
        type: "unary",
        operator: this.previous().type === TokenType.NOT ? "NOT" : "-",
        operand: this.parseUnary(),
      };
    }

    return this.parsePrimary();
  }

  private parsePrimary(): SqlExpression {
    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      return {
        type: "literal",
        value: this.previous().literal,
      };
    }

    if (this.match(TokenType.NULL)) {
      return {
        type: "literal",
        value: null,
      };
    }

    if (this.match(TokenType.STAR)) {
      return { type: "star", table: null };
    }

    if (this.match(TokenType.LEFT_PAREN)) {
      const expression = this.parseExpression();
      this.consume(TokenType.RIGHT_PAREN, "Expected ')' after expression.");
      return {
        type: "group",
        expression,
      };
    }

    if (this.check(TokenType.IDENTIFIER)) {
      return this.parseIdentifierExpression();
    }

    throw new ParseError("Expected expression.", this.peek());
  }

  private parseIdentifierExpression(): SqlExpression {
    const parts = this.parseIdentifierPath("Expected identifier.");

    if (parts.length > 0 && this.match(TokenType.DOT) && this.match(TokenType.STAR)) {
      return {
        type: "star",
        table: parts.join("."),
      };
    }

    if (this.match(TokenType.LEFT_PAREN)) {
      const args: SqlExpression[] = [];

      if (!this.check(TokenType.RIGHT_PAREN)) {
        args.push(this.parseExpression());
        while (this.match(TokenType.COMMA)) {
          args.push(this.parseExpression());
        }
      }

      this.consume(TokenType.RIGHT_PAREN, "Expected ')' after function arguments.");
      return {
        type: "call",
        callee: parts.join("."),
        args,
      };
    }

    return {
      type: "column",
      path: parts,
      table: parts.length > 1 ? parts.slice(0, -1).join(".") : null,
      name: parts[parts.length - 1],
    };
  }

  private parseIdentifierPath(message: string): string[] {
    const parts: string[] = [this.consumeIdentifier(message)];

    while (this.match(TokenType.DOT)) {
      parts.push(this.consumeIdentifier("Expected identifier after '.'."));
    }

    return parts;
  }

  private consumeIdentifier(message: string): string {
    const token = this.consume(TokenType.IDENTIFIER, message);
    return token.literal?.toString() ?? token.lexeme;
  }

  private parseAlias(message: string): SqlAlias {
    return {
      name: this.consumeIdentifier(message),
    };
  }

  private canReadImplicitAlias(): boolean {
    const next = this.peek();
    return next.type === TokenType.IDENTIFIER;
  }

  private comparisonOperator(type: TokenType): string {
    switch (type) {
      case TokenType.GREATER:
        return ">";
      case TokenType.GREATER_EQUAL:
        return ">=";
      case TokenType.LESS:
        return "<";
      case TokenType.LESS_EQUAL:
        return "<=";
      default:
        throw new ParseError("Expected comparison operator.", this.previous());
    }
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

    throw new ParseError(message, this.peek());
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
