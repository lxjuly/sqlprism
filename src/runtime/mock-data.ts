export type DemoRow = Record<string, string | number | null>;
export type DemoDataset = Record<string, DemoRow[]>;

export const demoDataset: DemoDataset = {
  sales: [
    { region: "West", order_date: "2026-01-01", revenue: 300, cost: 180 },
    { region: "West", order_date: "2026-01-02", revenue: 620, cost: 300 },
    { region: "South", order_date: "2026-01-01", revenue: 240, cost: 120 },
    { region: "South", order_date: "2026-01-03", revenue: 570, cost: 260 },
    { region: "East", order_date: "2026-01-02", revenue: 690, cost: 400 },
    { region: "North", order_date: "2026-01-04", revenue: 540, cost: 290 },
  ],
  orders: [
    { id: 1, user_id: "1" },
    { id: 2, user_id: "2" },
    { id: 3, user_id: "3" },
  ],
  order_items: [
    { order_id: 1, sushi_id: 3 },
    { order_id: 1, sushi_id: 4 },
    { order_id: 2, sushi_id: 3 },
    { order_id: 3, sushi_id: 2 },
  ],
  sushi: [
    { id: 1, price: 1.0 },
    { id: 2, price: 2.0 },
    { id: 3, price: 3.0 },
    { id: 4, price: 2.5 },
  ],
};
