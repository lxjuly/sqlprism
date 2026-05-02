const {
  demoDataset,
  executeOsiQuery,
  generateOsi,
  getSourceBindings,
  parseOne,
  refract,
} = require("../dist");

const examples = [
  {
    name: "Revenue By Region",
    sql: "SELECT region, SUM(revenue) AS total_revenue FROM sales WHERE revenue > 100 GROUP BY region ORDER BY total_revenue DESC LIMIT 5",
  },
  {
    name: "Order Revenue Join",
    sql: "SELECT o.user_id, SUM(s.price) AS total_spend FROM orders o JOIN order_items i ON o.id = i.order_id JOIN sushi s ON i.sushi_id = s.id WHERE s.price > 2 GROUP BY o.user_id",
  },
];

for (const example of examples) {
  const ast = parseOne(example.sql);
  const osi = generateOsi(ast);
  const rows = executeOsiQuery(osi, demoDataset);
  const bindings = getSourceBindings(ast);
  const refracted = refract(example.sql, { outputs: ["ast", "osi"] });

  console.log(`\n=== ${example.name} ===`);
  console.log("\nSQL");
  console.log(example.sql);

  console.log("\nVisible Sources");
  console.log(
    JSON.stringify(
      bindings.map((binding) => ({
        visibleName: binding.visibleName,
        path: binding.source.path,
        alias: binding.source.alias?.name ?? null,
      })),
      null,
      2,
    ),
  );

  console.log("\nAST");
  console.log(JSON.stringify(ast, null, 2));

  console.log("\nOSI Payload");
  console.log(JSON.stringify(osi, null, 2));

  console.log("\nOSI Result Rows");
  console.log(JSON.stringify(rows, null, 2));

  console.log("\nRefract Convenience Output");
  console.log(JSON.stringify(refracted, null, 2));
}
