const os = require("os");
const path = require("path");
const fs = require("fs");

const sampleFilesDir = path.join(__dirname, "sample-files");
if (!fs.existsSync(sampleFilesDir)) {
  fs.mkdirSync(sampleFilesDir, { recursive: true });
}

// OS module
const platform = os.platform();
const cpu = os.cpus();
const total_memory = os.totalmem();
console.log("Platform:", platform);
console.log("CPU:", cpu[0].model);
console.log("Total Memory:", total_memory);

// Path module
const pathWay = path.join(__dirname, "sample-files/demo.txt");
console.log("Joined path:", pathWay);

// fs.promises API
let statement = "Hello from fs.promis!";
// statement = JSON.stringify(statement, null, 4);
fs.promises.writeFile(pathWay, statement);
fs.promises
  .readFile(pathWay, "utf-8")
  .then((r) => console.log("fs.promises read:", r));

// Streams for large files- log first 40 chars of each chunk
const largeFilePath = path.join(__dirname, "sample-files/largefile.txt");
function writeAlot() {
  let hold = "";
  for (let i = 0; i < 125; i++) {
    hold +=
      "alot of stupid words to fit in here so that no one with really know what the hell i am thinking muhahahaha\n";
  }
  return hold;
}
fs.promises.writeFile(largeFilePath, writeAlot());
const readStream = fs.createReadStream(largeFilePath, {
  encoding: "utf-8",
  highWaterMark: 40,
});

readStream.on("data", (chunk) => {
  console.log("Read chunk:", chunk);
  //processing with highWaterMark
});

readStream.on("end", () => {
  console.log("Finished reading large file with streams");
});

readStream.on("error", (err) => {
  console.log("Error reading the stream!\n", err);
});
