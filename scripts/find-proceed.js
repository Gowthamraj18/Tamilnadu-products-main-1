const fs = require("fs");
const path = require("path");
const s = fs.readFileSync(
  path.join(__dirname, "../frontend_dist/assets/index-6b3ec0de.js"),
  "utf8"
);
let i = s.indexOf("Proceed to Checkout");
console.log("index", i);
console.log(s.slice(i - 120, i + 180));
