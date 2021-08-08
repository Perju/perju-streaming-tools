const socket = io();

window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();

function play(soundBuffer) {
  var source = context.createBufferSource();
  source.buffer = soundBuffer;
  source.connect(context.destination);
  source.start(0);
}

let content;
document.addEventListener("DOMContentLoaded", () => {
  content = document.getElementById("content");
});

socket.on("connect", () => {
  socket.emit("add", "alert-panel");
});

socket.on("message", function (msg) {
  if (msg === "happy") {
    let heart = makeHeart();
    dropElement(heart);
  }
  if (msg === "raid") {
    meSpeak.speak("Te comía todos los huevos,, campeon", speakOpts);
  }
});

socket.on("tts", (data) => {
  context.decodeAudioData(data, function (buffer) {
    play(buffer);
  });
});

function makeHeart() {
  let heart = makeElement("div", "heart");
  heart.append(makeElement("div", "before"));
  heart.append(makeElement("div", "core"));
  heart.append(makeElement("div", "after"));
  return heart;
}

function makeElement(nombre, clase) {
  let elem = document.createElement(nombre);
  elem.className = clase;
  return elem;
}

function dropElement(el) {
  el.style.position = "absolute";
  el.style.left = Math.random() * 1820 + "px";
  content.append(el);
  let pos = 0;
  let id = setInterval(() => {
    if (pos >= 980) {
      clearInterval(id);
      el.parentNode.removeChild(el);
    } else {
      pos++;
      el.style.top = `${pos}px`;
    }
  }, 10);
}
