const API_URL = "https://script.google.com/macros/s/AKfycbxDR0i9x5xF8YDYeWR7YE3lrjtCLocOtP2eGIQXpnQIMMHGgZn0JLJwyQ63ubUjCBPU/exec";

const token = localStorage.getItem("session_token");

let activeButton = null;

if(!token){
  location.href = "index.html";
}

// ==========================
// CEK ADMIN
// ==========================

async function checkAdmin(){

  const form = new FormData();

  form.append("action","checkAdmin");
  form.append("token",token);

  const res = await fetch(API_URL,{
    method:"POST",
    body:form
  });

  const data = await res.json();

  if(!data.admin){
    alert("Akses ditolak");
    location.href = "index.html";
  }

}

checkAdmin();

// ==========================
// LOAD DASHBOARD
// ==========================

async function loadDashboard(){

  // render hanya sekali
  if(!document.getElementById("totalUsers")){

    renderPage(
      "dashboardPage",
      "Dashboard",
      "Selamat datang kembali di panel admin RavenStore",

      `
      <div class="stats-grid">

        <div class="stat-card">
          <div class="stat-top">
            <div>
              <h3 id="totalUsers">0</h3>
              <p>Total User</p>
            </div>

            <div class="stat-icon">
              <i class="fa-solid fa-users"></i>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-top">
            <div>
              <h3 id="verifiedUsers">0</h3>
              <p>User Verified</p>
            </div>

            <div class="stat-icon">
              <i class="fa-solid fa-user-check"></i>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-top">
            <div>
              <h3 id="pendingUsers">0</h3>
              <p>Pending</p>
            </div>

            <div class="stat-icon">
              <i class="fa-solid fa-user-clock"></i>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-top">
            <div>
              <h3 id="feedbackCount">0</h3>
              <p>Feedback</p>
            </div>

            <div class="stat-icon">
              <i class="fa-solid fa-envelope"></i>
            </div>
          </div>
        </div>

      </div>

      <div class="panel-card" style="margin-bottom:24px;">

        <div class="card-title">
          <h2>Statistik Website</h2>
        </div>

        <canvas id="statsChart" height="100"></canvas>

      </div>

      <div class="online-box">

  <div class="online-header">

    <h3>User Online</h3>

    <div class="online-count">
      <span id="onlineCount">0</span> Online
    </div>

  </div>

  <div
    id="onlineList"
    class="online-list">
  </div>

</div>

      <div class="panel-card">

        <div class="card-title">
          <h2>Aktivitas User Terbaru</h2>
        </div>

        <table class="table">

          <thead>
            <tr>
              <th>User</th>
              <th>Status</th>
              <th>Poin</th>
              <th>User ID</th>
            </tr>
          </thead>

          <tbody id="activityTable"></tbody>

        </table>

      </div>
      `
    );

  // tunggu render selesai
    setTimeout(()=>{

      loadRealtimeChart();

    },100);

  }

  refreshDashboardStats();

}

let dashboardInterval = null;

document.addEventListener("DOMContentLoaded",()=>{

  checkAdmin();

  showPage("dashboardPage");

  loadDashboard();

});

// ==========================
// MENU SYSTEM
// ==========================

const menuItems = document.querySelectorAll(".menu-item");

menuItems.forEach(item=>{

  item.addEventListener("click",()=>{

    // active menu
    menuItems.forEach(i=>i.classList.remove("active"));
    item.classList.add("active");

    const page = item.dataset.page;

    handlePage(page);

  });

});

// ==========================
// HANDLE PAGE
// ==========================

function handlePage(page){

  switch(page){

    case "dashboard":

      showPage("dashboardPage");

      loadDashboard();

      break;

    case "news":

      showPage("newsPage");

      if(
        !document
        .getElementById("newsPage")
        .innerHTML
      ){

        renderNewsPage();

      }

      break;

    case "notif":

      showPage("notifPage");

      if(
        !document
        .getElementById("notifPage")
        .innerHTML
      ){

        renderNotifPage();

      }

      break;

    case "challenge":

      showPage("challengePage");

      if(
        !document
        .getElementById("challengePage")
        .innerHTML
      ){

        renderChallengePage();

      }

      break;

    case "redeem":

      showPage("redeemPage");

      if(
        !document
        .getElementById("redeemPage")
        .innerHTML
      ){

        renderRedeemPage();

      }

      break;

    case "claim":

      showPage("claimPage");

      if(
        !document
        .getElementById("claimPage")
        .innerHTML
      ){

        renderClaimPage();

      }

      break;

    case "feedback":

      showPage("feedbackPage");

      if(
        !document
        .getElementById("feedbackPage")
        .innerHTML
      ){

        renderFeedbackPage();

      }

      break;

    case "verif":

      showPage("verifPage");

      if(
        !document
        .getElementById("verifPage")
        .innerHTML
      ){

        renderVerifPage();

      }

      break;

    case "maintenance":

      showPage("maintenancePage");

      if(
        !document
        .getElementById("maintenancePage")
        .innerHTML
      ){

        renderMaintenancePage();

      }

      break;

    case "logout":

        const yes = confirm("Yakin ingin keluar?");

        if(yes){

          localStorage.removeItem("session_token");

          location.href = "index.html";

        }

        break;

  }

}

