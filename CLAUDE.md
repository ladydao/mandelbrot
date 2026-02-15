## Project

Terminal Mandelbrot set renderer. Prints the Mandelbrot set as ASCII art using character density to represent escape speed. Run with:

```sh
bun index.ts
```

Key parameters in `index.ts`:
- `xMin/xMax/yMin/yMax` — complex plane viewing window
- `maxIter` — iteration limit (higher = more detail near boundary)
- `chars` — ASCII density ramp (light → heavy)

Output auto-sizes to the terminal dimensions.

## Tooling

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Bun automatically loads .env, so don't use dotenv.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.mdx`.
