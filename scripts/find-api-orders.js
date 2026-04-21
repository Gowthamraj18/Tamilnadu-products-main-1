const fs = require("fs");
const path = require("path");
const s = fs.readFileSync(path.join(__dirname, "../frontend_dist/assets/index-6b3ec0de.js"), "utf8");
let i = 0;
const hits = [];
while ((i = s.indexOf("orders", i)) !== -1) {
  hits.push(s.slice(i - 20, i + 80));
  i += 6;
  if (hits.length > 30) break;
}
console.log(hits.slice(0, 15).join("\n---\n"));