// ==========================
// PAGE RENDER
// ==========================
function showPage(pageId){

  document.querySelectorAll(".page-view")
  .forEach(page=>{

    page.style.display = "none";

  });

  document.getElementById(pageId)
  .style.display = "block";

}

function renderPage(targetId, title, subtitle, content){

  const target =
    document.getElementById(targetId);

  target.innerHTML = `

    <div class="topbar">

      <div class="topbar-left">
        <h1>${title}</h1>
        <p>${subtitle}</p>
      </div>

      <div class="admin-profile">

        <div class="avatar">
          R
        </div>

        <div>
          <b>Founder</b>

          <div style="
            font-size:12px;
            color:#94a3b8;
          ">
            Full Access
          </div>
        </div>

      </div>

    </div>

    ${content}

  `;

}

function renderNewsPage(){

  renderPage(
    "newsPage",
    "Kelola News",
    "Tambah, edit, dan hapus berita website",

    `
    <div class="page-section">

      <div class="panel-card">

        <div class="card-title">
          <h2>Tambah News</h2>
        </div>

        <div class="form-grid">

          <input
            id="newsTitle"
            class="input-admin"
            placeholder="Judul news">

          <textarea
            id="newsContent"
            class="textarea-admin"
            placeholder="Isi berita"></textarea>

          <input
            id="newsThumbnail"
            class="input-admin"
            placeholder="URL Thumbnail">

          <input
            id="newsLink"
            class="input-admin"
            placeholder="Link tujuan (opsional)">

          <button class="btn" onclick="submitNews(event)">
            Publish News
          </button>

        </div>

      </div>

    </div>

    <div class="page-section">

      <div class="panel-card">

        <div class="card-title">
          <h2>Daftar News</h2>
        </div>

        <div style="margin-bottom:16px;">

          <input
            type="text"
            id="searchNews"
            class="input-admin"
            placeholder="Cari news...">

        </div>

        <div class="admin-table-wrap">

          <table class="admin-table">

            <thead>
              <tr>
                <th>Kategori</th>
                <th>Judul</th>
                <th>Isi</th>
                <th>Aktif</th>
                <th>Thumbnail</th>
                <th>Link</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody id="newsTable">

              <tr>
                <td colspan="5">
                  Loading...
                </td>
              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </div>
    `
  );

  loadNewsAdmin();

  setupTableSearch(
  "searchNews",
  "newsTable"
);

}

function renderNotifPage(){

  renderPage(
    "notifPage",
    "Notifikasi",
    "Broadcast notifikasi ke user",

    `
    <div class="panel-card">

      <div class="form-grid">

        <input
          id="notifTitle"
          class="input-admin"
          placeholder="Judul notifikasi">

        <textarea
          id="notifMessage"
          class="textarea-admin"
          placeholder="Isi notifikasi"></textarea>

        <input
          id="notifTarget"
          class="input-admin"
          placeholder="Target User ID (kosong = semua user)">

        <select
          id="notifType"
          class="input-admin">

          <option value="info">
            Info
          </option>

          <option value="warning">
            Warning
          </option>

        </select>

        <select
          id="notifStatus"
          class="input-admin">

          <option value="true">
            Aktif
          </option>

          <option value="false">
            Nonaktif
          </option>

        </select>

        <button
          class="btn"
          onclick="sendNotif()">

          Kirim Notifikasi

        </button>

      </div>

    </div>
    `
  );

}

