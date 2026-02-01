const API = "https://script.google.com/macros/s/AKfycbxDR0i9x5xF8YDYeWR7YE3lrjtCLocOtP2eGIQXpnQIMMHGgZn0JLJwyQ63ubUjCBPU/exec";

document.addEventListener("DOMContentLoaded", () => {

  const inputs = document.querySelectorAll(".pin-input");
  const overlay = document.getElementById("overlay");
  const icon = document.getElementById("icon");
  const text = document.getElementById("text");

  if (!inputs.length || !overlay) return; // ⬅️ PENYELAMAT

  // auto move cursor
  inputs.forEach((el, idx)=>{
    el.addEventListener("input",()=>{
      if(el.value && inputs[idx+1]) inputs[idx+1].focus();
    });
    el.addEventListener("keydown",e=>{
      if(e.key==="Backspace" && !el.value && inputs[idx-1]){
        inputs[idx-1].focus();
      }
    });
  });

  function modal(type,msg){
    overlay.style.display="flex";
    icon.innerHTML =
      type==="load" ? `<div class="spinner"></div>` :
      type==="ok"   ? `<div class="success">✔</div>` :
                      `<div class="error">✖</div>`;
    text.textContent = msg;
    if(type==="err") setTimeout(()=>overlay.style.display="none",1800);
  }

  window.login = async function(){
    let pin = "";
    inputs.forEach(i=>pin+=i.value);

    if(pin.length!==6){
      modal("err","PIN harus 6 digit");
      return;
    }

    modal("load","Memverifikasi PIN...");

    try{
      const form = new URLSearchParams();
      form.append("action","login");
      form.append("pin",pin);

      const res = await fetch(API,{ method:"POST", body:form });
      const r = await res.json();

      if(r.status){
        localStorage.setItem("session_token", r.token);
        modal("ok","Login berhasil");
        setTimeout(()=>location.href="index.html",1200);
      }else{
        modal("err", r.message);
      }

    }catch(err){
      modal("err","Server error");
      console.error(err);
    }
  };

});