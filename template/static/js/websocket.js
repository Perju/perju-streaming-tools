const ws = new WebSocket("ws://192.168.1.118:8080");

ws.onopen = function () {
  document.querySelector("#send").disabled = false;
  document.querySelector("#send").addEventListener("click", function () {
    let obj = JSON.stringify({
      message: document.querySelector("#message").value,
    });
    ws.send(obj);
  });
};

ws.onmessage = function (msg) {
  let { data } = msg;
  data.text().then((txt) => {
    let obj = JSON.parse(txt);
    console.log(obj.message);
    document.querySelector("#messages").innerHTML += `<p>${obj.message}</p>`;
  });
};