function renderChallengePage(){

  renderPage(
    "challengePage",
    "Tebak Angka",
    "Kelola event challenge angka",

    `
    <div class="page-section">

      <div class="panel-card">

        <div class="card-title">
          <h2>Buat Event Baru</h2>
        </div>

        <div class="form-grid">

          <input
            id="challengeAnswer"
            class="input-admin"
            placeholder="Angka rahasia">

          <input
            id="challengeDigit"
            class="input-admin"
            placeholder="Hint digit ex: 3 Digit">

          <input
            id="challengeReward"
            type="number"
            class="input-admin"
            placeholder="Reward poin">

          <input
            id="challengeExpired"
            type="datetime-local"
            class="input-admin">

          <button
            class="btn"
            onclick="createChallenge()">

            Buat Event

          </button>

        </div>

      </div>

    </div>

    <div class="page-section">

      <div class="panel-card">

        <div class="card-title">
          <h2>Daftar Event</h2>
        </div>

        <div style="margin-bottom:16px;">

          <input
            type="text"
            id="searchChallenge"
            class="input-admin"
            placeholder="Cari...">

        </div>

        <div class="admin-table-wrap">

          <table class="admin-table">

            <thead>
              <tr>
                <th>Jawaban</th>
                <th>Digit</th>
                <th>Reward</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody id="challengeTable">

              <tr>
                <td colspan="5">
                  Loading...
                </td>
              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </div>

    <div class="panel-card" style="margin-top:20px;">

        <div class="card-title">
          <h2>Winner Tebak Angka</h2>
        </div>

        <div id="winnerList">
          Loading...
        </div>

      </div>
    `
  );

  loadChallengeAdmin();
  loadChallengeWinners();

  setupTableSearch(
  "searchChallenge",
  "challengeTable"
);

}

function renderRedeemPage(){

  renderPage(
    "redeemPage",
    "Redeem Code",
    "Buat kode redeem baru",

    `
    <div class="panel-card">

      <input id="redeemCode"
      placeholder="Kode redeem"
      style="width:100%;padding:14px;border-radius:12px;border:none;margin-bottom:14px;background:#0f172a;color:white;">

      <input id="redeemPoint"
      placeholder="Jumlah poin"
      type="number"
      style="width:100%;padding:14px;border-radius:12px;border:none;margin-bottom:14px;background:#0f172a;color:white;">

      <button class="btn" onclick="createRedeem()">
        Buat Redeem
      </button>

    </div>
    `
  );

}

function renderClaimPage(){

  renderPage(
    "claimPage",
    "Penukaran Poin",
    "Kelola claim reward user",

    `
    <div class="panel-card">

      <div style="margin-bottom:16px;">

        <input
          type="text"
          id="searchClaim"
          class="input-admin"
          placeholder="Cari claim...">

      </div>

      <div class="admin-table-wrap">

        <table class="admin-table">

          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Item</th>
              <th>Poin</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody id="claimTable">

            <tr>
              <td colspan="6">
                Loading...
              </td>
            </tr>

          </tbody>

        </table>

      </div>

    </div>
    `
  );

  loadClaimAdmin();

  setupTableSearch(
  "searchClaim",
  "claimTable"
);

}

function renderFeedbackPage(){

  renderPage(
    "feedbackPage",
    "Feedback User",
    "Daftar feedback terbaru",

    `
    <div class="panel-card">

      <div style="margin-bottom:16px;">

        <input
          type="text"
          id="searchFeedback"
          class="input-admin"
          placeholder="Cari feedback...">

      </div>

      <div class="admin-table-wrap">

        <table class="admin-table">

          <thead>
            <tr>
              <th>Waktu</th>
              <th>User ID</th>
              <th>Username</th>
              <th>Pesan</th>
            </tr>
          </thead>

          <tbody id="feedbackTable">

            <tr>
              <td colspan="4">
                Loading...
              </td>
            </tr>

          </tbody>

        </table>

      </div>

    </div>
    `
  );

  loadFeedbackAdmin();

  setupTableSearch(
  "searchFeedback",
  "feedbackTable"
);

}

let verifUsersData = [];

let verifCurrentPage = 1;

const VERIF_PER_PAGE = 10;

async function renderVerifPage(){

  renderPage(
    "verifPage",
    "Verifikasi User",
    "Kelola verifikasi akun",

    `
    <div class="panel-card">

      <div style="margin-bottom:16px;">

        <input
          type="text"
          id="searchVerifUser"
          class="input-admin"
          placeholder="Cari username / user id...">

      </div>

      <div class="admin-table-wrap">

        <table class="admin-table">

          <thead>
            <tr>
              <th>User ID</th>
              <th>Username</th>
              <th>Poin</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody id="verifTable">

            <tr>
              <td colspan="5">Loading...</td>
            </tr>

          </tbody>

        </table>

      </div>

      <div
        id="verifPagination"
        style="
          display:flex;
          gap:10px;
          justify-content:center;
          margin-top:20px;
        ">
      </div>

    </div>
    `
  );

  loadVerifUsers();

}

