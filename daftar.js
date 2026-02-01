const API = "https://script.google.com/macros/s/AKfycbxDR0i9x5xF8YDYeWR7YE3lrjtCLocOtP2eGIQXpnQIMMHGgZn0JLJwyQ63ubUjCBPU/exec";

document.addEventListener("DOMContentLoaded", () => {

  const overlay = document.getElementById("overlay");
  const icon = document.getElementById("icon");
  const text = document.getElementById("text");
  const username = document.getElementById("username");
  const email = document.getElementById("email");
  const agree = document.getElementById("agree");
  const pinBox = document.getElementById("pinBox");
  const btnNext = document.getElementById("btnNext");

  if (!overlay || !username) return; // ⬅️ PENYELAMAT

  function modal(type,msg){
    overlay.style.display="flex";
    icon.innerHTML =
      type==="load" ? `<div class="spinner"></div>` :
      type==="ok"   ? `<div class="success">✔</div>` :
                      `<div class="error">✖</div>`;
    text.textContent = msg;
    if(type==="err") setTimeout(()=>overlay.style.display="none",1800);
  }

  window.register = async function(){
    if(!username.value || !email.value || !agree.checked){
      modal("err","Lengkapi data & centang persetujuan");
      return;
    }

    modal("load","Mendaftarkan akun...");

    try{
      const form = new URLSearchParams();
      form.append("action","register");
      form.append("username", username.value);
      form.append("email", email.value);

      const res = await fetch(API,{ method:"POST", body: form });
      const r = await res.json();

      if(r.status){
        localStorage.setItem("session_token", r.token);

        modal("ok","Pendaftaran berhasil");

        pinBox.style.display = "block";
        pinBox.textContent = "PIN LOGIN: " + r.pin;

        text.textContent =
          "Simpan PIN ini. Screenshot atau catat PIN kamu.";

        btnNext.style.display = "block";
      }else{
        modal("err", r.message);
      }

    }catch(err){
      modal("err","Server error / Web App belum aktif");
      console.error(err);
    }
  }

  window.goNext = function(){
    location.href = "index.html";
  }

});