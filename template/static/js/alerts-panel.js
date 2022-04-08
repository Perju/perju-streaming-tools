const socket = io();

let curScene;
let scnSliders = [];

socket.on("connect", () => {
  socket.emit("add", "control-panel");

  let deckBtns = document.querySelectorAll(".obs");
  let happyBtn = document.querySelectorAll(".drop");
  let twitchBotBtns = document.querySelectorAll(".twitch");
  let submitTTS = document.querySelector("#submitTTS");
  let collapseBtns = document.querySelectorAll(".btn-row");
  let connectBtn = document.querySelector(".connect");
  let obsScenes = document.querySelector("#obs-scenes");

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
  collapseBtns.forEach((grp) => {
    grp.addEventListener("click", collapseRow);
    // grp.style.height = calcHeight(grp);
  });
  collapseBtns[0].style.height = "auto";

  submitTTS.addEventListener("submit", ttsAlert);
  connectBtn.addEventListener("click", connectObs);

  socket.on("scenes", (data) => {
    let escenas = JSON.parse(data);
    curScene = escenas.currentScene;
    createScenes(obsScenes, escenas.scenes);
  });
});

// Functions for create html elements for obs and others
/* Start create elements */
function createScenes(container, scenes) {
  let first = container.firstElementChild;
  while(first){
    first.parentNode.removeChild(first);
    first = container.firstElementChild;
  }

  scenes.forEach((scene) => {
    container.appendChild(createScene(scene));
  });

  scnButtons = document.querySelectorAll(".scnbtn");
}
function createScene(scene) {
  let sceneElement = createElement("div", "scene");
  let sceneName = createElement("div", "header");
  let btnWrap = createElement("div");
  let btnIcon = createElement("i", "fas fa-bars");
  let span = createElement("span");
  let content = document.createTextNode(scene.name);
  let checked = scene.name === curScene;
  let slider = createSlider(checked, true, {
    action: "SetCurrentScene",
    name: scene.name,
  });
  scnSliders.push(slider);
  span.appendChild(content)
  sceneName.appendChild(span);
  sceneName.appendChild(slider);
  btnWrap.appendChild(btnIcon);
  sceneName.appendChild(btnWrap);
  sceneElement.appendChild(sceneName);
  sceneElement.appendChild(createSources(scene.sources,scene.name));
  return sceneElement;
}
function createSources(srcs, scename) {
  let sources = createElement("div", "sources content");
  srcs.forEach((src) => {
    sources.appendChild(createSource(src, scename));
  });
  return sources;
}
function createSource(source, scename) {
  let src = createElement("div", "src");
  let srcName = createElement("div", "srcname");
  let srcContent = document.createTextNode(source.name);
  let slider = createSlider(source.render, false, {
    action: "SetSceneItemRender",
    name: source.name,
    "scene-name": scename
  });
  srcName.appendChild(srcContent);
  srcName.appendChild(slider);
  src.appendChild(srcName);
  return src;
}
function createElement(name, elClass, tipo) {
  let element = document.createElement(name);
  if (elClass !== undefined) element.className = elClass;
  if (tipo !== undefined) element.type = tipo;
  return element;
}
function createSlider(checked, tipo, data) {
  let slider = createElement("label", "switch");
  let checkbox = createElement("input", undefined, "checkbox");
  if (checked) checkbox.checked = true;
  checkbox.addEventListener("click", (e) => {
    if (tipo) {
      curScene = data.value;
      scnSliders.forEach((el) => (el.checked = false));
      e.target.checked = true;
      socket.emit("obs", {
        action: data.action,
        "scene-name": data.name,
      });
    } else {
      socket.emit("obs", {
        action: data.action,
        source: data.name,
        "scene-name": data["scene-name"],
        render: e.target.checked,
      });
    }
  });
  if (tipo) scnSliders.push(checkbox);
  slider.appendChild(checkbox);
  slider.appendChild(createElement("span", "slider"));
  return slider;
}
/* End create elements */

function calcHeight(el) {
  maxHeight = 0;
  let list = el.querySelector(".content").childNodes;
  list.forEach((entry) => {
    let value = entry.offsetHeight;
    if (value !== undefined) maxHeight += entry.offsetHeight;
  });
  return maxHeight;
}

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
  let data = {
    msg: e.target.elements.text.value,
    opts: {
      voice: e.target.elements.voice.value + e.target.elements.variant.value,
    },
  };
  socket.emit("tts", data);
}

function collapseRow(e) {
  let { target, currentTarget } = e;
  if (target.className.startsWith("fas")) {
    curTar = target.parentElement.parentElement.parentElement;
    let minWidth = curTar.querySelector(".header").offsetHeight;
    let bigHeight = calcHeight(curTar);

    let style = curTar.style;
    style =
      style.height !== minWidth + "px"
        ? (style.height = minWidth + "px")
        : (style.height = minWidth + bigHeight + "px");

    if (curTar.parentElement.parentElement.parentElement.classList.contains("btn-row")) {
      let bigHeightOut = calcHeight(curTar.parentElement.parentElement.parentElement);
      curTar.parentElement.parentElement.parentElement.style = minWidth + bigHeightOut + "px";
    }
  }
}

function connectObs(e) {
  e.preventDefault();
  let inputField = document.querySelector("#obs-dir");
  socket.emit("obs", { action: "connect", value: inputField.value });
}

function getScenes() {
  return socket.emit("obs");
}
