const API = "https://script.google.com/macros/s/AKfycbxDR0i9x5xF8YDYeWR7YE3lrjtCLocOtP2eGIQXpnQIMMHGgZn0JLJwyQ63ubUjCBPU/exec";

let userStatus = "";

function isLogin() {
  return !!localStorage.getItem("session_token");
}

function showTab(id, el){

  // hide semua section
  document.querySelectorAll('.section')
    .forEach(s => s.classList.remove('active'));

  // tampilkan yang dipilih
  document.getElementById(id).classList.add('active');

  // =====================
  // NAV HP ACTIVE
  // =====================
  document.querySelectorAll('nav div')
    .forEach(n => n.classList.remove('active'));

  const navTarget = document.querySelector(`nav div[data-tab="${id}"]`);
  if(navTarget) navTarget.classList.add('active');

  // =====================
  // SIDEBAR ACTIVE (INI YANG PENTING)
  // =====================
  document.querySelectorAll('.sidebar-desktop .menu-item')
    .forEach(item => item.classList.remove('active'));

  const sideTarget = document.querySelector(`.sidebar-desktop .menu-item[data-tab="${id}"]`);
  if(sideTarget) sideTarget.classList.add('active');
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
  
  userStatus = r.user.status;

document.getElementById("username").textContent = r.user.username;

document.getElementById("userid").textContent = r.user.user_id;

document.getElementById("emailUser").textContent = r.user.email;

document.getElementById("pointBig").textContent = r.user.point;

document.getElementById("loginBtn").style.display = "none";

document.getElementById("statusAkun").style.display = "block";

document.getElementById("referralCode").textContent = r.user.referral_code;

document.getElementById("referralCount").textContent = r.user.referral_count;

const count = r.user.referral_count || 0;
const max = 5;

// update text
document.getElementById("refProgressText").textContent =
  `Progress: ${count} / ${max}`;

// hitung persen
let percent = (count / max) * 100;
if(percent > 100) percent = 100;

// update bar
document.getElementById("refBar").style.width = percent + "%";

const status = document.getElementById("statusAkun");

if(r.user.status === "verifikasi"){
  status.textContent = "Verifikasi";
  status.style.background = "#16a34a";
}else{
  status.textContent = "Belum Verifikasi";
  status.style.background = "#dc2626";
}

document.getElementById("detailContent").innerHTML = `
<div class="detail-row">
  <span class="label">Username</span>
  <span class="colon">:</span>
  <span class="value">${r.user.username}</span>
</div>

<div class="detail-row">
  <span class="label">User ID</span>
  <span class="colon">:</span>
  <span class="value">${r.user.user_id}</span>
</div>

<div class="detail-row">
  <span class="label">ID Game</span>
  <span class="colon">:</span>
  <span class="value">${r.user.email}</span>
</div>

<div class="detail-row">
  <span class="label">Status</span>
  <span class="colon">:</span>
  <span class="value status-text">${r.user.status}</span>
</div>
`;

const statusText = document.querySelector(".status-text");

if(statusText){
  if(r.user.status === "verifikasi"){
    statusText.classList.add("status-verif");
  }else{
    statusText.classList.add("status-belum");
  }
}

const badge = document.getElementById("userBadge");

if(r.user.title){

  loadFeedbackFeature();

  if(r.user.title_icon.startsWith("fa-")){

    badge.innerHTML = `
  <i class="fa-solid ${r.user.title_icon}" 
     style="cursor:pointer"
     onclick="showTitleInfo('${r.user.title}')">
  </i>
`;

  }else{

    badge.innerHTML = `
  <img src="${r.user.title_icon}" width="14"
       style="cursor:pointer"
       onclick="showTitleInfo('${r.user.title}')">
`;

  }

  badge.style.display = "flex";

}

}

