const API = "https://script.google.com/macros/s/AKfycbxDR0i9x5xF8YDYeWR7YE3lrjtCLocOtP2eGIQXpnQIMMHGgZn0JLJwyQ63ubUjCBPU/exec";

function isLogin() {
  return !!localStorage.getItem("session_token");
}

function showTab(id,el){
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('nav div').forEach(n=>n.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  el.classList.add('active');
}

async function loadProfile(){
  if (!isLogin()) {
    document.getElementById("profile").innerHTML = `
      <b>Kamu belum login</b>
      <div class="profile-line"></div>
      <p style="font-size:13px;color:#94a3b8">
        Login untuk melihat profil dan poin kamu
      </p>
      <button onclick="location.href='login.html'">
        LOGIN
      </button>
    `;
    document.getElementById("pointBig").textContent = "-";
    return;
  }

  const token = localStorage.getItem("session_token");

  const f = new URLSearchParams();
  f.append("action","getUserProfile");
  f.append("token",token);

  const r = await fetch(API,{method:"POST",body:f}).then(r=>r.json());
  if(!r.status) return logout();

  avatar.textContent = r.user.username[0].toUpperCase();
  profile.innerHTML = `
    <b>${r.user.username}</b>
    <div class="profile-line"></div>
    <span style="color:#94a3b8">${r.user.email}</span>
    <div class="profile-line"></div>
    <span style="font-size:12px;color:#64748b">
      ID: ${r.user.user_id}
    </span>
  `;

  document.getElementById("pointBig").textContent = r.user.point;
}

async function loadNews(){
  const f=new URLSearchParams();
  f.append("action","getNews");
  const r=await fetch(API,{method:"POST",body:f}).then(r=>r.json());
  if(!r.status) return;
  newsBox.innerHTML = "";

r.data.forEach(n => {
  let html = `<div class="news-box">`;

  if (n.thumbnail) {
    html += `<img src="${n.thumbnail}" class="news-image">`;
  }

  html += `
    <div class="news-body">
      <div class="news-title">${n.judul}</div>
      <div class="news-text">${n.isi}</div>
  `;

  if (n.link) {
    html += `
      <a href="${n.link}" target="_blank" class="news-link">
        Buka Selengkapnya
      </a>
    `;
  }

  html += `
    </div>
  </div>
  `;

  newsBox.innerHTML += html;
});
}

let currentEvent = null;

async function loadChallenge(){
  const f = new URLSearchParams();
  f.append("action","getChallenge");

  const r = await fetch(API,{method:"POST",body:f}).then(r=>r.json());

  if(!r.aktif){
    guessBox.innerHTML = "<i>Belum ada event tebak angka.</i>";
    return;
  }

  currentEvent = r;
  renderGuessInput(r.digit);
}

function renderGuessInput(digit){
  guessBox.innerHTML = "";

  for(let i=0;i<digit;i++){
    const inp = document.createElement("input");
    inp.type = "number";
    inp.maxLength = 1;
    inp.oninput = () => {
      if(inp.value.length > 1) inp.value = inp.value.slice(0,1);
      if(inp.nextElementSibling) inp.nextElementSibling.focus();
    };
    guessBox.appendChild(inp);
  }
}

async function submitGuess(){
  if (!isLogin()) {
  showPopup("LOGIN DULU", "Silakan login untuk mengikuti event.");
  return;
}
  if(!currentEvent){
    showPopup("EVENT BERAKHIR","Nantikan event selanjutnya.");
    return;
  }
  
  const btn = document.getElementById("guessBtn");
  btn.disabled = true;
  const oldText = btn.innerHTML;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

  const inputs = guessBox.querySelectorAll("input");
  let guess = "";

  for(const i of inputs){
    if(i.value === ""){
      showPopup("ERROR","Isi semua digit terlebih dahulu.");
      return;
    }
    guess += i.value;
  }

  const f = new URLSearchParams();
  f.append("action","submitGuess");
  f.append("event_id",currentEvent.event_id);
  f.append("guess",guess);
  const token = localStorage.getItem("session_token");
  f.append("user_id", token);
  f.append("token", token);

  const r = await fetch(API,{method:"POST",body:f}).then(r=>r.json());
  
  btn.disabled = false;
  btn.innerHTML = oldText;

  if(r.status === "win"){
    showPopup("SELAMAT",`Kamu mendapatkan ${r.reward} poin!`);
    loadProfile();
    currentEvent = null;
  }
  else if(r.status === "lose"){
    showPopup("SALAH","Angka salah, silakan tebak lagi.");
  }
  else{
    showPopup("EVENT BERAKHIR","Nantikan event selanjutnya.");
    currentEvent = null;
  }
}

async function spin(){
  if (!isLogin()) {
  showPopup("LOGIN DULU", "Silakan login untuk menggunakan fitur ini.");
  return;
}
  const btn = document.getElementById("spinBtn");
  btn.disabled = true;
  btn.textContent = "MEMUTAR...";

  const f = new URLSearchParams();
  f.append("action","spin");
  f.append("token", localStorage.getItem("session_token"));

  const r = await fetch(API,{method:"POST",body:f}).then(r=>r.json());

  if(!r.status){
  spinPopup.style.display = "flex";
  spinTitle.textContent = "SPIN HARI INI HABIS";
  spinText.textContent = "Kamu sudah menggunakan spin hari ini. Silakan kembali besok ya 👋";

  lockSpinUI();
  return;
}

  animateWheel(r.hadiah, r.poin);
}

async function checkSpinStatus(){
  const f = new URLSearchParams();
  f.append("action","checkSpin");
  f.append("token",token);

  const r = await fetch(API,{method:"POST",body:f}).then(r=>r.json());
  if(r.status && r.alreadySpin){
    lockSpinUI();
  }
}

checkSpinStatus();
setInterval(checkSpinStatus, 5000);

function animateWheel(label, point){
  const wheel = document.getElementById("wheel");

  // mapping hadiah → posisi roda
  const map = {
    "ZONK": 0,
    "1 poin": 60,
    "3 poin": 120,
    "10 poin": 180,
    "100 poin": 240
  };

  const base = 360 * 5; // muter 5x
  const deg = base + (map[label] || 300);

  wheel.style.transform = `rotate(${deg}deg)`;

  setTimeout(()=>{
    showSpinResult(label, point);
  },4000);
}

function showSpinResult(label, point){
  spinPopup.style.display="flex";

  if(point > 0){
  spinTitle.textContent = "SELAMAT";
  spinText.textContent = `Kamu mendapatkan ${label}`;
  loadProfile(); // ⬅️ ini penting
}
else{
  spinTitle.textContent = "ZONK";
  spinText.textContent = "Kamu belum beruntung hari ini, coba lagi besok.";
}
}

let spinLocked = false;

function lockSpinUI(){
  if(spinLocked) return;
  spinLocked = true;

  spinBtn.disabled = true;
  spinBtn.style.opacity = "0.6";
  spinBtn.textContent = "SUDAH SPIN";
  spinInfo.textContent = "Kembali lagi besok untuk melakukan spin";
}

function closeSpin(){
  spinPopup.style.display="none";
}

function logout(){
  localStorage.removeItem("session_token");
  location.href="login.html";
}

function showPopup(title,text){
  spinTitle.textContent = title;
  spinText.textContent = text;
  spinPopup.style.display="flex";
}

function lockMenuIfNotLogin() {
  if (!isLogin()) {
    // kunci menu
    document.querySelectorAll("nav div.lock").forEach(el => {
      el.style.pointerEvents = "none";
      el.style.opacity = "0.45";
      const icon = el.querySelector(".lock-icon");
      if (icon) icon.style.display = "block";
    });

    // paksa ke tab saya
    document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
    document.getElementById("saya").classList.add("active");

    document.querySelectorAll("nav div").forEach(n => n.classList.remove("active"));
    document.querySelector("nav div[data-tab='saya']").classList.add("active");

    return;
  }

  // jika SUDAH login → buka kunci
  document.querySelectorAll("nav div.lock").forEach(el => {
    el.style.pointerEvents = "auto";
    el.style.opacity = "1";
    const icon = el.querySelector(".lock-icon");
    if (icon) icon.style.display = "none";
  });
}

function activateHome() {
  showTab("home", document.querySelector("nav div[data-tab='home']"));
}

document.addEventListener("DOMContentLoaded", () => {
  loadNews();
  loadChallenge();
  loadProfile();
  lockMenuIfNotLogin();

  if (isLogin()) {
    showTab("home", document.querySelector("nav div[data-tab='home']"));
    checkSpinStatus();
  }
});
