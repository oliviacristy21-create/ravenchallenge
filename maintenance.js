const API = "https://script.google.com/macros/s/AKfycbxDR0i9x5xF8YDYeWR7YE3lrjtCLocOtP2eGIQXpnQIMMHGgZn0JLJwyQ63ubUjCBPU/exec"; // 🔥 ganti

let countdownInterval = null;

// FORMAT TIME
function formatTime(ms){
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return String(m).padStart(2,'0') + ":" + String(s).padStart(2,'0');
}

// START COUNTDOWN
function startCountdown(endTime){

  const end = new Date(endTime).getTime();

  countdownInterval = setInterval(()=>{

    const now = Date.now();
    const diff = end - now;

    if(diff <= 0){
      clearInterval(countdownInterval);

      document.getElementById("hour").innerText = "00";
      document.getElementById("minute").innerText = "00";
      document.getElementById("second").innerText = "00";

      return;
    }

    const totalSec = Math.floor(diff / 1000);

    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;

    document.getElementById("hour").innerText =
      String(h).padStart(2,'0');

    document.getElementById("minute").innerText =
      String(m).padStart(2,'0');

    document.getElementById("second").innerText =
      String(s).padStart(2,'0');

  },1000);
}

// FETCH DATA
async function loadMaintenance(){

  try{
    const f = new URLSearchParams();
    f.append("action","getMaintenance");

    const res = await fetch(API,{
      method:"POST",
      body:f
    });

    const r = await res.json();

    // kalau maintenance OFF → balik ke index
    if(r.status && !r.maintenance){
      window.location.href = "index.html";
      return;
    }

    if(r.status && r.maintenance){

      document.getElementById("message").innerText =
        r.message || "Sistem sedang dalam perbaikan";

      // TIMER dari spreadsheet (dalam menit)
      startCountdown(r.end_time);
    }

  }catch(err){
    console.error(err);
  }
}

// AUTO CEK (biar balik otomatis kalau OFF)
setInterval(loadMaintenance, 10000);

// INIT
loadMaintenance();