function renderMaintenancePage(){

  renderPage(
    "maintenancePage",
    "Maintenance",
    "Kontrol maintenance website",

    `
    <div class="panel-card">

      <div class="form-grid">

        <select
          id="maintenanceMode"
          class="input-admin">

          <option value="ON">
            ON
          </option>

          <option value="OFF">
            OFF
          </option>

        </select>

        <textarea
          id="maintenanceMessage"
          class="textarea-admin"
          placeholder="Pesan maintenance"></textarea>

        <input
          type="datetime-local"
          id="maintenanceEnd"
          class="input-admin">

        <button
          class="btn"
          onclick="toggleMaintenance()">

          Simpan Maintenance

        </button>

      </div>

    </div>
    `
  );

}

async function submitNews(event){

  const btn =
  event.target;

  const title =
    document.getElementById("newsTitle").value.trim();

  const content =
    document.getElementById("newsContent").value.trim();

  const thumbnail =
    document.getElementById("newsThumbnail").value.trim();

  const link =
    document.getElementById("newsLink").value.trim();

  if(!title || !content){
    alert("Lengkapi data");
    return;
  }

  const form = new FormData();

  form.append("action","addNews");
  form.append("token",token);

  form.append("judul", title);
  form.append("isi", content);

  // 🔥 tambahan
  form.append("thumbnail", thumbnail);
  form.append("link", link);

  // optional
  form.append("kategori","Info");

  try{

    const res = await fetch(API_URL,{
      method:"POST",
      body:form
    });

    const data = await res.json();

    if(data.status){

      alert("News berhasil dipublish");

      document.getElementById("newsTitle").value = "";
      document.getElementById("newsContent").value = "";
      document.getElementById("newsThumbnail").value = "";
      document.getElementById("newsLink").value = "";

      loadNewsAdmin();

    }else{

      alert(data.message || "Gagal publish");

    }

  }catch(err){

    console.log(err);

    alert("Network error");

  }

}

async function sendNotif(){

  const title =
    document.getElementById("notifTitle")
    .value.trim();

  const message =
    document.getElementById("notifMessage")
    .value.trim();

  const target =
    document.getElementById("notifTarget")
    .value.trim();

  const type =
    document.getElementById("notifType")
    .value;

  const status =
    document.getElementById("notifStatus")
    .value;

  if(!title || !message){
    alert("Lengkapi data");
    return;
  }

  const result = await api(
    "sendAdminNotif",
    {
      title,
      message,
      target,
      type,
      status
    }
  );

  if(result.status){

    alert("Notifikasi berhasil dikirim");

    document.getElementById("notifTitle").value = "";
    document.getElementById("notifMessage").value = "";
    document.getElementById("notifTarget").value = "";

  }else{

    alert(result.message || "Gagal kirim notif");

  }

}

async function createRedeem(){

  const code =
    document.getElementById("redeemCode")
    .value.trim();

  const point =
    document.getElementById("redeemPoint")
    .value.trim();

  if(!code || !point){
    alert("Lengkapi data");
    return;
  }

  const result = await api(
    "createRedeemCode",
    {
      code:code,
      point:point
    }
  );

  if(result.status){

    alert("Redeem berhasil dibuat");

    document.getElementById("redeemCode").value = "";
    document.getElementById("redeemPoint").value = "";

  }else{

    alert(result.message || "Gagal membuat redeem");

  }

}

async function toggleMaintenance(){

  const mode =
    document.getElementById("maintenanceMode")
    .value;

  const message =
    document.getElementById("maintenanceMessage")
    .value.trim();

  const end_time =
    document.getElementById("maintenanceEnd")
    .value;

  const result = await api(
    "toggleMaintenanceAdmin",
    {
      mode,
      message,
      end_time
    }
  );

  if(result.status){

    alert("Maintenance berhasil diupdate");

  }else{

    alert(result.message || "Gagal update");

  }

}

async function loadNewsAdmin(){

  const result = await api("getAdminNews");

  if(!result.status){
    return;
  }

  renderNewsTable(result.data);

}

