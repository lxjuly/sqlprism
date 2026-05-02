const {
  demoDataset,
  executeOsiQuery,
  generateOsi,
  generateVegaLite,
  parseOne,
  refract,
} = require("../dist");

const examples = [
  {
    name: "Revenue By Region",
    sql: "SELECT region, SUM(revenue) AS total_revenue FROM sales GROUP BY region ORDER BY total_revenue DESC LIMIT 10",
  },
  {
    name: "Revenue Over Time",
    sql: "SELECT order_date, SUM(revenue) AS total_revenue FROM sales GROUP BY order_date",
  },
  {
    name: "User Spend",
    sql: "SELECT o.user_id, SUM(s.price) AS total_spend FROM orders o JOIN order_items i ON o.id = i.order_id JOIN sushi s ON i.sushi_id = s.id WHERE s.price > 2 GROUP BY o.user_id",
  },
];

for (const example of examples) {
  const ast = parseOne(example.sql);
  const osi = generateOsi(ast);
  const rows = executeOsiQuery(osi, demoDataset);
  const spec = {
    ...generateVegaLite(ast),
    data: { values: rows },
  };
  const refracted = refract(example.sql, { outputs: ["ast", "osi", "vega"] });

  console.log(`\n=== ${example.name} ===`);
  console.log("\nSQL");
  console.log(example.sql);

  console.log("\nVega-Lite Spec");
  console.log(JSON.stringify(spec, null, 2));

  console.log("\nOSI Rows");
  console.log(JSON.stringify(rows, null, 2));

  console.log("\nRefract Convenience Output");
  console.log(JSON.stringify(refracted, null, 2));
}
