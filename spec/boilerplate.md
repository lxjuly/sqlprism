# SQLPrism Boilerplate

This file captures the repository scaffold described in the original boilerplate PDF.

## Target Structure

```text
sqlprism/
├── src/
│   ├── core/
│   │   ├── scanner.ts
│   │   ├── token.ts
│   │   ├── parser.ts
│   │   └── expr.ts
│   ├── refractors/
│   │   ├── visitor.ts
│   │   ├── vega.ts
│   │   └── osi.ts
│   └── index.ts
├── tests/
│   └── compiler.test.ts
├── package.json
└── tsconfig.json
```

## Notes

- `scanner.ts` is the tokenizer entry point.
- `token.ts` defines token types and token payloads.
- `expr.ts` holds AST node definitions using a visitor-friendly shape.
- `parser.ts` is reserved for recursive descent parsing.
- `vega.ts` and `osi.ts` are the first refractor targets.
- `index.ts` exposes the public `refract()` API.

## Intended Implementation Path

1. Define tokens and literals.
2. Build the scanner.
3. Build expression nodes.
4. Implement the parser.
5. Add refractors for downstream outputs.
