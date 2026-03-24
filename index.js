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
  f.append("token", localStorage.getItem("session_token"));

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
    fireRealConfetti();
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

async function submitRedeem(){
  const code = document.getElementById("redeemInput").value;
  const token = localStorage.getItem("session_token");

  if(!code){
    showPopup("ERROR", "Masukkan kode terlebih dahulu");
    return;
  }

  try{
    const res = await fetch(API,{
      method:"POST",
      body:new URLSearchParams({
        action:"redeemCode",
        token: token,
        code: code
      })
    });

    const data = await res.json();

    if(data.status){
      // ✅ BERHASIL
      showPopup("BERHASIL", data.message);
      fireRealConfetti();
      loadProfile();
      document.getElementById("redeemInput").value = "";
    }else{
      // ❌ GAGAL
      showPopup("GAGAL", data.message);
    }

  }catch(err){
    showPopup("ERROR", "Server error");
    console.error(err);
  }
}

function kirimPoin(){
  const target = document.getElementById("targetUser").value;
  const jumlah = document.getElementById("jumlahPoin").value;

  if(!target || !jumlah){
    showPopup("ERROR","Isi semua data");
    return;
  }

  // simpan sementara
  window.tmpTarget = target;
  window.tmpJumlah = jumlah;

  document.getElementById("confirmText").innerText =
    `Kirim ${jumlah} poin ke ${target}?`;

  document.getElementById("confirmPopup").style.display = "flex";
}

async function prosesTransfer(){
  document.getElementById("confirmPopup").style.display = "none";

  document.getElementById("spinTitle").innerText = "MEMPROSES";
  document.getElementById("spinText").innerText = "Mengirim poin...";
  document.getElementById("spinPopup").style.display = "flex";

  const token = localStorage.getItem("session_token");

  const res = await fetch(API,{
    method:"POST",
    body:new URLSearchParams({
      action:"transferPoin",
      token: token,
      target: window.tmpTarget,
      jumlah: window.tmpJumlah
    })
  });

  const data = await res.json();

  if(data.status){
    fireRealConfetti();
    loadProfile();
    loadTransferHistory();

    showPopup("BERHASIL", data.message);
  }else{
    showPopup("GAGAL", data.message);
  }
}

function closeConfirm(){
  document.getElementById("confirmPopup").style.display = "none";
}

async function checkTransferNotif(){
  const token = localStorage.getItem("session_token");

  const res = await fetch(API,{
    method:"POST",
    body:new URLSearchParams({
      action:"getTransferNotif",
      token: token
    })
  });

  const data = await res.json();

  if(data.status && data.data.length > 0){
    data.data.forEach(n=>{
      pushNotif(`💰 Kamu menerima ${n.jumlah} poin dari ${n.from}`);
    });
  }
}

async function loadTransferHistory(){
  const token = localStorage.getItem("session_token");

  const res = await fetch(API,{
    method:"POST",
    body:new URLSearchParams({
      action:"getTransferHistory",
      token: token
    })
  });

  const data = await res.json();

  let html = "<div class='card'><h3>Riwayat Transfer</h3>";

  data.data.forEach(d=>{
    html += `
      <div style="font-size:13px;margin-bottom:6px;">
        ${d.tipe === 'kirim' ? '➡️ Kirim ke' : '⬅️ Terima dari'} 
        <b>${d.nama}</b> - ${d.jumlah} poin
      </div>
    `;
  });

  html += "</div>";

  document.getElementById("transferHistory").innerHTML = html;
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

function animateWheel(label, point) {
  const wheel = document.getElementById("wheel");

  const prizes = [
    "ZONK",
    "1 poin",
    "3 poin",
    "10 poin",
    "100 poin"
  ];

  const index = prizes.indexOf(label);
  if (index === -1) return;

  const total = prizes.length; // 5
  const sector = 360 / total;  // 72°
  const center = sector / 2;   // 36°
  const pointer = 270;         // panah di atas

  const spins = 7;

  const finalDeg =
    spins * 360 +
    pointer -
    (index * sector) -
    center;

  wheel.style.transition = "none";
  wheel.style.transform = "rotate(0deg) rotateX(6deg)";

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      wheel.style.transition =
        "transform 5s cubic-bezier(0.15, 0.85, 0.25, 1)";
      wheel.style.transform =
        `rotate(${finalDeg}deg) rotateX(6deg)`;
    });
  });

  setTimeout(() => {
    showSpinResult(label, point);
  }, 5200);
}

