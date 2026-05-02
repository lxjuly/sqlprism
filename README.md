# SQLPrism 🌈

The universal SQL refraction engine for the modern web.

SQLPrism takes a single SQL string and refracts it into multiple downstream intents:
- **Vega-Lite:** For instant declarative visualization.
- **OSI Payload:** For governed semantic API requests.
- **DuckDB:** For high-performance local caching.

## Quick Start

```js
const { prism } = require('sqlprism');

const sql = "SELECT region, SUM(revenue) FROM sales GROUP BY region";
const { vega, osi } = prism.refract(sql);
```
