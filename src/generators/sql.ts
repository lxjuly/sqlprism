import type { SqlExpression } from "../ast/expression";
import type {
  JoinClause,
  OrderByItem,
  SelectItem,
  SelectStatement,
  TableSource,
} from "../ast/statement";

export interface GenerateSqlOptions {
  dialect?: string;
}

export function generateSql(
  statement: SelectStatement,
  _options: GenerateSqlOptions = {},
): string {
  const parts: string[] = [];

  parts.push(`SELECT ${statement.projections.map(generateSelectItem).join(", ")}`);

  if (statement.from) {
    parts.push(`FROM ${generateTableSource(statement.from)}`);
  }

  for (const join of statement.joins) {
    parts.push(generateJoin(join));
  }

  if (statement.where) {
    parts.push(`WHERE ${generateExpression(statement.where)}`);
  }

  if (statement.groupBy.length > 0) {
    parts.push(`GROUP BY ${statement.groupBy.map(generateExpression).join(", ")}`);
  }

  if (statement.orderBy.length > 0) {
    parts.push(`ORDER BY ${statement.orderBy.map(generateOrderByItem).join(", ")}`);
  }

  if (statement.limit !== null) {
    parts.push(`LIMIT ${statement.limit}`);
  }

  return parts.join(" ");
}

export function generateExpression(expression: SqlExpression): string {
  switch (expression.type) {
    case "column":
      return expression.path.join(".");
    case "literal":
      if (expression.value === null) {
        return "NULL";
      }
      return typeof expression.value === "string"
        ? `'${expression.value.replace(/'/g, "''")}'`
        : String(expression.value);
    case "call":
      return `${expression.callee}(${expression.args.map(generateExpression).join(", ")})`;
    case "binary":
      return `${generateExpression(expression.left)} ${expression.operator} ${generateExpression(expression.right)}`;
    case "unary":
      return `${expression.operator} ${generateExpression(expression.operand)}`;
    case "group":
      return `(${generateExpression(expression.expression)})`;
    case "star":
      return expression.table ? `${expression.table}.*` : "*";
  }
}

function generateSelectItem(item: SelectItem): string {
  const expression = generateExpression(item.expression);
  return item.alias ? `${expression} AS ${item.alias.name}` : expression;
}

function generateTableSource(source: TableSource): string {
  const name = source.path.join(".");
  return source.alias ? `${name} AS ${source.alias.name}` : name;
}

function generateJoin(join: JoinClause): string {
  const keyword = `${join.joinType.toUpperCase()} JOIN`;
  const source = generateTableSource(join.source);
  return join.on ? `${keyword} ${source} ON ${generateExpression(join.on)}` : `${keyword} ${source}`;
}

function generateOrderByItem(item: OrderByItem): string {
  return `${generateExpression(item.expression)} ${item.direction.toUpperCase()}`;
}
