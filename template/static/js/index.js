window.onload = timer(900);

function timer(seconds) {
  let elTimer = document.getElementById("timer");
  if (seconds >= 0) {
    let min = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    let sec = (seconds % 60).toString().padStart(2, "0");
    elTimer.innerHTML = min + ":" + sec;
    setTimeout(() => {
      timer(seconds - 1);
    }, 1000);
  }
  if(seconds <= 60) {elTimer.style ="color: red"}
  else if(seconds <= 300) {elTimer.style ="color: yellow"}
  else {elTimer.style = "color: green"};
}
// Si quereis que el Sr.Berenjena siga siendo feliz, no os levanteis de
// vuestras sillas y estad atentos a lo que se viene.
