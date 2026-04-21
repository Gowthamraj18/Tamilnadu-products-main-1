const fs = require("fs");
const path = require("path");
const s = fs.readFileSync(path.join(__dirname, "../frontend_dist/assets/index-6b3ec0de.js"), "utf8");
let i = 0;
let c = 0;
while ((i = s.indexOf('"/api/', i)) !== -1 && c < 50) {
  console.log(s.slice(i, i + 120));
  i += 5;
  c++;
}
