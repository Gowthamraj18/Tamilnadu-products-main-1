const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const bundlePath = path.join(__dirname, "../frontend_dist/assets/index-6b3ec0de.js");
const snippetPath = path.join(__dirname, "checkout-handler-snippet.txt");

const MARKER1 =
  'const P=(E,A,F)=>{E==="shipping"?m(W=>({...W,[A]:F})):x(W=>({...W,[A]:F}))};return e.length===0';
const MARKER2 =
  'const P=(E,A,F)=>{E==="shipping"?m(W=>({...W,[A]:F})):x(W=>({...W,[A]:F}))};return(!e||e.length===0';

const HANDLER = fs.readFileSync(snippetPath, "utf8").trim();

let s = fs.readFileSync(bundlePath, "utf8");

if (s.includes("onSubmit:async ev=>")) {
  console.log("Checkout submit already inlined");
  process.exit(0);
}

if (!s.includes("const handleSubmit=async ev=>")) {
  if (s.includes(MARKER1)) {
    s = s.replace(
      MARKER1,
      `const P=(E,A,F)=>{E==="shipping"?m(W=>({...W,[A]:F})):x(W=>({...W,[A]:F}))};${HANDLER}return e.length===0`
    );
    fs.writeFileSync(bundlePath, s);
    console.log("Inserted handleSubmit (marker v1)");
  } else if (s.includes(MARKER2)) {
    s = s.replace(
      MARKER2,
      `const P=(E,A,F)=>{E==="shipping"?m(W=>({...W,[A]:F})):x(W=>({...W,[A]:F}))};${HANDLER}return(!e||e.length===0`
    );
    fs.writeFileSync(bundlePath, s);
    console.log("Inserted handleSubmit (marker v2)");
  } else {
    console.error("Checkout patch MARKER not found (expected P handler + return empty check)");
    process.exit(1);
  }
} else {
  console.log("const handleSubmit found; will inline into onSubmit");
}

execFileSync(process.execPath, [path.join(__dirname, "inline-checkout-submit.js")], {
  stdio: "inherit",
});
