const socket = io();

socket.on("connect", () => {
  socket.emit("add", "control-panel");

  let followBtn = document.querySelector("#follow");
  let raidBtn = document.querySelector("#raid");
  let happyBtn = document.querySelector("#happy");
  let startAdvisesBtn = document.querySelector("#start-advises");
  let stopAdvisesBtn = document.querySelector("#stop-advises");
  let submitTTS = document.querySelector("#submitTTS");

  followBtn.disabled = false;
  raidBtn.disabled = false;
  happyBtn.disabled = false;
  startAdvisesBtn.disabled = false;
  stopAdvisesBtn.disabled = false;
  submitTTS.querySelector(".submit").disabled = false;

  happyBtn.addEventListener("click", alertMsg);
  raidBtn.addEventListener("click", alertMsg);
  followBtn.addEventListener("click", alertMsg);
  startAdvisesBtn.addEventListener("click", twitchBot);
  stopAdvisesBtn.addEventListener("click", twitchBot);
  submitTTS.addEventListener("submit", ttsAlert);
});

function twitchBot(e) {
  socket.emit("twitch-bot", e.target.id);
}

function alertMsg(e) {
  socket.emit("message", e.target.id);
}

function ttsAlert(e) {
  e.preventDefault();
  console.log(e.target.elements);
  let data = {
    msg: e.target.elements.text.value,
    opts: { voice: e.target.elements.voice.value + e.target.elements.variant.value },
  };
  socket.emit("tts", data);
}
