const API = "https://script.google.com/macros/s/AKfycbwYmXt6bFJoTwy5LdyfypMfI3HcMPeCYDglomcxyCgROMfQvV9AJ5bJGygVKeVkSjULoA/exec";

let lastInfo = "";

// =======================
// LOAD INFO
// =======================
async function loadInfo(){
  try{
    const res = await fetch(API + "?type=info");
    const data = await res.json();

    const newData = JSON.stringify(data);

// kalau tidak ada perubahan → stop
if(newData === lastInfo) return;

// simpan data terbaru
lastInfo = newData;

    document.getElementById("game").innerText = data.game;
    document.getElementById("mode").innerText = data.mode;

    // SLOT
    const slotText = data.totalTeam 
      ? data.totalTeam + "/" + data.slot 
      : data.slot;

    document.getElementById("slot").innerText = slotText;

    document.getElementById("hadiah").innerText = data.hadiah;

    // STATUS
    const statusEl = document.getElementById("statusBadge");

    if(data.status === "open"){
      statusEl.innerText = "🟢 PENDAFTARAN DIBUKA";
      statusEl.className = "status-badge status-open";
    } else {
      statusEl.innerText = "🔴 PENDAFTARAN DITUTUP";
      statusEl.className = "status-badge status-closed";
    }

// =======================
// AUTO LOCK SLOT PENUH
// =======================
const total = parseInt(data.totalTeam || 0);
const max = parseInt(data.slot || 0);

if(total >= max || data.status !== "open"){
  document.getElementById("btnDaftar").disabled = true;
  document.getElementById("btnDaftar").innerText = "PENDAFTARAN DITUTUP";

  document.getElementById("status").innerHTML =
    "<span style='color:red'>❌ Slot sudah penuh</span>";

  // matiin semua input
  document.querySelectorAll("#formCard input").forEach(input => {
    input.disabled = true;
  });
}

  }catch(e){
    console.log("Gagal load info");
  }
}

// =======================
// DAFTAR TIM
// =======================
function daftarTim(){

  const data = {
    namaTim: document.getElementById("namaTim").value,
    kapten: document.getElementById("kapten").value,
    idff: document.getElementById("idff").value,
    wa: document.getElementById("wa").value,
    anggota: document.getElementById("anggota").value
  };

  // VALIDASI
  if(!data.namaTim || !data.kapten || !data.idff || !data.wa){
    document.getElementById("status").innerText = "❌ Lengkapi semua data!";
    return;
  }

  const agree = document.getElementById("agree").checked;
  if(!agree){
    document.getElementById("status").innerText = "❌ Harus setuju dengan syarat & kebijakan!";
    return;
  }

  // SIMPAN DATA SEMENTARA
  window.tempData = data;

  // TAMPILKAN PREVIEW
  document.getElementById("previewModal").style.display = "block";

  document.getElementById("previewData").innerHTML = `
  <div class="preview-item">
    <span>Nama Tim</span>
    <b>${data.namaTim}</b>
  </div>

  <div class="preview-item">
    <span>Kapten</span>
    <b>${data.kapten}</b>
  </div>

  <div class="preview-item">
    <span>ID Game</span>
    <b>${data.idff}</b>
  </div>

  <div class="preview-item">
    <span>WhatsApp</span>
    <b>${data.wa}</b>
  </div>

  <div class="preview-item">
    <span>Anggota</span>
    <b>${data.anggota} Orang</b>
  </div>
`;
}

async function kirimFinal(){

  const data = window.tempData;

  showLoading();
  document.getElementById("btnDaftar").innerText = "Loading...";
  document.getElementById("btnDaftar").disabled = true;

  try {
    const res = await fetch(API, {
      method: "POST",
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if(result.status === "success"){
  hideLoading();

  document.getElementById("status").innerHTML = "";

  showSuccess();

  localStorage.setItem("team_id", result.id);
} else {
      document.getElementById("status").innerText = "❌ " + result.message;

      document.getElementById("btnDaftar").innerText = "Daftar Sekarang";
      document.getElementById("btnDaftar").disabled = false;
    }

  } catch (e) {
    hideLoading();
    document.getElementById("status").innerHTML = "<span style='color:red'>❌ Error</span>";

    document.getElementById("btnDaftar").innerText = "Daftar Sekarang";
    document.getElementById("btnDaftar").disabled = false;
  }
}

function batalPreview(){
  document.getElementById("previewModal").style.display = "none";
}

window.onload = function(){
  loadInfo();

  setInterval(()=>{
    loadInfo();
  }, 10000); // tiap 10 detik
}

window.onclick = function(event) {
  const modal = document.getElementById("previewModal");
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

function showLoading(){
  document.getElementById("loadingOverlay").style.display = "flex";
}

function hideLoading(){
  document.getElementById("loadingOverlay").style.display = "none";
}

function showSuccess(){
  document.getElementById("successOverlay").style.display = "flex";

  setTimeout(()=>{
    window.location.href = "beranda.html";
  }, 2000); // 2 detik sebelum redirect
}