function renderNewsTable(news){

  const tbody = document.getElementById("newsTable");

  tbody.innerHTML = "";

  news.forEach(item=>{

    tbody.innerHTML += `

      <tr data-row="${item.row}">

  <td>
    <input
      class="input-admin category-input"
      value="${item.kategori || ''}"
      disabled>
  </td>

  <td>
    <input
      class="input-admin title-input"
      value="${item.judul || ''}"
      disabled>
  </td>

  <td>
    <textarea
      class="textarea-admin content-input"
      disabled>${item.isi || ''}</textarea>
  </td>

  <td>

    <select
      class="input-admin active-input"
      disabled>

      <option value="true"
        ${item.aktif ? "selected" : ""}>
        Aktif
      </option>

      <option value="false"
        ${!item.aktif ? "selected" : ""}>
        Nonaktif
      </option>

    </select>

  </td>

  <td>

  <div style="display:flex;flex-direction:column;gap:10px;">

    <img
      src="${item.thumbnail || ''}"
      class="thumb-preview"
      style="
        width:90px;
        height:60px;
        object-fit:cover;
        border-radius:10px;
        border:1px solid rgba(255,255,255,0.08);
        background:#0f172a;
      ">

    <input
      class="input-admin thumbnail-input"
      value="${item.thumbnail || ''}"
      disabled
      oninput="updateThumbnailPreview(this)">

  </div>

</td>

  <td>
    <input
      class="input-admin link-input"
      value="${item.link || ''}"
      disabled>
  </td>

  <td>

    <button
      class="action-btn edit-btn"
      onclick="editNews(this)">

      Edit

    </button>

    <button
      class="action-btn delete-btn"
      onclick="deleteNews(this)">

      Hapus

    </button>

  </td>

</tr>

    `;

  });

}

function updateThumbnailPreview(input){

  const wrapper =
    input.closest("td");

  const img =
    wrapper.querySelector(".thumb-preview");

  img.src = input.value;

}

async function editNews(btn){

  const row = btn.closest("tr");

  const isSave =
    btn.innerText === "Save";

  const inputs =
    row.querySelectorAll(
      "input, textarea, select"
    );

  // =========================
  // SAVE
  // =========================

  if(isSave){

    const rowNumber =
      row.dataset.row;

    const kategori =
      row.querySelector(".category-input").value;

    const judul =
      row.querySelector(".title-input").value;

    const isi =
      row.querySelector(".content-input").value;

    const aktif =
      row.querySelector(".active-input").value;

    const thumbnail =
      row.querySelector(".thumbnail-input").value;

    const link =
      row.querySelector(".link-input").value;

    const result = await api("updateNews",{
      row: rowNumber,
      kategori,
      judul,
      isi,
      aktif,
      thumbnail,
      link
    });

    if(result.status){

      inputs.forEach(el=>{
        el.disabled = true;
      });

      btn.innerText = "Edit";

      btn.classList.remove("save-btn");
      btn.classList.add("edit-btn");

      alert("News berhasil diupdate");

    }else{

      alert(result.message || "Gagal update");

    }

  }

  // =========================
  // EDIT MODE
  // =========================

  else{

    inputs.forEach(el=>{
      el.disabled = false;
    });

    btn.innerText = "Save";

    btn.classList.remove("edit-btn");
    btn.classList.add("save-btn");

  }

}

async function deleteNews(btn){

  const yes = confirm("Hapus news ini?");

  if(!yes) return;

  const row = btn.closest("tr");

  const rowNumber = row.dataset.row;

  if(!rowNumber){
    alert("Row tidak ditemukan");
    return;
  }

  const result = await api("deleteNews",{
    row: rowNumber
  });

  if(result.status){

    row.remove();

    alert("News berhasil dihapus");

  }else{

    alert(result.message || "Gagal menghapus");

  }

}

// ==========================
// API HELPER
// ==========================

async function api(action, data = {}){

  const form = new FormData();

  form.append("action", action);
  form.append("token", token);

  // append data
  for(const key in data){
    form.append(key, data[key]);
  }

  // =========================
  // AUTO DETECT BUTTON
  // =========================

  const btn =
    document.activeElement;

  const isButton =
    btn &&
    (
      btn.tagName === "BUTTON" ||
      btn.classList.contains("btn") ||
      btn.classList.contains("action-btn")
    );

  if(isButton){

    activeButton = btn;

    setButtonLoading(btn,true);

  }

  try{

    const res = await fetch(API_URL,{
      method:"POST",
      body:form
    });

    const result = await res.json();

    // stop loading
    if(activeButton){

      setButtonLoading(activeButton,false);

      activeButton = null;

    }

    return result;

  }catch(err){

    console.log(err);

    if(activeButton){

      setButtonLoading(activeButton,false);

      activeButton = null;

    }

    return {
      status:false,
      message:"Network Error"
    };

  }

}

async function loadVerifUsers(){

  const result = await api("getUsersAdmin");

  if(!result.status){
    alert("Gagal load user");
    return;
  }

  verifUsersData = result.data;

  verifCurrentPage = 1;

renderVerifTable();

}

