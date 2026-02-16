# mandelbrot

Interactive terminal Mandelbrot set explorer. Renders the set as ASCII art with keyboard-driven navigation.

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
| `r` | Reset to default view |
| `q` / Ctrl-C | Quit |

Increase iterations with `]` as you zoom deeper to maintain detail near the boundary.

## How it works

Each terminal character maps to a point on the complex plane. The classic Mandelbrot iteration `z = z² + c` runs for each point — characters are chosen from an ASCII density ramp based on how quickly the point escapes. Points that never escape (the set itself) are drawn as `*`.

The viewport auto-sizes to your terminal dimensions and uses the alternate screen buffer, so your terminal is restored cleanly on exit.
