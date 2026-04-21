const fs = require("fs");
const path = require("path");

const bundlePath = path.join(__dirname, "../frontend_dist/assets/index-6b3ec0de.js");
let s = fs.readFileSync(bundlePath, "utf8");

const needle =
  'children:C.status==="out-of-stock"?"Out of Stock":"Add to Cart"})]}),s.jsxs("div",{className:"flex space-x-3"';
const insert =
  'children:C.status==="out-of-stock"?"Out of Stock":"Add to Cart"})]}),s.jsxs("button",{onClick:()=>{h();window.location.href="/shipping-details"},disabled:C.status==="out-of-stock"||!u,className:"w-full border-2 border-primary-600 text-primary-700 font-medium py-3 px-6 rounded-lg hover:bg-primary-50 transition-colors duration-200 flex items-center justify-center space-x-2",children:[s.jsx(ln,{className:"h-5 w-5"}),s.jsx("span",{children:"Buy now"})]}),s.jsxs("div",{className:"flex space-x-3"';

if (!s.includes(needle)) {
  console.error("needle not found (may already be patched)");
  process.exit(1);
}
if (s.includes('window.location.href="/shipping-details"') && s.includes("Buy now")) {
  console.log("Buy now button already present");
  process.exit(0);
}
s = s.replace(needle, insert);
fs.writeFileSync(bundlePath, s);
console.log("Patched: Buy now -> /shipping-details");