async function changeVerify(row,status){

  const yes = confirm(
    status === "verifikasi"
    ? "Verifikasi user ini?"
    : "Cabut verifikasi user?"
  );

  if(!yes) return;

  const result = await api("verifyUser",{
    row:row,
    status:status
  });

  if(result.status){

    alert("Status berhasil diupdate");

    loadVerifUsers();

  }else{

    alert(result.message || "Gagal update");

  }

}

async function loadFeedbackAdmin(){

  const result =
    await api("getFeedbackAdmin");

  if(!result.status){

    alert("Gagal load feedback");

    return;
  }

  const tbody =
    document.getElementById("feedbackTable");

  tbody.innerHTML = "";

  result.data.forEach(item=>{

    const date =
      new Date(item.waktu);

    const waktu =
      date.toLocaleString("id-ID");

    tbody.innerHTML += `

      <tr>

        <td>${waktu}</td>

        <td>${item.user_id}</td>

        <td>${item.username}</td>

        <td>${item.pesan}</td>

      </tr>

    `;

  });

}

async function loadClaimAdmin(){

  const result =
    await api("getPenukaranAdmin");

  if(!result.status){
    return;
  }

  const tbody =
    document.getElementById("claimTable");

  tbody.innerHTML = "";

  result.data.forEach(item=>{

    tbody.innerHTML += `

      <tr>

        <td>${item.username}</td>

        <td>${item.email}</td>

        <td>${item.item}</td>

        <td>${item.harga}</td>

        <td>${item.status}</td>

        <td>

          <button
            class="action-btn save-btn"
            onclick="updateClaimStatus(
              '${item.row}',
              'sukses'
            )">

            Selesai

          </button>

        </td>

      </tr>

    `;

  });

}

async function updateClaimStatus(row,status){

  const result = await api(
    "updatePenukaran",
    {
      row,
      status
    }
  );

  if(result.status){

    alert("Status berhasil diupdate");

    loadClaimAdmin();

  }

}

async function createChallenge(){

  const answer =
    document.getElementById("challengeAnswer").value;

  const digit =
    document.getElementById("challengeDigit").value;

  const reward =
    document.getElementById("challengeReward").value;

  const expired =
    document.getElementById("challengeExpired").value;

  const result = await api(
    "createChallenge",
    {
      answer,
      digit,
      reward,
      expired
    }
  );

  if(result.status){

    alert("Challenge berhasil dibuat");

    loadChallengeAdmin();

  }

}

async function loadChallengeAdmin(){

  const result =
    await api("getChallengeAdmin");

  if(!result.status){
    return;
  }

  const tbody =
    document.getElementById("challengeTable");

  tbody.innerHTML = "";

  result.data.forEach(item=>{

    tbody.innerHTML += `

      <tr>

        <td>${item.answer}</td>

        <td>${item.digit}</td>

        <td>${item.reward}</td>

        <td>
          ${
            item.active
            ? "Aktif"
            : "Nonaktif"
          }
        </td>

        <td>

          <button
            class="action-btn ${
              item.active
              ? "delete-btn"
              : "save-btn"
            }"

            onclick="toggleChallengeStatus(
              '${item.row}',
              '${!item.active}'
            )">

            ${
              item.active
              ? "Matikan"
              : "Aktifkan"
            }

          </button>

        </td>

      </tr>

    `;

  });

}

async function toggleChallengeStatus(row,status){

  const result = await api(
    "toggleChallenge",
    {
      row,
      status
    }
  );

  if(result.status){

    loadChallengeAdmin();

  }

}

async function loadChallengeWinners(){

  const result =
    await api("getChallengeWinners");

  const wrap =
    document.getElementById("winnerList");

  if(!result.status){

    wrap.innerHTML =
      "Gagal load winner";

    return;
  }

  if(result.data.length <= 0){

    wrap.innerHTML =
      "Belum ada pemenang";

    return;
  }

  let html = `

    <table class="admin-table">

      <thead>
        <tr>
          <th>Username</th>
          <th>Event</th>
          <th>Reward</th>
          <th>Waktu</th>
        </tr>
      </thead>

      <tbody>

  `;

  result.data.forEach(item=>{

    html += `
      <tr>

        <td>${item.username}</td>

        <td>${item.event_id}</td>

        <td>${item.reward} poin</td>

        <td>
          ${
            new Date(item.time)
            .toLocaleString("id-ID")
          }
        </td>

      </tr>
    `;

  });

  html += `
      </tbody>
    </table>
  `;

  wrap.innerHTML = html;

}

