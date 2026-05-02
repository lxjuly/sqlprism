# SQLPrism Vision

## Goal

SQLPrism is an open source TypeScript library for turning SQL into a reusable program representation and multiple downstream analytical outputs.

The core workflow is:

1. Parse SQL into AST
2. Inspect or normalize the AST
3. Generate one or more downstream artifacts

## Primary Outputs

### AST

The AST is the primary product of the parser. It should be stable enough to support:

- SQL inspection
- SQL transformation
- SQL regeneration
- downstream semantic generation

### OSI Semantic Query

SQLPrism should generate a governed semantic query shape that preserves the intent of the SQL while fitting OSI-style payload requirements.

### Vega-Lite Spec

SQLPrism should generate a best-effort Vega-Lite spec from query structure and semantics, especially for common analytical queries such as grouped aggregations, trends, and categorical comparisons.

### DuckDB SQL

SQLPrism should generate DuckDB-compatible SQL from the normalized AST, enabling local execution, caching, and validation.

## Reference Implementation

The closest reference implementation is [sqlglot](https://github.com/tobymao/sqlglot/tree/main), a Python SQL parser, transpiler, optimizer, and engine.

SQLPrism should take inspiration from SQLGlot’s architecture:

- normalized AST across dialects
- dialect-aware parse and generate paths
- traversal and transform utilities
- structured errors
- semantic inspection helpers

SQLPrism does not need to match SQLGlot’s scope immediately. It should start with a smaller SQL subset and a clear architecture that can grow over time.

## Non-Goals for the First Milestone

- Full multi-dialect parity with SQLGlot
- Full SQL optimizer coverage
- Execution engine beyond DuckDB SQL generation
- Exhaustive schema-aware semantic resolution

## First Milestone Scope

The first milestone should support a practical analytical subset:

- `SELECT`
- `FROM`
- `WHERE`
- `GROUP BY`
- `ORDER BY`
- `LIMIT`
- aliases
- function calls
- aggregate functions
- simple joins

That subset is enough to prove the architecture and exercise the three target outputs.
