import { KEYWORDS, TokenType, type LiteralValue, type Token } from "./token";

export class Scanner {
  private readonly tokens: Token[] = [];
  private start = 0;
  private current = 0;
  private line = 1;
  private lineStart = 0;

  constructor(private readonly source: string) {}

  scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(this.makeToken(TokenType.EOF, ""));
    return this.tokens;
  }

  private scanToken(): void {
    const char = this.advance();

    switch (char) {
      case "(":
        this.addToken(TokenType.LEFT_PAREN);
        break;
      case ")":
        this.addToken(TokenType.RIGHT_PAREN);
        break;
      case ",":
        this.addToken(TokenType.COMMA);
        break;
      case ".":
        this.addToken(TokenType.DOT);
        break;
      case "*":
        this.addToken(TokenType.STAR);
        break;
      case "+":
        this.addToken(TokenType.PLUS);
        break;
      case "-":
        if (this.match("-")) {
          this.skipLineComment();
        } else {
          this.addToken(TokenType.MINUS);
        }
        break;
      case "/":
        this.addToken(TokenType.SLASH);
        break;
      case "%":
        this.addToken(TokenType.PERCENT);
        break;
      case ";":
        this.addToken(TokenType.SEMICOLON);
        break;
      case "=":
        this.addToken(TokenType.EQUAL);
        break;
      case "!":
        if (this.match("=")) {
          this.addToken(TokenType.BANG_EQUAL);
        } else {
          throw new Error(`Unexpected character "!" at line ${this.line}.`);
        }
        break;
      case ">":
        this.addToken(this.match("=") ? TokenType.GREATER_EQUAL : TokenType.GREATER);
        break;
      case "<":
        this.addToken(this.match("=") ? TokenType.LESS_EQUAL : TokenType.LESS);
        break;
      case " ":
      case "\r":
      case "\t":
        break;
      case "\n":
        this.line += 1;
        this.lineStart = this.current;
        break;
      case "'":
        this.string("'");
        break;
      case "\"":
      case "`":
        this.quotedIdentifier(char);
        break;
      default:
        if (this.isDigit(char)) {
          this.number();
        } else if (this.isAlpha(char)) {
          this.identifier();
        } else {
          throw new Error(`Unexpected character "${char}" at line ${this.line}.`);
        }
    }
  }

  private identifier(): void {
    while (this.isAlphaNumeric(this.peek())) {
      this.advance();
    }

    const lexeme = this.source.slice(this.start, this.current);
    const type = KEYWORDS.get(lexeme.toLowerCase()) ?? TokenType.IDENTIFIER;
    this.addToken(type);
  }

  private quotedIdentifier(quote: string): void {
    while (this.peek() !== quote && !this.isAtEnd()) {
      if (this.peek() === "\n") {
        this.line += 1;
        this.lineStart = this.current + 1;
      }
      this.advance();
    }

    if (this.isAtEnd()) {
      throw new Error(`Unterminated quoted identifier at line ${this.line}.`);
    }

    this.advance();
    const value = this.source.slice(this.start + 1, this.current - 1);
    this.addToken(TokenType.IDENTIFIER, value);
  }

  private number(): void {
    while (this.isDigit(this.peek())) {
      this.advance();
    }

    if (this.peek() === "." && this.isDigit(this.peekNext())) {
      this.advance();
      while (this.isDigit(this.peek())) {
        this.advance();
      }
    }

    this.addToken(
      TokenType.NUMBER,
      Number(this.source.slice(this.start, this.current)),
    );
  }

  private string(quote: string): void {
    while (this.peek() !== quote && !this.isAtEnd()) {
      if (this.peek() === "\n") {
        this.line += 1;
        this.lineStart = this.current + 1;
      }
      this.advance();
    }

    if (this.isAtEnd()) {
      throw new Error(`Unterminated string at line ${this.line}.`);
    }

    this.advance();
    const value = this.source.slice(this.start + 1, this.current - 1);
    this.addToken(TokenType.STRING, value);
  }

  private skipLineComment(): void {
    while (this.peek() !== "\n" && !this.isAtEnd()) {
      this.advance();
    }
  }

  private addToken(type: TokenType, literal: LiteralValue = null): void {
    this.tokens.push(this.makeToken(type, this.source.slice(this.start, this.current), literal));
  }

  private makeToken(
    type: TokenType,
    lexeme: string,
    literal: LiteralValue = null,
  ): Token {
    return {
      type,
      lexeme,
      literal,
      line: this.line,
      column: this.start - this.lineStart + 1,
    };
  }

  private advance(): string {
    return this.source[this.current++] ?? "";
  }

  private match(expected: string): boolean {
    if (this.isAtEnd() || this.source[this.current] !== expected) {
      return false;
    }

    this.current += 1;
    return true;
  }

  private peek(): string {
    return this.source[this.current] ?? "\0";
  }

  private peekNext(): string {
    return this.source[this.current + 1] ?? "\0";
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  private isDigit(char: string): boolean {
    return char >= "0" && char <= "9";
  }

  private isAlpha(char: string): boolean {
    return (
      (char >= "a" && char <= "z") ||
      (char >= "A" && char <= "Z") ||
      char === "_"
    );
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }
}
