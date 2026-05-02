# SQLPrism API Draft

## Design Goals

- AST-first
- explicit parse step
- explicit generator step
- convenience wrapper for common use

## Proposed API

```ts
import {
  parse,
  parseOne,
  toSemanticQuery,
  generateSql,
  generateDuckDbSql,
  generateOsi,
  generateVegaLite,
  refract,
} from "sqlprism";
```

## Parse APIs

```ts
const statements = parse(sql, { dialect: "ansi" });
const ast = parseOne(sql, { dialect: "duckdb" });
```

### Parse Options

```ts
type ParseOptions = {
  dialect?: string;
  errorLevel?: "raise" | "collect";
};
```

## Generator APIs

```ts
const duckdbSql = generateDuckDbSql(ast);
const sql = generateSql(ast, { dialect: "duckdb" });
const semantic = toSemanticQuery(ast);
const osi = generateOsi(ast);
const vega = generateVegaLite(ast);
```

## Convenience API

```ts
const result = refract(sql, {
  read: "duckdb",
  outputs: ["ast", "duckdb", "osi", "vega"],
});
```

### Convenience Result

```ts
type RefractResult = {
  ast: SqlStatement;
  duckdb?: string;
  osi?: OsiQuery;
  vega?: VegaLiteSpec;
  errors?: ParseIssue[];
};
```

## AST Utility APIs

These do not need to exist immediately, but the spec should leave room for them:

```ts
walk(ast, visitor);
transform(ast, mapper);
findAll(ast, "Column");
qualify(ast, schema);
```

## Rationale

This API shape follows the same general lessons visible in SQLGlot:

- parsing is a first-class operation
- AST traversal is a first-class operation
- generation is distinct from parsing
- convenience helpers are layered on top

SQLPrism now also treats the semantic query model as a first-class layer between AST and downstream generators.
