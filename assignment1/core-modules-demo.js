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
console.log("CPU:", cpu);
console.log("Total Memory:", total_memory);

// Path module

// fs.promises API

// Streams for large files- log first 40 chars of each chunk
