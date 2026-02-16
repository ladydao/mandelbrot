// --- CLI argument parsing ---
const args = process.argv.slice(2);

const USAGE = `Usage: bun index.ts [options]

Options:
  --help, -h      Show this help message
`;

if (args.includes("--help") || args.includes("-h")) {
  process.stdout.write(USAGE);
  process.exit(0);
}

// Terminal dimensions — each character becomes one "pixel"
const width = process.stdout.columns || 80;
const height = (process.stdout.rows || 24) - 1;

// The Mandelbrot set lives on the complex plane. These bounds frame the
// classic view: the main cardioid sits around (-0.5, 0) and the set extends
// left to about -2. The y-axis is symmetric around 0.
const xMin = -2.0;
const xMax = 0.5;
const yMin = -1.2;
const yMax = 1.2;

// ASCII density ramp from lightest (space) to heaviest (@).
// Points that escape quickly get light characters; slow escapers get heavy ones.
const chars = " .-=+*#%@X";

function renderFrame(iter: number): string {
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
      while (zx * zx + zy * zy <= 4 && n < iter) {
        const tmp = zx * zx - zy * zy + cx; // real part of z² + c
        zy = 2 * zx * zy + cy;              // imaginary part of z² + c
        zx = tmp;
        n++;
      }

      if (n === iter) {
        // Never escaped — this point is (likely) in the Mandelbrot set
        output += "*";
      } else {
        // Escaped after `n` steps — map escape speed to a character.
        // Fast escape = light char (far from set), slow escape = heavy char (near boundary)
        output += chars[Math.floor((n / iter) * (chars.length - 1))];
      }
    }
    output += "\n";
  }

  return output;
}

// Hide cursor for cleaner animation
process.stdout.write("\x1b[?25l");

// Restore cursor on exit (Ctrl-C or natural end)
process.on("exit", () => process.stdout.write("\x1b[?25h"));
process.on("SIGINT", () => process.exit(0));

let frame = 1;
const ANIM_MAX = 300;

// Print the first frame so the cursor is already below the image
process.stdout.write(renderFrame(frame));

const timer = setInterval(() => {
  frame++;

  // Move cursor back up `height` lines to overwrite the previous frame
  process.stdout.write(`\x1b[${height}A`);
  process.stdout.write(renderFrame(frame));

  if (frame >= ANIM_MAX) {
    clearInterval(timer);
    process.stdout.write("\x1b[?25h"); // restore cursor
  }
}, 100);
