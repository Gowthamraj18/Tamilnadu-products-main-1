const fs = require("fs");
const path = require("path");
const s = fs.readFileSync(path.join(__dirname, "../frontend_dist/assets/index-6b3ec0de.js"), "utf8");
const re = /\/api\/[a-zA-Z0-9/_-]+/g;
const set = new Set();
let m;
while ((m = re.exec(s))) set.add(m[0]);
console.log([...set].sort().join("\n"));
