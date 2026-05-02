# Publishing Plan

## Goal

Publish SQLPrism as a usable npm package with a clean public surface area and without leaking local agent workflow files.

## Package Boundary

### Publish

- `dist/`
- `README.md`
- `LICENSE`
- `package.json`

### Keep In Repo But Out Of Published Package

- `tests/`
- `demos/`
- `spec/`

### Keep Local Only

- `docs/`

The local `docs/` folder is intended for system notes and task notes that help ongoing development but should not be committed to git.

## Release Preparation

1. Remove agent-only tracked files from git history going forward.
2. Add package boundaries in `package.json` using `files` and `exports`.
3. Make sure `dist/` contains only library code.
4. Decide whether the mock runtime remains part of the public API or moves to examples-only status.
5. Add npm metadata such as repository, homepage, bugs, keywords, and package author details.
6. Run `npm pack` and inspect the tarball contents before publishing.
7. Install the tarball into a throwaway project and verify the public API.
8. Publish with the intended package name and access level.

## Recommended Package Metadata

The package should eventually define:

- `files`
- `exports`
- `main`
- `types`
- `repository`
- `homepage`
- `bugs`
- `keywords`

## Next Packaging Tasks

- restrict the published artifact to the intended runtime files
- confirm whether demo/runtime helpers should be public
- validate import ergonomics for both parser and semantic APIs
