const fs = require("fs");
const path = require("path");
const s = fs.readFileSync(path.join(__dirname, "../frontend_dist/assets/index-6b3ec0de.js"), "utf8");
const needles = ["orders/create", "create-order", "Order placed", "placeOrder", "Place order", "confirmOrder"];
for (const n of needles) {
  const i = s.indexOf(n);
  console.log(n, i >= 0 ? i : "NO");
  if (i >= 0) console.log(s.slice(Math.max(0, i - 150), i + 400), "\n");
}
