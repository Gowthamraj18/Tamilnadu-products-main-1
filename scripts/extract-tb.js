const fs = require("fs");
const path = require("path");
const s = fs.readFileSync(path.join(__dirname, "../frontend_dist/assets/index-6b3ec0de.js"), "utf8");
const start = s.indexOf("tb=()=>");
const chunk = s.slice(start, start + 25000);
fs.writeFileSync(path.join(__dirname, "../_tb_chunk.txt"), chunk);
console.log("len", chunk.length, "fetch count", (chunk.match(/fetch\(/g) || []).length);
