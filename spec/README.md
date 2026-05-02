# Spec Folder

This folder defines the intended product and architecture for SQLPrism before the implementation expands further.

## Documents

- [vision.md](./vision.md): project scope, goals, and first milestone boundaries
- [architecture.md](./architecture.md): parser, AST, analysis, and generator model
- [api.md](./api.md): public API draft for parse, generate, and convenience entry points
- [boilerplate.md](./boilerplate.md): target repository structure and implementation path
- [publishing.md](./publishing.md): npm publishing boundaries and release-prep plan

## Guiding Principle

SQLPrism is AST-first.

The parser should produce a reusable SQL AST, and all downstream outputs such as OSI payloads, Vega-Lite specs, and DuckDB SQL should be generated from that shared representation.