async function loadPopupPromo(){

  if(!isLogin()) return;

  // 🔥 CEK LOCAL STORAGE (3 JAM)
  const lastHide = localStorage.getItem("hidePromoUntil");
  if(lastHide && Date.now() < Number(lastHide)){
    return;
  }

  const f = new URLSearchParams();
  f.append("action","getPopupPromo");

  try{
    const res = await fetch(API,{
      method:"POST",
      body:f
    });

    const r = await res.json();

    if(!r.status) return;

    const d = r.data;

    document.getElementById("promoImg").src = d.image_url;
    document.getElementById("promoTitle").innerText = d.title;
    document.getElementById("promoDesc").innerText = d.description;
    document.getElementById("promoLink").href = d.link;

    setTimeout(()=>{
      document.getElementById("promoPopup").classList.add("show");
    }, 800);

  }catch(err){
    console.error(err);
  }
}

function closePromo(){

  const checkbox = document.getElementById("dontShowPromo");

  // 🔥 kalau dicentang → simpan 3 jam
  if(checkbox.checked){
    const threeHours = 3 * 60 * 60 * 1000;
    const expireTime = Date.now() + threeHours;

    localStorage.setItem("hidePromoUntil", expireTime);
  }

  document.getElementById("promoPopup").classList.remove("show");
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
  
  if(userStatus !== "verifikasi"){
  showVerifPopup();
  return;
}

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

    // =====================
    // LOCK NAV HP
    // =====================
    document.querySelectorAll("nav div.lock").forEach(el => {
      el.style.pointerEvents = "none";
      el.style.opacity = "0.45";

      const icon = el.querySelector(".lock-icon");
      if (icon) icon.style.display = "block";
    });

    // =====================
    // LOCK SIDEBAR DESKTOP
    // =====================
    document.querySelectorAll(".sidebar-desktop .lock").forEach(el => {
      el.style.pointerEvents = "none";
      el.style.opacity = "0.45";

      const icon = el.querySelector(".lock-icon");
      if (icon) icon.style.display = "inline-block";
    });

    // =====================
    // PAKSA KE MENU SAYA
    // =====================
    document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
    document.getElementById("saya").classList.add("active");

    document.querySelectorAll("nav div").forEach(n => n.classList.remove("active"));
    document.querySelector("nav div[data-tab='saya']").classList.add("active");

    document.querySelectorAll(".sidebar-desktop .menu-item")
      .forEach(n => n.classList.remove("active"));

    document.querySelector(".sidebar-desktop .menu-item[data-tab='saya']")
      ?.classList.add("active");

    return;
  }

  // =====================
  // JIKA SUDAH LOGIN
  // =====================
  document.querySelectorAll("nav div.lock").forEach(el => {
    el.style.pointerEvents = "auto";
    el.style.opacity = "1";

    const icon = el.querySelector(".lock-icon");
    if (icon) icon.style.display = "none";
  });

  document.querySelectorAll(".sidebar-desktop .lock").forEach(el => {
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
  loadNotifications();
  loadNotifIcon();
  loadPopupPromo();

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

function toggleMenu(id){

  const contents = document.querySelectorAll(".menu-content");
  const headers = document.querySelectorAll(".menu-item");

  contents.forEach(el=>{
    if(el.id !== id){
      el.style.maxHeight = null;
    }
  });

  headers.forEach(h=>{
    h.classList.remove("active");
  });

  const el = document.getElementById(id);
  const header = el.previousElementSibling;

  if(el.style.maxHeight){
    el.style.maxHeight = null;
    header.classList.remove("active");
  }else{
    el.style.maxHeight = el.scrollHeight + "px";
    header.classList.add("active");
  }

}

function showVerifPopup(){

  const popup = document.createElement("div");

  popup.innerHTML = `
  <div class="popup-overlay">
    <div class="popup-box">

      <p>Silakan verifikasi akun<br>untuk menggunakan fitur ini</p>

      <button onclick="this.closest('.popup-overlay').remove()">
        Lanjut
      </button>

    </div>
  </div>
  `;

  document.body.appendChild(popup);

}

function showTitleInfo(title){

  const data = titleInfo[title];

  if(!data){
    showPopup("INFO", "Title tidak ditemukan");
    return;
  }

  showPopup(data.title, data.desc);
}

const titleInfo = {
  "Founder": {
    title: "Founder",
    desc: "Pemilik resmi RavenStore. Memiliki akses penuh ke semua sistem."
  },
  "Staff": {
    title: "Staff",
    desc: "Tim yang membantu mengelola dan menjaga RavenStore."
  },
  "Contributor": {
    title: "Contributor",
    desc: "User yang ikut berkontribusi dalam pengembangan RavenStore."
  },
  "Supporter": {
    title: "Supporter",
    desc: "User yang mendukung perkembangan RavenStore."
  },
  "VIP Member": {
    title: "VIP Member",
    desc: "Member spesial dengan aktivitas tinggi dan benefit khusus."
  },
  "Top player": {
    title: "Top Player",
    desc: "User yang sering memenangkan event dan challenge."
  }
};

async function loadNotifications(){
  const token = localStorage.getItem("session_token");

  const res = await fetch(API,{
    method:"POST",
    body:new URLSearchParams({
      action:"getNotifications",
      token: token
    })
  });

  const data = await res.json();

  const box = document.getElementById("notifBox");

  if(!data.status || data.data.length === 0){
    box.innerHTML = "<i>Tidak ada pemberitahuan</i>";
    return;
  }

  let html = "";

  data.data.forEach(n => {

    let color = "#38bdf8";

    if(n.type === "warning") color = "#f87171";
    if(n.type === "maintenance") color = "#facc15";

    html += `
      <div class="card" style="border-left:4px solid ${color}">
        <b>${n.title}</b>
        <div style="font-size:13px;margin-top:4px">
          ${n.message}
        </div>
      </div>
    `;
  });

  box.innerHTML = html;
}

async function loadNotifIcon(){
  const token = localStorage.getItem("session_token");

  const res = await fetch(API,{
    method:"POST",
    body:new URLSearchParams({
      action:"getNotifications",
      token: token
    })
  });

  const data = await res.json();

  const dot = document.getElementById("notifDot");

  if(data.unread){
    dot.style.display = "block";
  }else{
    dot.style.display = "none";
  }
}

async function openNotifPopup(){
  document.getElementById("notifPopup").style.display = "flex";

  const token = localStorage.getItem("session_token");

  const res = await fetch(API,{
    method:"POST",
    body:new URLSearchParams({
      action:"getNotifications",
      token: token
    })
  });

  const data = await res.json();
  const box = document.getElementById("notifList");

  let html = "";

  data.data.forEach(n => {

    let color = "#38bdf8";
    if(n.type === "warning") color = "#f87171";

    html += `
      <div style="
        border-left:4px solid ${color};
        padding:8px;
        margin-bottom:8px;
        opacity:${n.isRead ? "0.5" : "1"};
      ">
        <b>${n.title}</b>
        <div style="font-size:13px">${n.message}</div>
      </div>
    `;
  });

  box.innerHTML = html;
}

async function markNotifRead(){
  const token = localStorage.getItem("session_token");

  await fetch(API,{
    method:"POST",
    body:new URLSearchParams({
      action:"markNotifRead",
      token: token
    })
  });

  document.getElementById("notifPopup").style.display = "none";

  loadNotifIcon(); // 🔴 hilang
}

function closeNotifPopup(){
  document.getElementById("notifPopup").style.display = "none";
}

function renderNotif(data){
  const box = document.getElementById("notifList");
  box.innerHTML = "";

  if(data.length === 0){
    box.innerHTML = "<i>Tidak ada pemberitahuan</i>";
    return;
  }

  data.forEach(n => {
    box.innerHTML += `
      <div class="notif-item">
        ${n.pesan}
      </div>
    `;
  });
}

async function submitFeedback(){

  const text = document.getElementById("feedbackText").value;
  const token = localStorage.getItem("session_token");
  const btn = document.querySelector("#feedbackBox button");

  if(!text){
    showPopup("ERROR","Isi feedback dulu");
    return;
  }

  // 🔥 DISABLE BUTTON + SPINNER
  const oldText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

  // 🔥 POPUP LOADING
  document.getElementById("spinTitle").innerText = "MENGIRIM";
  document.getElementById("spinText").innerText = "Feedback sedang dikirim...";
  document.getElementById("spinPopup").style.display = "flex";

  try{

    const res = await fetch(API,{
      method:"POST",
      body:new URLSearchParams({
        action:"sendFeedback",
        token: token,
        pesan: text
      })
    });

    const data = await res.json();

    // 🔥 TUTUP LOADING
    document.getElementById("spinPopup").style.display = "none";

    // 🔥 BALIKIN BUTTON
    btn.disabled = false;
    btn.innerHTML = oldText;

    if(data.status){
      showPopup("BERHASIL","Feedback terkirim!");
      document.getElementById("feedbackText").value = "";
    }else{
      showPopup("GAGAL", data.message);
    }

  }catch(err){

    document.getElementById("spinPopup").style.display = "none";
    btn.disabled = false;
    btn.innerHTML = oldText;

    showPopup("ERROR","Server error");
    console.error(err);
  }
}

function loadFeedbackFeature(){
  document.getElementById("feedbackBox").innerHTML = `
    <div class="card feedback-box">
      <h3>💬 Kirim Feedback</h3>

      <textarea id="feedbackText" placeholder="Tulis saran atau ide kamu..."></textarea>

      <button onclick="submitFeedback()">
        KIRIM
      </button>
    </div>
  `;
}

function copyReferral(){
  const code = document.getElementById("referralCode").textContent;

  if(!code || code === "-"){
    showPopup("ERROR","Kode belum tersedia");
    return;
  }

  navigator.clipboard.writeText(code);

  showPopup("BERHASIL","Kode referral disalin!");
}

function shareReferral(){
  const code = document.getElementById("referralCode").textContent;

  if(!code || code === "-"){
    showPopup("ERROR","Kode belum tersedia");
    return;
  }

  const link = `https://raventstore.netlify.app/daftar.html?ref=${code}`;

  const text = `🔥 Daftar di RavenStore pakai kode referral aku: ${code}\n\n👉 ${link}`;

  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
}

// ===============================
// PREMIUM SPIN SYSTEM
// ===============================

let premiumWheel = document.getElementById("premiumWheelImg");
let premiumSpinning = false;

async function premiumSpin(){

if(premiumSpinning) return;

// cek login
if(!isLogin()){
showPopup("LOGIN DULU","Silakan login untuk menggunakan fitur ini.");
return;
}

// cek title
if(!document.getElementById("userBadge").innerHTML){
showPopup("AKSES DITOLAK","Spin premium hanya untuk user yang memiliki title.");
return;
}

premiumSpinning = true;

const btn = document.getElementById("premiumSpinBtn");

btn.disabled = true;
btn.style.opacity = "0.6";
btn.textContent = "MEMUTAR...";

const token = localStorage.getItem("session_token");

try{

const res = await fetch(API,{
method:"POST",
body:new URLSearchParams({
action:"spinPremium",
token:token
})
});

const data = await res.json();

if(!data.status){
showPopup("GAGAL",data.message);
premiumSpinning = false;
return;
}

// =====================
// HITUNG POSISI RODA
// =====================

const index = data.index;

// jumlah sektor roda premium
const total = 6;

const sector = 360 / total;
const center = sector / 2;
const pointer = 180; // pointer roda di atas

const spins = 6;

const offset = sector / 19;

const finalDeg =
(spins * 360) +
((total - index) * sector) -
offset;

// reset animasi
premiumWheel.style.transition = "none";
premiumWheel.style.transform = "rotate(0deg)";

requestAnimationFrame(()=>{
requestAnimationFrame(()=>{
premiumWheel.style.transition =
"transform 5s cubic-bezier(.17,.67,.28,1)";
premiumWheel.style.transform =
`rotate(${finalDeg}deg)`;
});
});

// =====================
// HASIL SPIN
// =====================

setTimeout(()=>{

showPopup("SELAMAT",data.label);

// kalau reward poin update profile
if(data.type === "point"){
loadProfile();
}

premiumSpinning = false;

const btn = document.getElementById("premiumSpinBtn");
btn.disabled = false;
btn.style.opacity = "1";
btn.textContent = "SPIN";

},5200);

}catch(err){

console.error(err);

showPopup("ERROR","Server tidak merespon");

premiumSpinning = false;

}

}

// tombol spin
document.getElementById("premiumSpinBtn").onclick = premiumSpin;
