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

// More iterations = more precision distinguishing points near the boundary.
// Points truly inside the set never escape, so higher maxIter just means
// we're more confident before declaring a point "inside".
const maxIter = 100;

// ASCII density ramp from lightest (space) to heaviest (@).
// Points that escape quickly get light characters; slow escapers get heavy ones.
const chars = " .-=+*#%@X";

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
    let iter = 0;

    // If |z|² > 4 (i.e. |z| > 2), the point has "escaped" — it will
    // diverge to infinity and is NOT in the Mandelbrot set.
    while (zx * zx + zy * zy <= 4 && iter < maxIter) {
      const tmp = zx * zx - zy * zy + cx; // real part of z² + c
      zy = 2 * zx * zy + cy;              // imaginary part of z² + c
      zx = tmp;
      iter++;
    }

    if (iter === maxIter) {
      // Never escaped — this point is (likely) in the Mandelbrot set
      output += "*";
    } else {
      // Escaped after `iter` steps — map escape speed to a character.
      // Fast escape = light char (far from set), slow escape = heavy char (near boundary)
      output += chars[Math.floor((iter / maxIter) * (chars.length - 1))];
    }
  }
  output += "\n";
}

process.stdout.write(output);
