import path from "path";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import http from "http";
import { Server } from "socket.io";
import PGTwitchBot from "twitch-bot";
import PGDiscordBot from "discord-bot";
import Nlp from "nlp-for-bots";
import text2wav from "text2wav";

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

console.log(staticFolder, viewsFolder);
// app.use(helmet({ frameguard: { action: "allow-from", domain: "http://192.168.1.118:8080" } }));

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
app.get("/*", (req, res) => {
  console.log(req.originalUrl.slice(1));
  res.render(req.originalUrl.slice(1));
});
app.use(express.static(staticFolder));

const server = new http.createServer(app);

// socket.io
let alertSockets = [];
let controlSockets = [];

const io = new Server(server);
io.on("connection", (socket) => {
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

  socket.on("message", (msg) => {
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
});

server.listen(process.env.port || 8080, () => {
  console.log(`Server started no port ${server.address().port} :)`);
});

// test obs-websoket
import OBSWebSocket from "obs-websocket-js";
const obs = new OBSWebSocket();
obs
  .connect({ address: "192.168.1.152:4444" })
  .then((data) => {
    obs.send("SetCurrentScene", { "scene-name": "Cuenta atras" });
  })
  .catch((err) => {
    console.log(err);
  });
