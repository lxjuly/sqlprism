window.SQLPRISM_DEMO = {
  "generatedAt": "2026-05-02T17:32:48.868Z",
  "examples": [
    {
      "id": "region",
      "name": "Revenue By Region",
      "description": "Grouped categorical aggregate rendered as a ranked bar chart.",
      "sql": "SELECT region, SUM(revenue) AS total_revenue FROM sales GROUP BY region ORDER BY total_revenue DESC LIMIT 10",
      "osi": {
        "source": "sales",
        "sourceAlias": null,
        "joins": [],
        "select": [
          {
            "expression": "sales.region",
            "alias": null,
            "reference": {
              "source": "sales",
              "field": "region"
            },
            "aggregate": null
          },
          {
            "expression": "SUM(sales.revenue)",
            "alias": "total_revenue",
            "reference": null,
            "aggregate": {
              "function": "sum",
              "reference": {
                "source": "sales",
                "field": "revenue"
              }
            }
          }
        ],
        "filters": [],
        "groupBy": [
          "sales.region"
        ],
        "orderBy": [
          {
            "expression": "sales.total_revenue",
            "direction": "desc",
            "alias": "total_revenue",
            "reference": {
              "source": "sales",
              "field": "total_revenue"
            }
          }
        ],
        "limit": 10
      },
      "rows": [
        {
          "region": "West",
          "total_revenue": 920
        },
        {
          "region": "South",
          "total_revenue": 810
        },
        {
          "region": "East",
          "total_revenue": 690
        },
        {
          "region": "North",
          "total_revenue": 540
        }
      ],
      "spec": {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "title": "Aggregated view of sales",
        "description": "Grouped analytical query without joins",
        "mark": "bar",
        "encoding": {
          "x": {
            "field": "region",
            "type": "nominal"
          },
          "y": {
            "field": "total_revenue",
            "type": "quantitative",
            "axis": {
              "format": "~s"
            }
          },
          "tooltip": [
            {
              "field": "region",
              "type": "nominal",
              "title": "region"
            },
            {
              "field": "total_revenue",
              "type": "quantitative",
              "title": "total_revenue"
            }
          ]
        },
        "data": {
          "values": [
            {
              "region": "West",
              "total_revenue": 920
            },
            {
              "region": "South",
              "total_revenue": 810
            },
            {
              "region": "East",
              "total_revenue": 690
            },
            {
              "region": "North",
              "total_revenue": 540
            }
          ]
        }
      }
    },
    {
      "id": "trend",
      "name": "Revenue Over Time",
      "description": "Temporal aggregate rendered as a line chart for trend analysis.",
      "sql": "SELECT order_date, SUM(revenue) AS total_revenue FROM sales GROUP BY order_date",
      "osi": {
        "source": "sales",
        "sourceAlias": null,
        "joins": [],
        "select": [
          {
            "expression": "sales.order_date",
            "alias": null,
            "reference": {
              "source": "sales",
              "field": "order_date"
            },
            "aggregate": null
          },
          {
            "expression": "SUM(sales.revenue)",
            "alias": "total_revenue",
            "reference": null,
            "aggregate": {
              "function": "sum",
              "reference": {
                "source": "sales",
                "field": "revenue"
              }
            }
          }
        ],
        "filters": [],
        "groupBy": [
          "sales.order_date"
        ],
        "orderBy": [],
        "limit": null
      },
      "rows": [
        {
          "order_date": "2026-01-01",
          "total_revenue": 540
        },
        {
          "order_date": "2026-01-02",
          "total_revenue": 1310
        },
        {
          "order_date": "2026-01-03",
          "total_revenue": 570
        },
        {
          "order_date": "2026-01-04",
          "total_revenue": 540
        }
      ],
      "spec": {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "title": "Aggregated view of sales",
        "description": "Grouped analytical query without joins",
        "mark": "line",
        "encoding": {
          "x": {
            "field": "order_date",
            "type": "temporal",
            "axis": {
              "format": "%b %d"
            }
          },
          "y": {
            "field": "total_revenue",
            "type": "quantitative",
            "axis": {
              "format": "~s"
            }
          },
          "tooltip": [
            {
              "field": "order_date",
              "type": "temporal",
              "title": "order_date"
            },
            {
              "field": "total_revenue",
              "type": "quantitative",
              "title": "total_revenue"
            }
          ]
        },
        "data": {
          "values": [
            {
              "order_date": "2026-01-01",
              "total_revenue": 540
            },
            {
              "order_date": "2026-01-02",
              "total_revenue": 1310
            },
            {
              "order_date": "2026-01-03",
              "total_revenue": 570
            },
            {
              "order_date": "2026-01-04",
              "total_revenue": 540
            }
          ]
        }
      }
    },
    {
      "id": "user",
      "name": "User Spend",
      "description": "Join-driven aggregate rendered as a categorical summary of user spend.",
      "sql": "SELECT o.user_id, SUM(s.price) AS total_spend FROM orders o JOIN order_items i ON o.id = i.order_id JOIN sushi s ON i.sushi_id = s.id WHERE s.price > 2 GROUP BY o.user_id",
      "osi": {
        "source": "orders",
        "sourceAlias": "o",
        "joins": [
          {
            "type": "inner",
            "source": "order_items",
            "sourceAlias": "i",
            "on": "o.id = i.order_id",
            "predicate": {
              "left": {
                "source": "o",
                "field": "id"
              },
              "operator": "=",
              "right": {
                "kind": "reference",
                "reference": {
                  "source": "i",
                  "field": "order_id"
                }
              }
            }
          },
          {
            "type": "inner",
            "source": "sushi",
            "sourceAlias": "s",
            "on": "i.sushi_id = s.id",
            "predicate": {
              "left": {
                "source": "i",
                "field": "sushi_id"
              },
              "operator": "=",
              "right": {
                "kind": "reference",
                "reference": {
                  "source": "s",
                  "field": "id"
                }
              }
            }
          }
        ],
        "select": [
          {
            "expression": "o.user_id",
            "alias": null,
            "reference": {
              "source": "o",
              "field": "user_id"
            },
            "aggregate": null
          },
          {
            "expression": "SUM(s.price)",
            "alias": "total_spend",
            "reference": null,
            "aggregate": {
              "function": "sum",
              "reference": {
                "source": "s",
                "field": "price"
              }
            }
          }
        ],
        "filters": [
          {
            "expression": "s.price > 2",
            "predicate": {
              "left": {
                "source": "s",
                "field": "price"
              },
              "operator": ">",
              "right": {
                "kind": "literal",
                "value": 2
              }
            }
          }
        ],
        "groupBy": [
          "o.user_id"
        ],
        "orderBy": [],
        "limit": null
      },
      "rows": [
        {
          "user_id": "1",
          "total_spend": 5.5
        },
        {
          "user_id": "2",
          "total_spend": 3
        }
      ],
      "spec": {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "title": "Aggregated view of orders",
        "description": "Grouped analytical query with joins",
        "mark": "bar",
        "encoding": {
          "x": {
            "field": "user_id",
            "type": "nominal"
          },
          "y": {
            "field": "total_spend",
            "type": "quantitative",
            "axis": {
              "format": "~s"
            }
          },
          "tooltip": [
            {
              "field": "user_id",
              "type": "nominal",
              "title": "user_id"
            },
            {
              "field": "total_spend",
              "type": "quantitative",
              "title": "total_spend"
            }
          ]
        },
        "data": {
          "values": [
            {
              "user_id": "1",
              "total_spend": 5.5
            },
            {
              "user_id": "2",
              "total_spend": 3
            }
          ]
        }
      }
    }
  ]
};
