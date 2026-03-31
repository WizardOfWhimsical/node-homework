const EventEmitter = require("events");
const emitter = new EventEmitter();

emitter.on("time", (time) => {
  console.log("Time revieved\n", time);
});

function getTime() {
  const time = new Date().toLocaleTimeString();
  // return setInterval(() => {
  return emitter.emit("time", time);
  // }, 5000);
}

// getTime();
module.exports = { getTime, emitter };
