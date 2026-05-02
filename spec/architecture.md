# SQLPrism Architecture

## Core Model

SQLPrism should follow a staged pipeline:

```text
SQL string
  -> scanner
  -> parser
  -> normalized AST
  -> analysis / transforms
  -> target generators
```

This separation matters because parsing should happen once, while generation may happen many times.

## AST Strategy

The AST should be:

- dialect-aware at parse time
- dialect-neutral in its core representation where possible
- explicit enough to regenerate SQL
- structured enough to support semantic generation

Like SQLGlot, SQLPrism should prefer a single shared expression system rather than separate ASTs for each output target.

## Dialect Strategy

There should be a baseline dialect and a growing set of dialect adapters.

- `ansi` can be the initial default parse target
- `duckdb` should be an early supported dialect because it is both an input and output target
- future dialect support should extend tokenization, parsing rules, and SQL generation without changing the core AST contract

## Generator Strategy

### SQL Generator

The SQL generator turns AST back into SQL. This is the foundation for dialect transpilation and DuckDB output.

### DuckDB Generator

DuckDB generation is a specialized SQL generation mode that emits syntactically correct DuckDB SQL.

### OSI Generator

The OSI generator should map query intent into a semantic payload. It will likely depend on:

- projection analysis
- aggregation analysis
- filter extraction
- grouping metadata

### Vega-Lite Generator

The Vega-Lite generator should infer chart structure from query semantics, not just syntax. It will likely depend on:

- dimensions vs measures
- aggregation presence
- grouping cardinality hints
- date/time vs categorical fields
- sort and limit cues

## Analysis Layer

Raw AST traversal is not enough for all downstream tasks.

SQLPrism should eventually include a semantic analysis layer similar in spirit to SQLGlot’s traversal and scope tools:

- source resolution
- column lineage
- aggregation context detection
- normalization / qualification

This is especially important for Vega-Lite and OSI generation, where output quality depends on understanding what the query means, not only what tokens appear in it.

## Errors

Parser errors should be structured objects instead of plain strings.

At minimum, parse errors should capture:

- message
- line
- column
- source context
- highlighted token or range

This follows a useful pattern from SQLGlot and will make the library much easier to debug and test.

## Suggested Public APIs

The API should separate parsing from generation:

```ts
const ast = parseOne(sql, { dialect: "duckdb" });
const duckdb = generateSql(ast, { dialect: "duckdb" });
const osi = generateOsi(ast);
const vega = generateVegaLite(ast);
```

A convenience API can still exist:

```ts
const result = refract(sql, { read: "duckdb" });
```

But convenience should sit on top of the parser and generator primitives, not replace them.
