# SQLPrism 🌈

The TypeScript SQL parser and refraction engine for the modern web.

SQLPrism parses SQL into a reusable AST and refracts that structure into multiple downstream outputs:
- **Vega-Lite:** For instant declarative visualization.
- **OSI Payload:** For governed semantic API requests.
- **DuckDB:** For high-performance local caching.

SQLPrism is inspired by [sqlglot](https://github.com/tobymao/sqlglot/tree/main), the Python SQL parser and transpiler, with an initial focus on a TypeScript-first architecture and analytical downstream generators.

## Quick Start

```js
const { refract } = require('sqlprism');

const sql = "SELECT region, SUM(revenue) FROM sales GROUP BY region";
const { ast, vega, osi, duckdb } = refract(sql, {
  read: "duckdb",
  outputs: ["ast", "vega", "osi", "duckdb"],
});
```
