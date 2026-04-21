/**
 * Removes `const handleSubmit=async ev=>{...};` and sets
 * `onSubmit:handleSubmit` -> `onSubmit:async ev=>{...}` so the handler
 * cannot be "not defined" at render time.
 */
const fs = require("fs");
const path = require("path");

const bundlePath = path.join(__dirname, "../frontend_dist/assets/index-6b3ec0de.js");

let s = fs.readFileSync(bundlePath, "utf8");

if (s.includes("onSubmit:async ev=>")) {
  console.log("Already inlined onSubmit");
  process.exit(0);
}

const prefix = "const handleSubmit=async ev=>";
const start = s.indexOf(prefix);
if (start < 0) {
  console.error("const handleSubmit=async ev=> not found");
  process.exit(1);
}

const openBrace = start + prefix.length;
if (s[openBrace] !== "{") {
  console.error("Expected { after async ev=>");
  process.exit(1);
}

let depth = 0;
for (let i = openBrace; i < s.length; i++) {
  const c = s[i];
  if (c === "{") depth++;
  else if (c === "}") {
    depth--;
    if (depth === 0) {
      const closeBrace = i;
      let end = closeBrace + 1;
      if (s[end] === ";") end++;
      const body = s.slice(openBrace + 1, closeBrace);
      const fullDecl = s.slice(start, end);

      if (!s.includes("onSubmit:handleSubmit")) {
        console.error("onSubmit:handleSubmit not found");
        process.exit(1);
      }

      s = s.replace(fullDecl, "");
      s = s.replace("onSubmit:handleSubmit", `onSubmit:async ev=>{${body}}`);
      fs.writeFileSync(bundlePath, s);
      console.log("Inlined checkout onSubmit (removed const handleSubmit)");
      process.exit(0);
    }
  }
}
console.error("Unbalanced braces in handleSubmit");
process.exit(1);