function setButtonLoading(btn, loading=true){

  if(loading){

    btn.classList.add("loading");

    btn.dataset.originalText =
      btn.innerHTML;

    btn.innerHTML =
  '<i class="fa-solid fa-spinner fa-spin"></i> Loading';

    btn.disabled = true;

  }else{

    btn.classList.remove("loading");

    btn.innerHTML =
      btn.dataset.originalText || "Submit";

    btn.disabled = false;

  }

}

// ==========================
// MOBILE SIDEBAR
// ==========================

function toggleSidebar(){

  document
    .querySelector(".sidebar")
    .classList.toggle("show");

  document
    .querySelector(".sidebar-overlay")
    .classList.toggle("show");

}

function closeSidebar(){

  document
    .querySelector(".sidebar")
    .classList.remove("show");

  document
    .querySelector(".sidebar-overlay")
    .classList.remove("show");

}

// auto close ketika klik menu di mobile

menuItems.forEach(item=>{

  item.addEventListener("click",()=>{

    if(window.innerWidth <= 780){

      closeSidebar();

    }

  });

});

function setupVerifSearch(){

  const input =
    document.getElementById("searchVerifUser");

  if(!input) return;

  input.addEventListener("input",()=>{

    const keyword =
      input.value.toLowerCase();

    const rows =
      document.querySelectorAll(
        "#verifTable tr"
      );

    rows.forEach(row=>{

      const text =
        row.innerText.toLowerCase();

      row.style.display =
        text.includes(keyword)
        ? ""
        : "none";

    });

  });

}

function renderVerifTable(){

  const tbody =
    document.getElementById("verifTable");

  tbody.innerHTML = "";

  const start =
    (verifCurrentPage - 1)
    * VERIF_PER_PAGE;

  const end =
    start + VERIF_PER_PAGE;

  const pageData =
    verifUsersData.slice(start,end);

  pageData.forEach(user=>{

    tbody.innerHTML += `
      <tr data-row="${user.row}">

        <td>${user.user_id}</td>

        <td>${user.username}</td>

        <td>${user.point}</td>

        <td>

          <span class="status ${
            user.status === "verifikasi"
            ? "online"
            : "pending"
          }">

            ${
              user.status === "verifikasi"
              ? "Verified"
              : "Pending"
            }

          </span>

        </td>

        <td>

          ${
            user.status === "verifikasi"

            ?

            `
            <button
              class="action-btn delete-btn"
              onclick="changeVerify('${user.row}','belum')">

              Cabut
            </button>
            `

            :

            `
            <button
              class="action-btn save-btn"
              onclick="changeVerify('${user.row}','verifikasi')">

              Verify
            </button>
            `
          }

        </td>

      </tr>
    `;

  });

  renderVerifPagination();

  setupVerifSearch();

}

function renderVerifPagination(){

  const wrap =
    document.getElementById(
      "verifPagination"
    );

  if(!wrap) return;

  wrap.innerHTML = "";

  const totalPages =
    Math.ceil(
      verifUsersData.length
      / VERIF_PER_PAGE
    );

  for(let i=1;i<=totalPages;i++){

    wrap.innerHTML += `
      <button
        class="action-btn ${
          i === verifCurrentPage
          ? "save-btn"
          : "edit-btn"
        }"

        onclick="goToVerifPage(${i})">

        ${i}

      </button>
    `;

  }

}

function goToVerifPage(page){

  verifCurrentPage = page;

  renderVerifTable();

}

async function refreshDashboardStats(){

  const form = new FormData();

  form.append("action","getDashboardData");
  form.append("token",token);

  try{

    const res = await fetch(API_URL,{
      method:"POST",
      body:form
    });

    const data = await res.json();

    if(!data.status) return;
  
    // =========================
    // UPDATE STATS
    // =========================

    animateValue("totalUsers", data.stats.totalUsers || 0);

    animateValue("verifiedUsers", data.stats.verifiedUsers || 0);

    animateValue("pendingUsers", data.stats.pendingClaim || 0);

    animateValue("feedbackCount", data.stats.totalFeedback || 0);

    // =========================
    // UPDATE TABLE
    // =========================

    const tbody =
      document.getElementById("activityTable");

    if(!tbody) return;

    tbody.innerHTML = "";

    data.latestUsers.forEach(user=>{

      tbody.innerHTML += `
        <tr>

          <td>${user.username}</td>

          <td>
            <span class="status ${
              user.status === "verifikasi"
              ? "online"
              : "pending"
            }">

              ${
                user.status === "verifikasi"
                ? "Verified"
                : "Pending"
              }

            </span>
          </td>

          <td>${user.point}</td>

          <td>${user.user_id}</td>

        </tr>
      `;

    });

  }catch(err){

    console.log(err);

  }

}

