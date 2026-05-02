import { KEYWORDS, TokenType, type LiteralValue, type Token } from "./token";

export class Scanner {
  private readonly tokens: Token[] = [];
  private start = 0;
  private current = 0;
  private line = 1;

  constructor(private readonly source: string) {}

  scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push({
      type: TokenType.EOF,
      lexeme: "",
      literal: null,
      line: this.line,
    });

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
      case "=":
        this.addToken(TokenType.EQUAL);
        break;
      case ">":
        this.addToken(TokenType.GREATER);
        break;
      case "<":
        this.addToken(TokenType.LESS);
        break;
      case " ":
      case "\r":
      case "\t":
        break;
      case "\n":
        this.line += 1;
        break;
      case "'":
        this.string();
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

    const text = this.source.slice(this.start, this.current);
    const type = KEYWORDS.get(text.toLowerCase()) ?? TokenType.IDENTIFIER;
    this.addToken(type);
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

    const value = Number(this.source.slice(this.start, this.current));
    this.addToken(TokenType.NUMBER, value);
  }

  private string(): void {
    while (this.peek() !== "'" && !this.isAtEnd()) {
      if (this.peek() === "\n") {
        this.line += 1;
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

  private addToken(type: TokenType, literal: LiteralValue = null): void {
    this.tokens.push({
      type,
      lexeme: this.source.slice(this.start, this.current),
      literal,
      line: this.line,
    });
  }

  private advance(): string {
    return this.source[this.current++] ?? "";
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  private peek(): string {
    if (this.isAtEnd()) {
      return "\0";
    }

    return this.source[this.current];
  }

  private peekNext(): string {
    if (this.current + 1 >= this.source.length) {
      return "\0";
    }

    return this.source[this.current + 1];
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
