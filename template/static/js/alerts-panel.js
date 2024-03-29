const socket = io();

socket.on("connect", () => {
  socket.emit("add", "control-panel");

  let deckBtns = document.querySelectorAll(".obs");
  let happyBtn = document.querySelectorAll(".drop");
  let twitchBotBtns = document.querySelectorAll(".twitch");
  let submitTTS = document.querySelector("#submitTTS");

  // console.log(happyBtn);

  deckBtns.forEach((btn) => (btn.disabled = false));
  happyBtn.forEach((btn) => (btn.disabled = false));
  twitchBotBtns.forEach((btn) => (btn.disabled = false));
  submitTTS.querySelector(".submit").disabled = false;

  happyBtn.forEach((btn) => {
    btn.addEventListener("click", alertMsg);
  });
  deckBtns.forEach((btn) => {
    btn.addEventListener("click", obsControl);
  });
  twitchBotBtns.forEach((btn) => {
    btn.addEventListener("click", twitchBot);
  });
  submitTTS.addEventListener("submit", ttsAlert);
});

function twitchBot(e) {
  socket.emit("twitch-bot", e.target.id);
}

function alertMsg(e) {
  socket.emit("message", e.target.attributes.value.value);
}

function obsControl(e) {
  let { action, value } = e.target.attributes;
  socket.emit("obs", { action: action.value, value: value.value });
}

function ttsAlert(e) {
  e.preventDefault();
  // console.log(e.target.elements);
  let data = {
    msg: e.target.elements.text.value,
    opts: {
      voice: e.target.elements.voice.value + e.target.elements.variant.value,
    },
  };
  socket.emit("tts", data);
}
