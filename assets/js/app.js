const WORKER_URL = "https://mantosecret.ariadishut.workers.dev/";
const SECRET = "MANTO_TV_SECRET_2026";

const video = document.getElementById("video");
const channels = document.querySelectorAll(".channel");

let hls;
let currentChannel = null;

channels.forEach(ch => {
  ch.addEventListener("click", () => {

    channels.forEach(c => c.classList.remove("active"));
    ch.classList.add("active");

    playTV(ch.dataset.id);
  });
});

async function playTV(channelId){

  currentChannel = channelId;

  if(hls) hls.destroy();

  const exp = Date.now() + 120000;
  const sig = await generateSignature(channelId, exp);

  const proxyUrl =
    `${WORKER_URL}/live/${channelId}?exp=${exp}&sig=${sig}`;

  if(Hls.isSupported()){
    hls = new Hls({
      maxBufferLength:10,
      enableWorker:true,
      capLevelToPlayerSize:true,
      backBufferLength:5
    });

    hls.loadSource(proxyUrl);
    hls.attachMedia(video);
  } else {
    video.src = proxyUrl;
  }

  video.play().catch(()=>{});
}

async function generateSignature(id, exp){

  const data = id + exp + SECRET;

  const encoder = new TextEncoder();
  const hashBuffer =
    await crypto.subtle.digest("SHA-256", encoder.encode(data));

  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2,"0"))
    .join("");
}

document.getElementById("themeToggle")
.addEventListener("click", ()=>{
  document.body.classList.toggle("light");
});

// Autoplay channel pertama
playTV(channels[0].dataset.id);
