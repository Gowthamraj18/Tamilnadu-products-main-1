const fs = require("fs");
const path = require("path");
const s = fs.readFileSync(path.join(__dirname, "../frontend_dist/assets/index-6b3ec0de.js"), "utf8");
const start = s.indexOf("tb=()=>");
const end = s.indexOf('},rb="data:image', start);
const tb = s.slice(start, end);
const i = tb.indexOf("handleSubmit");
console.log(tb.slice(0, i));
