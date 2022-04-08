import path from "path";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import https from "https";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import PGTwitchBot from "twitch-bot";
import PGDiscordBot from "discord-bot";
import Nlp from "nlp-for-bots";
import text2wav from "text2wav";
//const { OBSWebSocket } = require ("@duncte123/obs-websocket-js");
import {OBSWebSocket } from "@duncte123/obs-websocket-js";


// obs-websoket
const obs = new OBSWebSocket();
let obsScenes;

// nlp-for-bots
const nlp = new Nlp({ env: process.env });
nlp.init();

// twitch bot
const moduleURL = new URL(import.meta.url);
const __dirname = path.dirname(moduleURL.pathname);

const botConfig = {
  env: process.env,
  advices: __dirname + "/advises.txt",
  relations: __dirname + "/relations.txt",
};
const tBot = new PGTwitchBot(botConfig);
tBot.initBot();

// discord bot
const dBot = new PGDiscordBot({ env: process.env });
dBot.initBot();

// express
const app = express();
const folder = process.env.DEMO === "true" ? "template" : "www";
const staticFolder = path.join(__dirname, folder + "/static");
let viewsFolder = path.join(__dirname, folder + "/views");
import ejs from "ejs";

// permite mostrar el chat embebido de twitch
let privateKey = fs.readFileSync("key.pem");
let certificate = fs.readFileSync("cert.pem");
app.use(cors({ origin: false }));

console.log(staticFolder, viewsFolder);

app.engine(".html", ejs.__express);
app.set("views", viewsFolder);
app.use(express.static(staticFolder));
app.set("view engine", "html");

app.use(express.json());

app.get("/nlp", async (req, res) => {
  let frase = req.body.frase || "nothing";
  let nombre = req.body.nombre;
  let relacion = req.body.relacion || "neutral";
  let answer = await nlp.response(frase, nombre, relacion);
  res.send(answer);
});

app.get("/", (req, res) => {
  //  console.log(req.originalUrl);
  console.log(Object.keys(req));
  res.render("index");
});

app.get("/control-panel", (req, res) => {
  console.log(Object.keys(res));
  console.log("Out data:", res._header);
  res.header("Acces-Control-Allow-Origin", "*");
  res.header(
    "Acces-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("X-Frame-Options", "ALLOW-FROM *");
  const file = __dirname + "/" + folder + "/deck-config.json";
  let jsonData = JSON.parse(fs.readFileSync(file));
  let buttons = jsonData.buttons;
  console.log("Holi: ", buttons);
  res.render("control-panel", {
    buttons,
    serverAddress: process.env.DOMAIN_PARENT,
  });
});

app.get("/*", (req, res) => {
	// console.log(req.originalUrl.slice(1));
  res.render(
    req.originalUrl.slice(1)
  );
});

app.use(express.static(staticFolder));

const server = new https.createServer(
  { key: privateKey, cert: certificate },
  app
);
const serverHttp = new http.createServer(app);

// socket.io
let alertSockets = [];
let controlSockets = [];

const io = new Server(server);
io.on("connection", socketIoHandler);
const ioHttp = new Server(serverHttp);
ioHttp.on("connection", socketIoHandler);

async function socketIoHandler(socket) {
  console.log(`Someone has connected`);

  socket.on("add", (msg) => {
    switch (msg) {
      case "alert-panel":
        alertSockets.push(socket);
        break;
      case "control-panel":
        controlSockets.push(socket);
        break;
      default:
    }
  });

  socket.on("obs", (data) => {
    console.log(data);
    if (data === undefined) return;
    if (data.action === "connect") {
      obs
        .connect({address: data.value})
        .then(() => {
          let scenes = getScenes(obs);
          scenes.then((el) => {
            socket.emit("scenes", JSON.stringify(el));
          });
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      console.log(data.action, data);
      obs.send(data.action, data).catch((err) => {
        console.log(err);
      });
    }
  });

  socket.on("message", (msg) => {
    // console.log(msg);
    alertSockets.concat(controlSockets).forEach((s) => s.emit("message", msg));
  });

  socket.on("close", () => {
    alertSockets = alertSockets.filter((s) => s !== socket);
    controlSockets = controlSockets.filter((s) => s !== socket);
  });

  socket.on("twitch-bot", (msg) => {
    if (msg === "start-advises") tBot.startAdvises();
    if (msg === "stop-advises") tBot.stopAdvises();
  });

  socket.on("tts", async (data) => {
    // meSpeak.loadVoice("voices/es.json");
    // let speakOpts = {
    //   amplitude: 100,
    //   pitch: 60, // 50
    //   speed: 150, // 175
    //   variant: "f5",
    // };
    // meSpeak.speak(data.msg, speakOpts);
    // console.log(data.opts.voice);
    let voiceData = await text2wav(data.msg, { voice: data.opts.voice });
    alertSockets.forEach((s) => s.emit("tts", voiceData.buffer));
  });

  // socket.on("speech", function (voices) {
  //   console.log("voice 0: ", voices[0], "\nvoices: ", voices);
  // });
}

function getScenes(obs) {
  return obs.send("GetSceneList");
}

server.listen(process.env.HTTPS_PORT || 5000, () => {
  console.log(`Server started no port ${server.address().port} :)`);
});
serverHttp.listen(process.env.HTTP_PORT || 5001, () => {
  console.log(`Server started no port ${serverHttp.address().port} :)`);
});
