# mandelbrot

Interactive terminal Mandelbrot set explorer with truecolor rendering and preset locations for famous regions.

## Install

```bash
bun install
```

## Run

```bash
bun index.ts
```

## Controls

| Key | Action |
|-----|--------|
| Arrow keys | Pan around the complex plane |
| `+` / `=` | Zoom in (2x) |
| `-` | Zoom out (2x) |
| `]` | Increase iterations (+50) |
| `[` | Decrease iterations (-50) |
| `c` | Toggle color / ASCII mode |
| `1`-`5` | Jump to preset location |
| `r` | Reset to default view |
| `q` / Ctrl-C | Quit |

### Presets

| Key | Location |
|-----|----------|
| `1` | Seahorse Valley |
| `2` | Elephant Valley |
| `3` | Double Spiral |
| `4` | Mini Mandelbrot |
| `5` | Lightning |

Increase iterations with `]` as you zoom deeper to maintain detail near the boundary.

## How it works

Each terminal character maps to a point on the complex plane. The classic Mandelbrot iteration `z = z² + c` runs for each point. In color mode, escape speed maps to a smooth HSL color palette using 24-bit terminal colors. In ASCII mode, characters are chosen from a density ramp. Points that never escape (the set itself) are drawn as black (color) or `*` (ASCII).

The viewport auto-sizes to your terminal dimensions and uses the alternate screen buffer, so your terminal is restored cleanly on exit.
