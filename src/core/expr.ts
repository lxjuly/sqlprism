import type { Token } from "./token";

export interface Visitor<R> {
  visitSelectExpr(expr: Select): R;
  visitGroupingExpr(expr: Grouping): R;
  visitLiteralExpr(expr: Literal): R;
  visitIdentifierExpr(expr: Identifier): R;
}

export abstract class Expr {
  abstract accept<R>(visitor: Visitor<R>): R;
}

export class Select extends Expr {
  constructor(
    public readonly columns: Expr[],
    public readonly from: Identifier | null,
    public readonly where: Expr | null,
    public readonly groupBy: Expr[],
  ) {
    super();
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitSelectExpr(this);
  }
}

export class Grouping extends Expr {
  constructor(public readonly expression: Expr) {
    super();
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitGroupingExpr(this);
  }
}

export class Literal extends Expr {
  constructor(public readonly value: string | number | null) {
    super();
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitLiteralExpr(this);
  }
}

export class Identifier extends Expr {
  constructor(public readonly name: Token) {
    super();
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitIdentifierExpr(this);
  }
}
