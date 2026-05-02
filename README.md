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

## OSI Demo

Run the OSI-oriented demo:

```bash
npm run demo:osi
```

This builds the library and prints, for a couple of analytical queries:

- visible source bindings
- parsed AST
- generated OSI payload
- `refract(...)` convenience output

## Vega-Lite Demo

Run the visualization-oriented demo:

```bash
npm run demo:vega
```

This builds the library and prints Vega-Lite specs for representative analytical queries, including:

- grouped categorical summaries
- temporal trends
- join-based aggregations

There is also a visual showcase at [demos/vega-showcase.html](/Users/youmiss/workplace/sqlprism/demos/vega-showcase.html), which uses Vega-Lite directly as the presentation layer for the demo.

To refresh the browser showcase from the real demo pipeline, run:

```bash
npm run demo:all
```

That rebuilds the library, executes the mock OSI runtime against the generated semantic payloads, and rewrites [demos/showcase-data.js](/Users/youmiss/workplace/sqlprism/demos/showcase-data.js) for the browser view.