function showSpinResult(label, point){
  spinPopup.style.display="flex";

  if(point > 0){
  spinTitle.textContent = "SELAMAT";
  spinText.textContent = `Kamu mendapatkan ${label}`;
  fireRealConfetti();
  loadProfile(); // ⬅️ ini penting
}
else{
  spinTitle.textContent = "ZONK";
  spinText.textContent = "Kamu belum beruntung hari ini, coba lagi besok.";
}

const ringFast = document.getElementById("ringFast");

// reset dulu
ringFast.classList.remove("win");

if (point > 0) {
  ringFast.classList.add("win");

  // matikan setelah 10 detik
  setTimeout(() => {
    ringFast.classList.remove("win");
  }, 10000);
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
  lockRedeemIfNotLogin();
  checkTransferNotif();
  startLiveFeed();

  if (isLogin()) {
    showTab("home", document.querySelector("nav div[data-tab='home']"));
    checkSpinStatus();
  }
});

function fireRealConfetti() {
  const colors = ['#FFD54F', '#FF5252', '#40C4FF', '#69F0AE', '#B388FF'];

  const base = {
    particleCount: 22,     // ⬅️ naik dikit (sebelumnya 14)
    startVelocity: 36,     // ⬅️ lebih nendang tapi aman
    spread: 78,            // ⬅️ ledakan makin lebar
    ticks: 200,            // ⬅️ jatuhnya lebih lama
    gravity: 1.15,
    scalar: 0.95,
    shapes: ['square'],
    colors
  };

  confetti({ ...base, angle: 90,  origin: { x: 0.5, y: 0.48 } });
  setTimeout(() => confetti({ ...base, angle: -90, origin: { x: 0.5, y: 0.52 } }), 120);
  setTimeout(() => confetti({ ...base, angle: 0,   origin: { x: 0.48, y: 0.5 } }), 240);
  setTimeout(() => confetti({ ...base, angle: 180, origin: { x: 0.52, y: 0.5 } }), 360);
}

function goTukarPoin() {
  window.location.href = "penukaran.html";
}

function lockRedeemIfNotLogin(){
  const btn = document.getElementById("redeemBtn");
  const icon = document.getElementById("redeemLock");

  if(!isLogin()){
    btn.classList.add("locked");
    icon.style.display = "block";
  }else{
    btn.classList.remove("locked");
    icon.style.display = "none";
  }
}

function goRedeem(){
  if(!isLogin()){
    showPopup("LOGIN DULU","Silakan login untuk membuka fitur ini.");
    return;
  }

  showTab("redeem", document.querySelector(".nav-center"));
}

function openQuick(){
  document.getElementById("quickPopup").style.display = "flex";
}

function closeQuick(){
  document.getElementById("quickPopup").style.display = "none";
}

function setJumlah(val){
  document.getElementById("jumlahPoin").value = val;
  closeQuick();
}

let riwayatVisible = false;

async function toggleRiwayat(){
  const el = document.getElementById("transferHistory");

  if(!riwayatVisible){
    el.style.display = "block";

    // ⬇️ loading dulu
    el.innerHTML = `
      <div class="card" style="text-align:center">
        <i class="fa-solid fa-spinner fa-spin"></i>
        <div style="font-size:13px;margin-top:6px;color:#94a3b8">
          Memuat riwayat...
        </div>
      </div>
    `;

    await loadTransferHistory();

    riwayatVisible = true;
  }else{
    el.style.display = "none";
    riwayatVisible = false;
  }
}

function startLiveFeed(){
  const el1 = document.getElementById("liveTrack1");
  const el2 = document.getElementById("liveTrack2");

  const names = [
    "U177*******274",
    "U177*******433",
    "U177*******909",
    "U177*******567",
    "U177*******874",
    "U177*******563",
    "U177*******987",
    "U177*******197",
    "U177*******084",
    "U177*******210"
  ];

  const rewards = [10,20,50,100];

  let text = "";

  for(let i=0;i<20;i++){
    const user = names[Math.floor(Math.random()*names.length)];
    const poin = rewards[Math.floor(Math.random()*rewards.length)];

    text += `${user} mendapatkan ${poin} poin 🔥   •   `;
  }

  el1.innerText = text;
  el2.innerText = text; // duplikat biar loop halus
}

let notifQueue = [];
let notifRunning = false;

function pushNotif(text){
  notifQueue.push(text);
  runNotifQueue();
}

function runNotifQueue(){
  if(notifRunning) return;
  if(notifQueue.length === 0) return;

  notifRunning = true;

  const el = document.getElementById("topNotif");
  const text = notifQueue.shift();

  el.innerText = text;
  el.classList.add("show");

  setTimeout(()=>{
    el.classList.remove("show");

    setTimeout(()=>{
      notifRunning = false;
      runNotifQueue();
    }, 400);

  }, 2500);
}
