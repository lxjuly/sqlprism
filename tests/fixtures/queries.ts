export const analyticalQueries = {
  groupedRevenue:
    "SELECT region, SUM(revenue) AS total_revenue FROM sales GROUP BY region ORDER BY total_revenue DESC LIMIT 10",
  joinedRevenue:
    "SELECT o.user_id, SUM(s.price) AS total FROM orders o JOIN sushi s ON o.id = s.id WHERE s.price > 2 GROUP BY o.user_id",
  arithmeticFilter:
    "SELECT product, revenue FROM sales WHERE revenue - cost > 100",
  trendQuery:
    "SELECT order_date, SUM(revenue) AS total_revenue FROM sales GROUP BY order_date",
} as const;
