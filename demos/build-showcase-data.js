const fs = require("fs");
const path = require("path");
const {
  demoDataset,
  executeOsiQuery,
  generateOsi,
  generateVegaLite,
  parseOne,
} = require("../dist");

const examples = [
  {
    id: "region",
    name: "Revenue By Region",
    description: "Grouped categorical aggregate rendered as a ranked bar chart.",
    sql: "SELECT region, SUM(revenue) AS total_revenue FROM sales GROUP BY region ORDER BY total_revenue DESC LIMIT 10",
  },
  {
    id: "trend",
    name: "Revenue Over Time",
    description: "Temporal aggregate rendered as a line chart for trend analysis.",
    sql: "SELECT order_date, SUM(revenue) AS total_revenue FROM sales GROUP BY order_date",
  },
  {
    id: "user",
    name: "User Spend",
    description: "Join-driven aggregate rendered as a categorical summary of user spend.",
    sql: "SELECT o.user_id, SUM(s.price) AS total_spend FROM orders o JOIN order_items i ON o.id = i.order_id JOIN sushi s ON i.sushi_id = s.id WHERE s.price > 2 GROUP BY o.user_id",
  },
];

const materialized = examples.map((example) => {
  const ast = parseOne(example.sql);
  const osi = generateOsi(ast);
  const rows = executeOsiQuery(osi, demoDataset);
  const spec = {
    ...generateVegaLite(ast),
    data: { values: rows },
  };

  return {
    ...example,
    osi,
    rows,
    spec,
  };
});

const content = `window.SQLPRISM_DEMO = ${JSON.stringify(
  {
    generatedAt: new Date().toISOString(),
    examples: materialized,
  },
  null,
  2,
)};\n`;

fs.writeFileSync(path.join(__dirname, "showcase-data.js"), content, "utf8");
console.log(`Wrote showcase data for ${materialized.length} examples.`);
