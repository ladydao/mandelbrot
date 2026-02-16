// --- CLI argument parsing ---
const args = process.argv.slice(2);

const USAGE = `Usage: bun index.ts [options]

Options:
  --help, -h      Show this help message

Controls:
  Arrow keys      Pan around the complex plane
  + / =           Zoom in (2x)
  -               Zoom out (2x)
  ]               Increase iterations (+50)
  [               Decrease iterations (-50)
  c               Toggle color / ASCII mode
  1-5             Jump to preset location
  r               Reset to default view
  q / Ctrl-C      Quit

Presets:
  1  Seahorse Valley     4  Mini Mandelbrot
  2  Elephant Valley     5  Lightning
  3  Double Spiral
`;

if (args.includes("--help") || args.includes("-h")) {
  process.stdout.write(USAGE);
  process.exit(0);
}

// Terminal dimensions — each character becomes one "pixel"
const width = process.stdout.columns || 80;
const height = (process.stdout.rows || 24) - 1; // -1 for status bar

// ASCII density ramp from lightest (space) to heaviest (@).
// Points that escape quickly get light characters; slow escapers get heavy ones.
const chars = " .-=+*#%@X";

// --- Viewport state ---
const DEFAULT_CENTER_X = -0.75;
const DEFAULT_CENTER_Y = 0;
const DEFAULT_ZOOM = 2.5;
const DEFAULT_MAX_ITER = 100;

let centerX = DEFAULT_CENTER_X;
let centerY = DEFAULT_CENTER_Y;
let zoom = DEFAULT_ZOOM;
let maxIter = DEFAULT_MAX_ITER;
let colorMode = true;
let activePreset: string | null = null;

const PRESETS = [
  { name: "Seahorse Valley",  centerX: -0.75,     centerY: -0.1,    zoom: 0.05,  maxIter: 300 },
  { name: "Elephant Valley",  centerX: 0.28,      centerY: 0.008,   zoom: 0.01,  maxIter: 300 },
  { name: "Double Spiral",    centerX: -0.0452,   centerY: -0.9868, zoom: 0.02,  maxIter: 300 },
  { name: "Mini Mandelbrot",  centerX: -1.768,    centerY: 0.001,   zoom: 0.02,  maxIter: 500 },
  { name: "Lightning",        centerX: -0.170337, centerY: -1.0651, zoom: 0.005, maxIter: 500 },
];

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60)       { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else              { r = c; b = x; }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

function iterationToColor(n: number, maxIter: number, zx: number, zy: number): [number, number, number] {
  if (n === maxIter) return [0, 0, 0];
  const smoothN = n + 1 - Math.log2(Math.log2(zx * zx + zy * zy));
  const hue = ((smoothN * 360 / maxIter * 3) % 360 + 360) % 360;
  return hslToRgb(hue, 0.8, 0.5);
}

function renderFrame(): string {
  // Terminal chars are roughly 2x taller than wide, so we correct the aspect
  const aspect = width / (height * 2);
  const xMin = centerX - zoom / 2;
  const xMax = centerX + zoom / 2;
  const yMin = centerY - zoom / (2 * aspect);
  const yMax = centerY + zoom / (2 * aspect);

  let output = "";

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      // Map this terminal cell (col, row) to a point c = cx + cy·i
      // on the complex plane within our viewing window
      const cx = xMin + (col / width) * (xMax - xMin);
      const cy = yMin + (row / height) * (yMax - yMin);

      // The core iteration: start with z = 0 and repeatedly apply z = z² + c.
      // We track the real part (zx) and imaginary part (zy) separately since
      // complex multiplication expands to:
      //   (zx + zy·i)² = (zx² - zy²) + (2·zx·zy)·i
      let zx = 0;
      let zy = 0;
      let n = 0;

      // If |z|² > 4 (i.e. |z| > 2), the point has "escaped" — it will
      // diverge to infinity and is NOT in the Mandelbrot set.
      while (zx * zx + zy * zy <= 4 && n < maxIter) {
        const tmp = zx * zx - zy * zy + cx; // real part of z² + c
        zy = 2 * zx * zy + cy;              // imaginary part of z² + c
        zx = tmp;
        n++;
      }

      if (colorMode) {
        const [r, g, b] = iterationToColor(n, maxIter, zx, zy);
        output += `\x1b[48;2;${r};${g};${b}m `;
      } else if (n === maxIter) {
        output += "*";
      } else {
        output += chars[Math.floor((n / maxIter) * (chars.length - 1))];
      }
    }
    if (colorMode) output += "\x1b[0m";
    output += "\n";
  }

  return output;
}

function statusBar(): string {
  const mode = colorMode ? "COLOR" : "ASCII";
  const presetStr = activePreset ? ` [${activePreset}]` : "";
  const info = ` (${centerX.toFixed(6)}, ${centerY.toFixed(6)}) z:${zoom.toExponential(2)} i:${maxIter} ${mode}${presetStr}  q r c +-=[] 1-5 arrows`;
  return `\x1b[7m${info.slice(0, width).padEnd(width)}\x1b[0m`;
}

function draw() {
  // Move cursor to top-left corner and draw
  process.stdout.write("\x1b[H");
  process.stdout.write(renderFrame());
  process.stdout.write(statusBar());
}

function cleanup() {
  // Leave alternate screen buffer and restore cursor
  process.stdout.write("\x1b[?1049l");
  process.stdout.write("\x1b[?25h");
}

// --- Enter alternate screen buffer and hide cursor ---
process.stdout.write("\x1b[?1049h");
process.stdout.write("\x1b[?25l");

// Restore terminal on exit
process.on("exit", cleanup);
process.on("SIGINT", () => process.exit(0));

// Draw initial frame
draw();

// --- Interactive input handling ---
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding("utf8");

process.stdin.on("data", (key: string) => {
  const PAN_FACTOR = 0.2;

  switch (key) {
    // Quit
    case "q":
    case "\x03": // Ctrl-C
      process.exit(0);
      break;

    // Reset
    case "r":
      centerX = DEFAULT_CENTER_X;
      centerY = DEFAULT_CENTER_Y;
      zoom = DEFAULT_ZOOM;
      maxIter = DEFAULT_MAX_ITER;
      activePreset = null;
      break;

    // Toggle color mode
    case "c":
      colorMode = !colorMode;
      break;

    // Preset locations
    case "1": case "2": case "3": case "4": case "5": {
      const preset = PRESETS[parseInt(key) - 1]!;
      centerX = preset.centerX;
      centerY = preset.centerY;
      zoom = preset.zoom;
      maxIter = preset.maxIter;
      activePreset = preset.name;
      break;
    }

    // Zoom in
    case "+":
    case "=":
      zoom /= 2;
      activePreset = null;
      break;

    // Zoom out
    case "-":
      zoom *= 2;
      activePreset = null;
      break;

    // Increase iterations
    case "]":
      maxIter += 50;
      activePreset = null;
      break;

    // Decrease iterations
    case "[":
      maxIter = Math.max(50, maxIter - 50);
      activePreset = null;
      break;

    // Arrow keys (escape sequences)
    case "\x1b[A": // Up
      centerY -= zoom * PAN_FACTOR;
      activePreset = null;
      break;
    case "\x1b[B": // Down
      centerY += zoom * PAN_FACTOR;
      activePreset = null;
      break;
    case "\x1b[C": // Right
      centerX += zoom * PAN_FACTOR;
      activePreset = null;
      break;
    case "\x1b[D": // Left
      centerX -= zoom * PAN_FACTOR;
      activePreset = null;
      break;

    default:
      return; // Unknown key — don't redraw
  }

  draw();
});
