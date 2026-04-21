const fs = require("fs");
const path = require("path");
const s = fs.readFileSync(
  path.join(__dirname, "../frontend_dist/assets/index-6b3ec0de.js"),
  "utf8"
);
let i = 0;
while ((i = s.indexOf('N==="cod"', i)) !== -1) {
  console.log("at", i, s.slice(i - 40, i + 120));
  i++;
}
