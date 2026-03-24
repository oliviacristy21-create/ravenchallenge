const URL = "https://script.google.com/macros/s/AKfycbxDR0i9x5xF8YDYeWR7YE3lrjtCLocOtP2eGIQXpnQIMMHGgZn0JLJwyQ63ubUjCBPU/exec";

let selectedItem = "";
let selectedHarga = 0;
let userStatus = "";

async function loadReward(){
  const res = await fetch(URL,{
    method:"POST",
    body:new URLSearchParams({
      action:"getRewards"
    })
  });

  const data = await res.json();

  let html = "";

  data.data.forEach(r=>{
    html += `
    <div class="card" onclick="tukar('${r.nama}',${r.harga})">
  <i class="fas fa-gem icon-diamond"></i>
  <div class="item-name">${r.nama}</div>
  <div class="price">${r.harga} poin</div>
</div>
    `;
  });

  document.getElementById("listReward").innerHTML = html;
}

let overlay, icon, text;

document.addEventListener("DOMContentLoaded", () => {
  overlay = document.getElementById("overlay");
  icon = document.getElementById("icon");
  text = document.getElementById("text");
});

function modal(type,msg){
  overlay.style.display="flex";

  icon.innerHTML =
    type==="load" ? `<div class="spinner"></div>` :
    type==="ok"   ? `<div class="success">✔</div>` :
                    `<div class="error">✖</div>`;

  text.textContent = msg;

  if(type==="err"){
    setTimeout(()=>overlay.style.display="none",1800);
  }
}

function tukar(item,harga){

  // 🚫 CEK STATUS AKUN DULU
  if(userStatus !== "verifikasi"){
    icon.innerHTML = `<div class="error">!</div>`;
text.textContent = "Akun kamu belum diverifikasi";

document.getElementById("actions").style.display = "none";
document.getElementById("singleAction").style.display = "block";

overlay.style.display = "flex";
    return;
  }

  // ✅ kalau sudah verifikasi
  selectedItem = item;
  selectedHarga = harga;

  icon.innerHTML = "";
  text.textContent = "Tukar " + harga + " poin untuk mendapatkan " + item + "?";
  
  document.getElementById("actions").style.display = "block";
  overlay.style.display = "flex";
}

function closeModal(){
  document.getElementById("overlay").style.display = "none";
}

async function confirmTukar(){
  const token = localStorage.getItem("session_token");
  const actions = document.getElementById("actions");

  actions.style.display = "none";
  modal("load","Memproses penukaran...");

  try{
    const res = await fetch(URL,{
      method:"POST",
      body:new URLSearchParams({
        action:"tukarPoin",
        token: token,
        item:selectedItem,
        harga:selectedHarga
      })
    });

    const data = await res.json();

    if(data.status){
      modal("ok","Penukaran berhasil");
      setTimeout(()=>{
        overlay.style.display="none";
        location.reload();
      },1500);
    }else{
      modal("err", data.message);
    }

  }catch(err){
    modal("err","Server error");
    console.error(err);
  }
}

async function loadHistory(){
  const token = localStorage.getItem("session_token");

  const res = await fetch(URL,{
    method:"POST",
    body:new URLSearchParams({
      action:"getHistory",
      token: token
    })
  });

  const data = await res.json();

  let html = "";

  if(!data.status || data.data.length === 0){
    html = `
    <tr>
      <td colspan="4" style="text-align:center;color:#94a3b8;">
        Belum ada riwayat
      </td>
    </tr>`;
  }else{
    data.data.forEach(h=>{
      html += `
      <tr>
        <td>${h.waktu || '-'}</td>
        <td>${h.item}</td>
        <td>${h.harga}</td>
        <td class="${h.status === 'sukses' ? 'status-sukses' : 'status-proses'}">
          ${h.status}
        </td>
      </tr>
      `;
    });
  }

  document.getElementById("historyBody").innerHTML = html;
}

async function loadUserPoint(){
  const token = localStorage.getItem("session_token");

  const res = await fetch(URL,{
    method:"POST",
    body:new URLSearchParams({
      action:"getUserProfile",
      token: token
    })
  });

  const data = await res.json();

  if(data.status){
    document.getElementById("userPoint").innerText =
      "💰 " + data.user.point;
  }
}

async function checkStatusAkun(){
  const token = localStorage.getItem("session_token");

  const res = await fetch(URL,{
    method:"POST",
    body:new URLSearchParams({
      action:"getUserProfile",
      token: token
    })
  });

  const data = await res.json();

  if(data.status){
  userStatus = data.user.status; // 🔥 SIMPAN STATUS

  if(userStatus !== "verifikasi"){
    document.getElementById("verifInfo").style.display = "block";
  }
}
}

async function checkLogin(){
  const token = localStorage.getItem("session_token");

  if(!token){
    window.location.href = "login.html";
    return;
  }

  const res = await fetch(URL,{
    method:"POST",
    body:new URLSearchParams({
      action:"checkSession",
      token: token
    })
  });

  const data = await res.json();

  if(!data.status){
    localStorage.removeItem("token");
    window.location.href = "login.html";
  }
}

checkLogin();
loadReward();
loadHistory();
loadUserPoint();
checkStatusAkun();

setInterval(() => {
  loadHistory();
}, 3000); // refresh tiap 5 detik

setInterval(loadUserPoint, 5000);