function animateValue(id, newValue){

  const el = document.getElementById(id);

  if(!el) return;

  const oldValue =
    parseInt(el.innerText) || 0;

  if(oldValue === newValue) return;

  const duration = 500;

  const startTime = performance.now();

  function update(currentTime){

    const progress =
      Math.min(
        (currentTime - startTime) / duration,
        1
      );

    const value =
      Math.floor(
        oldValue +
        (newValue - oldValue) * progress
      );

    el.innerText = value;

    if(progress < 1){

      requestAnimationFrame(update);

    }

  }

  requestAnimationFrame(update);

}

function startDashboardRealtime(){

  dashboardInterval = setInterval(()=>{

    // pastikan masih di dashboard
    const title =
      document.querySelector(".topbar h1");

    if(title && title.innerText === "Dashboard"){

      refreshDashboardStats();

    }

  },3000);

}

setInterval(()=>{

  // dashboard
  refreshDashboardStats();

  // feedback
  if(document.getElementById("feedbackTable")){
    loadFeedbackAdmin();
  }

  // claim
  if(document.getElementById("claimTable")){
    loadClaimAdmin();
  }

  // challenge
  if(document.getElementById("challengeTable")){
    loadChallengeAdmin();
  }

  // news
  if(document.getElementById("newsTable")){
    loadNewsAdmin();
  }

},5000);

let statsChart = null;

function renderStatsChart(labels, values){

  const ctx =
    document
    .getElementById("statsChart");

  if(!ctx) return;

  // destroy chart lama
  if(statsChart){
    statsChart.destroy();
  }

  statsChart = new Chart(ctx,{

    type:"line",

    data:{
      labels:labels,

      datasets:[{
        label:"User Baru",

        data:values,

        borderColor:"#facc15",

        backgroundColor:"rgba(250,204,21,0.15)",

        tension:0.4,

        fill:true,

        pointRadius:4,

        pointBackgroundColor:"#facc15"
      }]
    },

    options:{

      responsive:true,

      plugins:{
        legend:{
          labels:{
            color:"white"
          }
        }
      },

      scales:{

        x:{
          ticks:{
            color:"#94a3b8"
          },

          grid:{
            color:"rgba(255,255,255,0.05)"
          }
        },

        y:{
          ticks:{
            color:"#94a3b8"
          },

          grid:{
            color:"rgba(255,255,255,0.05)"
          }
        }

      }

    }

  });

}

async function loadRealtimeChart(){

  const result =
    await api("getChartStats");

  if(!result.status) return;

  renderStatsChart(
    result.labels,
    result.values
  );

}

async function loadOnlineUsers(){

  const res = await fetch(API_URL,{
    method:"POST",
    body:new URLSearchParams({
      action:"getOnlineUsers",
      token:token
    })
  });

  const data = await res.json();

  if(!data.status) return;

  document.getElementById("onlineCount")
    .innerText = data.total;

  let html = "";

data.data.forEach(user=>{

  html += `

    <div class="online-user">

      <div class="online-dot"></div>

      <div class="avatar-mini">
        ${user.username.charAt(0).toUpperCase()}
      </div>

      <div class="online-user-info">

        <b>${user.username}</b>

        <span>
          ID: ${user.user_id || "-"}
        </span>

      </div>

    </div>

  `;

});

document.getElementById("onlineList")
.innerHTML = html;

}

loadOnlineUsers();

setInterval(()=>{
  loadOnlineUsers();
},10000);

setInterval(()=>{

  fetch(API_URL,{
    method:"POST",
    body:new URLSearchParams({
      action:"pingOnline",
      token:token
    })
  });

},15000);

window.addEventListener("beforeunload", () => {

  navigator.sendBeacon(API_URL,
    new URLSearchParams({
      action: "offlineUser",
      token: localStorage.getItem("session_token")
    })
  );

});

function setupTableSearch(inputId, tableId){

  const input =
    document.getElementById(inputId);

  const table =
    document.getElementById(tableId);

  if(!input || !table) return;

  input.addEventListener("input",()=>{

    const keyword =
      input.value.toLowerCase();

    const rows =
      table.querySelectorAll("tr");

    rows.forEach(row=>{

      const text =
        row.innerText.toLowerCase();

      row.style.display =
        text.includes(keyword)
        ? ""
        : "none";

    });

  });

}