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
    let count = 40;
    let timerId = setInterval(function () {
      count--;
      if (count <= 0) clearInterval(timerId);
      let heart = makeHeart();
      dropElement(heart);
    }, Math.random() * 125 + 125);
  }
  if (msg === "ok") {
    let count = 40;
    let timerId = setInterval(function () {
      count--;
      if (count <= 0) clearInterval(timerId);
      let heart = makeOk();
      dropElement(heart);
    }, Math.random() * 125 + 125);
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

function makeOk() {
  let ok = makeElement("div", "okIcon");
  return ok;
}
function makeElement(nombre, clase) {
  let elem = document.createElement(nombre);
  elem.className = clase;
  return elem;
}

function dropElement(el) {
  let drop = makeElement("div", "drop-el");
  drop.style.left = Math.random() * 1820 + "px";
  drop.append(el);
  content.append(drop);
  let id = setTimeout(() => {
      clearTimeout(id);
      drop.parentNode.removeChild(drop);
  }, 6000);
}
