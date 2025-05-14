// script.js
// ──────────────────────────────────────────────────────────────────────────────
// 1) IMPORT FIREBASE
import { initializeApp }  from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  remove
} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-database.js";

// 2) FIREBASE CONFIG (with databaseURL!)
const firebaseConfig = {
 apiKey: "AIzaSyCoNi5BAQbqV63OsLvZudBmVKqK1UaGD48",
 authDomain: "wheel-64111.firebaseapp.com",
 databaseURL: "https://wheel-64111-default-rtdb.firebaseio.com/",
 projectId: "wheel-64111",
 storageBucket: "wheel-64111.firebasestorage.app",
 messagingSenderId: "768654812880",
 appId: "1:768654812880:web:c85461e84ac5460beda0d5",
 measurementId: "G-GHW299F643"
};

// 3) INITIALIZE FIREBASE & DATABASE REFERENCE
const app      = initializeApp(firebaseConfig);
const db       = getDatabase(app);
const spinsRef = ref(db, 'spins/');


// 4) APP LOGIC
document.addEventListener("DOMContentLoaded", () => {
  // --- Canvas & UI setup ---
  const canvas   = document.getElementById("wheel");
  const ctx      = canvas.getContext("2d");
  const segments = ["Group A", "Group B", "Group C", "Group D"];
  const colors   = ["#ff6b6b", "#6bc5ff", "#51d88a", "#f7d154"];
  const sound    = new Audio("ding.mp3");
  let spinning   = false;
  let accumulatedDeg = 0;

  // Draw the wheel sectors
  function drawWheel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const radius = canvas.width / 2;
    const arc    = (2 * Math.PI) / segments.length;
    segments.forEach((seg, i) => {
      const start = arc * i;
      const end   = start + arc;
      ctx.beginPath();
      ctx.moveTo(radius, radius);
      ctx.arc(radius, radius, radius, start, end);
      ctx.fillStyle = colors[i];
      ctx.fill();
      // Label
      ctx.save();
      ctx.translate(radius, radius);
      ctx.rotate(start + arc/2);
      ctx.textAlign = "right";
      ctx.fillStyle  = "#fff";
      ctx.font       = "bold 18px sans-serif";
      ctx.fillText(seg, radius - 10, 10);
      ctx.restore();
    });
  }

  // Handle a spin
  function spinWheel() {
   if (spinning) return;
   const name = document.getElementById("username").value.trim().toLowerCase();
   if (!name) {
     alert("Please enter your name.");
     return;
   }
   spinning = true;
   const spins     = Math.floor(Math.random() * 4 + 4);  // 4–8 rotations
   const idx       = Math.floor(Math.random() * segments.length);
   const segDeg    = 360 / segments.length;
   const targetDeg = 360 * spins + idx * segDeg + segDeg/2;
   canvas.style.transition = "transform 9s cubic-bezier(0.33,1,0.68,1)";
   canvas.style.transform  = `rotate(${targetDeg}deg)`;
   setTimeout(() => {
     const group = segments[idx];
     const resEl = document.getElementById("result");
     resEl.innerText  = `${capitalize(name)}, you’re in ${group}!`;
     resEl.style.color = getGroupColor(group);
     sound.play();
     // Save to Firebase
     push(spinsRef, { name, group, timestamp: Date.now() });
     spinning = false;
   }, 9000);
 }

  // Listen for changes & rebuild lists
  onValue(spinsRef, snapshot => {
    const data = snapshot.val() || {};
    const entries = Object.values(data).sort((a,b) => a.name.localeCompare(b.name));

    // Elements
    const spinList     = document.getElementById("spinList");
    const userList     = document.getElementById("userList");
    const groupStats   = document.getElementById("groupStats");
    const groupCountsE = document.getElementById("groupCounts");
    spinList.innerHTML      = "";
    userList.innerHTML      = "";
    groupStats.innerHTML    = "";
    groupCountsE.innerHTML  = "";

    // Tally counts
    const counts = { "Group A":0, "Group B":0, "Group C":0, "Group D":0 };
    entries.forEach(({name, group}) => {
      counts[group]++;
      // Spin log
      const logLi = document.createElement("li");
      logLi.textContent = `${capitalize(name)} → ${group}`;
      spinList.appendChild(logLi);
      // User list
      const uLi = document.createElement("li");
      uLi.innerHTML = `
        <span>${capitalize(name)}</span>
        <span class="group-label group-${group.split(" ")[1]}">${group}</span>
      `;
      userList.appendChild(uLi);
    });

    // Render stats & totals
    Object.entries(counts).forEach(([grp, cnt]) => {
      groupStats.innerHTML += `<div>${grp}: ${cnt} member${cnt!==1?"s":""}</div>`;
      const div = document.createElement("div");
      div.innerHTML = `<span style="color:${getGroupColor(grp)};font-weight:bold">
                         ${grp}
                       </span>: ${cnt}`;
      groupCountsE.appendChild(div);
    });
  });

  // Clear all spins
  function resetSpins() {
    if (!confirm("Clear all spins?")) return;
    remove(spinsRef);
    document.getElementById("result").innerText = "";
  }

  // Helpers
  function getGroupColor(g) {
    return { "Group A":"#ff6b6b","Group B":"#6bc5ff","Group C":"#51d88a","Group D":"#f7d154" }[g];
  }
  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  // Expose for your inline handlers
  window.spinWheel  = spinWheel;
  window.resetSpins = resetSpins;

  // Initial draw
  drawWheel();
});
