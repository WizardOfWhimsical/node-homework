const EventEmitter = require("events");
const { get } = require("http");
const emitter = new EventEmitter();

emitter.on("time", (time) => {
  console.log("Time revieved\n", time);
});

function getTime() {
  const time = new Date().toLocaleTimeString();
  return setInterval(() => {
    emitter.emit("time", time);
  }, 5000);
}

// getTime();
module.exports = getTime;
