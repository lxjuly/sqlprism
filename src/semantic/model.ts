export interface SemanticReference {
  source: string;
  field: string;
}

export interface SemanticAggregate {
  function: "sum" | "count" | "avg" | "min" | "max";
  reference: SemanticReference;
}

export interface SemanticPredicate {
  left: SemanticReference;
  operator: string;
  right:
    | {
        kind: "literal";
        value: string | number | null;
      }
    | {
        kind: "reference";
        reference: SemanticReference;
      };
}

export interface SemanticSource {
  path: string;
  alias: string | null;
}

export interface SemanticJoin {
  type: "inner" | "left" | "right" | "full" | "cross";
  source: SemanticSource;
  predicate: SemanticPredicate | null;
  expression: string | null;
}

export interface SemanticSelection {
  kind: "dimension" | "measure";
  label: string;
  alias: string | null;
  expression: string;
  reference: SemanticReference | null;
  aggregate: SemanticAggregate | null;
}

export interface SemanticFilter {
  expression: string;
  predicate: SemanticPredicate | null;
}

export interface SemanticOrder {
  expression: string;
  direction: "asc" | "desc";
  alias: string | null;
  reference: SemanticReference | null;
}

export interface SemanticQuery {
  source: SemanticSource | null;
  joins: SemanticJoin[];
  selections: SemanticSelection[];
  filters: SemanticFilter[];
  groupBy: string[];
  orderBy: SemanticOrder[];
  limit: number | null;
}
