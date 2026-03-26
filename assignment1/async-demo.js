const fs = require("fs");
const path = require("path");

// Write a sample file for demonstration
// const samplePath = path.join(__dirname, "sample-files/sample.txt");
// console.log(samplePath);
// fs.writeFile(samplePath, "Hello, async world!", (err) => {
//   // console.log("write failed");
//   if (err) throw err;
// });

// 1. Callback style
// fs.readFile(samplePath, (err, data) => {
//   if (err) throw err;
//   console.log("Callback read:", data);
// });
const sampleFilePath = path.join(__dirname, "sample-files/sample.txt");

fs.writeFile(sampleFilePath, "Hello, async world!", (err) => {
  if (err) {
    console.error("Error writing file:", err);
    return;
  }
  // console.log(`File written successfully to ${sampleFilePath}`);

  fs.readFile(sampleFilePath, "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return;
    }
    console.log("Callback read:", data);
  });
});
// Callback hell example (test and leave it in comments):

// 2. Promise style
fs.promises
  .readFile(sampleFilePath, "utf-8")
  .then((data) => console.log("Promise read:", data));

// 3. Async/Await style
async function readingFile() {
  const data = await fs.promises.readFile(sampleFilePath, "utf-8");
  if (!data) return;
  console.log("Async/Await read:", data);
}
readingFile();
