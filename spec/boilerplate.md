# SQLPrism Architecture Boilerplate

This file defines the intended repository shape for SQLPrism as a TypeScript SQL parser and generator library.

SQLPrism is inspired by [sqlglot](https://github.com/tobymao/sqlglot/tree/main), but its initial downstream goals are narrower:

- Parse SQL into a reusable AST
- Generate OSI semantic query payloads
- Generate Vega-Lite visualization specs
- Generate DuckDB SQL for local execution and caching

## Design Principle

The AST is the center of the system.

Parsing should be independent from any downstream target. OSI, Vega-Lite, and DuckDB generation should all consume the same normalized AST instead of reparsing SQL or embedding target-specific parsing rules.

## Target Structure

```text
sqlprism/
├── src/
│   ├── ast/
│   │   ├── expression.ts      # Core node model and shared AST utilities
│   │   ├── statement.ts       # Statement-level nodes such as Select
│   │   └── visitor.ts         # Traversal and transform interfaces
│   ├── dialects/
│   │   ├── dialect.ts         # Dialect contract
│   │   ├── duckdb.ts          # DuckDB parsing/generation rules
│   │   └── ansi.ts            # Default baseline dialect
│   ├── parser/
│   │   ├── scanner.ts         # Tokenizer / lexer
│   │   ├── token.ts           # Token types and token objects
│   │   ├── parser.ts          # Recursive descent or Pratt parser
│   │   └── errors.ts          # Structured parse errors
│   ├── generators/
│   │   ├── sql.ts             # SQL emission from AST
│   │   ├── duckdb.ts          # DuckDB generator
│   │   ├── osi.ts             # OSI payload generator
│   │   └── vega.ts            # Vega-Lite generator
│   ├── analysis/
│   │   ├── scope.ts           # Semantic scope utilities
│   │   ├── lineage.ts         # Column/source tracing
│   │   ├── normalize.ts       # AST cleanup and canonicalization
│   │   └── metadata.ts        # Table, column, aggregation introspection
│   └── index.ts               # Public API
├── spec/
│   ├── README.md
│   ├── vision.md
│   ├── architecture.md
│   └── api.md
├── tests/
│   ├── parser.test.ts
│   ├── generator.test.ts
│   └── fixtures/
├── package.json
└── tsconfig.json
```

## Current vs Target

The repository may temporarily use a simpler layout while the implementation is still early. The structure above is the target shape the codebase should converge toward as the parser and generators mature.

## Borrowed Ideas from SQLGlot

SQLPrism should borrow these ideas from SQLGlot:

- A single normalized AST that can represent multiple dialects
- Dialect-aware parsing and generation
- Structured parse errors with location metadata
- Tree traversal helpers for inspection and rewriting
- Semantic analysis utilities beyond raw AST walking

SQLPrism does not need to clone SQLGlot feature-for-feature up front. The initial goal is a strong TypeScript core with a smaller supported surface area and high-quality downstream generators for the project’s target use cases.

## Intended Implementation Path

1. Establish a stable AST node model.
2. Build tokenization and parser error reporting.
3. Parse a focused SQL subset into the normalized AST.
4. Add AST traversal and transform helpers.
5. Implement DuckDB SQL generation from AST.
6. Implement OSI payload generation from AST.
7. Implement Vega-Lite spec generation from AST plus semantic analysis.
8. Expand dialect coverage and analysis utilities over time.
