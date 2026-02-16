## Project

Interactive terminal Mandelbrot set explorer with truecolor rendering. Supports keyboard-driven panning, zooming, iteration control, and preset locations for famous regions. Run with:

```sh
bun index.ts
```

Key parameters in `index.ts`:
- `centerX/centerY` — viewport center on the complex plane
- `zoom` — viewport width on the real axis
- `maxIter` — iteration limit (higher = more detail near boundary)
- `chars` — ASCII density ramp (light → heavy)

Controls:
- Arrow keys — pan
- `+`/`-` — zoom in/out (2x)
- `[`/`]` — decrease/increase iterations by 50
- `c` — toggle color / ASCII mode
- `1`-`5` — jump to preset location (Seahorse Valley, Elephant Valley, Double Spiral, Mini Mandelbrot, Lightning)
- `r` — reset to default view
- `q` — quit

Output auto-sizes to the terminal dimensions. Uses the alternate screen buffer so the terminal is restored on exit.

## Tooling

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Bun automatically loads .env, so don't use dotenv.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.mdx`.
