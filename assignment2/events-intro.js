// import { EventEmitter } from "node:events";
const EventEmitter = require("events");
const fs = require("fs");

const emitter = new EventEmitter();
const process = fs.promises;

// process.writeFile("test.txt", "playing with options");
// async function reading() {
//   const something = await process
//     .readFile(__dirname + "/test.txt", "utf-8")
//     .then((response) => response);
//   return something;
// }
const something = process
  .readFile(__dirname + "/test.txt", "utf-8")
  .then((response) => response);

emitter.on("tell", (message) => {
  console.log("listener 1 got a tell message:\n", message);
});

emitter.on("secret", async (message) => {
  console.log("listener 2 got a tell message:\n", await message);
});
emitter.on("error", (error) => {
  console.log("listener 2 got a tell message:\n", error);
});

emitter.emit("tell", "Hi there!");
emitter.emit("tell", "second message");
// emitter.emit("secret", reading());
emitter.emit(
  "secret",
  something.then((r) => r),
);
