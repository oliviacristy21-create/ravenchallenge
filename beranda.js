const API = "https://script.google.com/macros/s/AKfycbwYmXt6bFJoTwy5LdyfypMfI3HcMPeCYDglomcxyCgROMfQvV9AJ5bJGygVKeVkSjULoA/exec";

const teamID = localStorage.getItem("team_id");

// LOAD INFO
async function loadInfo(){
  const res = await fetch(API + "?type=info");
  const data = await res.json();

  document.getElementById("game").innerText = data.game;
  document.getElementById("mode").innerText = data.mode;
  document.getElementById("slot").innerText = data.slot;
  document.getElementById("hadiah").innerText = data.hadiah;

  document.getElementById("statusText").innerText =
    data.status === "open" ? "🟢 Turnamen Dibuka" : "🔴 Ditutup";
}

// LOAD TEAM
async function loadTeam(){
  const res = await fetch(API + "?type=team&id=" + teamID);
  const data = await res.json();

  document.getElementById("teamBox").innerHTML = `
    <p>Nama: ${data.namaTim}</p>
    <p>Kapten: ${data.kapten}</p>
    <p>ID: ${data.idff}</p>
  `;
}

// LOGOUT
function logout(){
  localStorage.removeItem("team_id");
  window.location.href = "turney.html";
}

// INIT
window.onload = function(){
  loadInfo();
  loadTeam();
  loadBracket();
  loadSchedule();
  loadTeams();
}

// 🔥 AUTO UPDATE TANPA RELOAD
setInterval(()=>{
  loadInfo();
  loadBracket();
  loadSchedule();
  loadTeams();
}, 10000); // 10 detik

async function loadBracket(){
  const res = await fetch(API + "?type=bracket");
  const data = await res.json();

  const container = document.getElementById("bracketBox");
  container.innerHTML = "";

  const oldLines = container.querySelectorAll('.line, .v-line');
  oldLines.forEach(l => l.remove());

  let rounds = {};

  data.forEach((row,i)=>{
    if(i===0) return;

    const r = row[0];

    if(!rounds[r]) rounds[r] = [];

    rounds[r].push({
  team1: row[2],
  team2: row[3],
  winner: row[4] // ← INI YANG PENTING
});
  });

  const bracket = document.createElement("div");
  bracket.className = "bracket";

  const matchPositions = {};

  Object.keys(rounds).forEach((r, ri)=>{
    const col = document.createElement("div");
    col.className = "round";

    const title = document.createElement("h3");
    title.innerText = "Round " + r;
    title.style.textAlign = "center";
    col.appendChild(title);

    const isFinal = ri === Object.keys(rounds).length - 1;

    rounds[r].forEach((m)=>{
      const box = document.createElement("div");
      box.className = "match";
      if(isFinal){
  box.innerHTML = `
    <div class="trophy">🏆</div>
    <div class="champion">${m.winner || 'Winner'}</div>
  `;
} else {

  const t1Lose = m.winner && m.winner.toLowerCase() !== m.team1.toLowerCase();
  const t2Lose = m.winner && m.winner.toLowerCase() !== m.team2.toLowerCase();

  box.innerHTML = `
  <div class="team ${t1Lose ? 'loser' : ''}">${m.team1}</div>
  <div class="vs">VS</div>
  <div class="team ${t2Lose ? 'loser' : ''}">${m.team2}</div>
`;
}

      col.appendChild(box);

      setTimeout(()=>{
        const parentRect = container.getBoundingClientRect();
        const rect = box.getBoundingClientRect();

        const x = rect.right - parentRect.left;
        const y = rect.top + rect.height/2 - parentRect.top;
        if(!matchPositions[ri]) matchPositions[ri] = [];

matchPositions[ri].push({
  x: x,
  y: y
});
      },100);
    });

    bracket.appendChild(col);
  });

  container.appendChild(bracket);

// GAMBAR GARIS
setTimeout(()=>{
  drawLines(container, bracket);
},200);

}

function drawLines(container, bracket){
  const rounds = bracket.querySelectorAll(".round");

  for(let i=0; i<rounds.length-1; i++){
    const currentMatches = rounds[i].querySelectorAll(".match");
    const nextMatches = rounds[i+1].querySelectorAll(".match");

    currentMatches.forEach((match, index)=>{
      const nextIndex = Math.floor(index/2);
      const nextMatch = nextMatches[nextIndex];

      if(!nextMatch) return;

      const cRect = match.getBoundingClientRect();
      const nRect = nextMatch.getBoundingClientRect();
      const pRect = container.getBoundingClientRect();

      const startX = cRect.right - pRect.left;
      const startY = cRect.top + cRect.height/2 - pRect.top;

      const endX = nRect.left - pRect.left;
      const endY = nRect.top + nRect.height/2 - pRect.top;

      // horizontal line
      const hLine = document.createElement("div");
      hLine.className = "line";
      hLine.style.left = startX + "px";
      hLine.style.top = startY + "px";
      hLine.style.width = (endX - startX) + "px";

      container.appendChild(hLine);

      // vertical line
      const vLine = document.createElement("div");
      vLine.className = "v-line";
      vLine.style.left = endX + "px";
      vLine.style.top = Math.min(startY, endY) + "px";
      vLine.style.height = Math.abs(endY - startY) + "px";

      container.appendChild(vLine);
    });
  }
}

async function loadSchedule(){
  const res = await fetch(API + "?type=matches");
  const data = await res.json();

  let html = "";

  data.forEach((m,i)=>{
    if(i === 0) return;

    const liveLink = m[5]; // kolom Link Live

    html += `
      <div class="schedule-item">
        
        <div>
          <div class="time">${m[3]}</div>
          <div class="teams">${m[1]} vs ${m[2]}</div>
        </div>

        ${
          liveLink
          ? `<a href="${liveLink}" target="_blank" class="live-btn">LIVE</a>`
          : `<span class="not-live">-</span>`
        }

      </div>
    `;
  });

  document.getElementById("scheduleBox").innerHTML = html;
}

async function loadTeams(){
  const res = await fetch(API + "?type=teams");
  const data = await res.json();

  let html = `<div class="team-grid">`;

  data.forEach((t, i)=>{
    html += `
      <div class="team-card">
        <div class="team-name">${t.namaTim}</div>
        <div class="team-captain">Kapten: ${t.kapten}</div>
      </div>
    `;
  });

  html += `</div>`;

  document.getElementById("teamList").innerHTML = html;
}