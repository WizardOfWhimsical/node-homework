const EventEmitter = require("events");
const emitter = new EventEmitter();

emitter.on("time", (time) => {
  console.log("Time recieved:", time);
});

setInterval(() => {
  const currentTime = new Date().toLocaleString();
  emitter.emit("time", currentTime);
}, 5000);

module.exports = emitter;
