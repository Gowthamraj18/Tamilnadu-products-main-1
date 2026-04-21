const fs = require("fs");
const path = require("path");
const s = fs.readFileSync(path.join(__dirname, "../frontend_dist/assets/index-6b3ec0de.js"), "utf8");
const markers = ["totalAmount", "create-order", "Place Order", "customerName"];
for (const m of markers) {
  const i = s.indexOf(m);
  console.log(m, i);
  if (i >= 0) console.log(s.slice(i - 100, i + 800), "\n---\n");
}
