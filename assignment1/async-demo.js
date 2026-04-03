const fs = require("fs");
const path = require("path");

const sampleFilePath = path.join(__dirname, "sample-files/sample.txt");
//This is the Callback hell. what happens if you need to keep reading/writing deeper into the file? That is your Hell!
fs.writeFile(sampleFilePath, "Hello, async world!", (err) => {
  if (err) {
    console.error("Error writing file:", err);
    return;
  }

  fs.readFile(sampleFilePath, "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return;
    }
    console.log("Callback read:", data);
  });
});

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
