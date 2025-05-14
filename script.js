// 1) IMPORT & INITIALIZE FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  remove
} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCoNi5BAQbqV63OsLvZudBmVKqK1UaGD48",
  authDomain: "wheel-64111.firebaseapp.com",
  projectId: "wheel-64111",
  storageBucket: "wheel-64111.firebasestorage.app",
  messagingSenderId: "768654812880",
  appId: "1:768654812880:web:c85461e84ac5460beda0d5",
  measurementId: "G-GHW299F643"
};

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);
const spinsRef = ref(db, 'spins/');


// 2) ALL YOUR WHEEL LOGIC INSIDE DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("wheel");
  const ctx    = canvas.getContext("2d");
  const segments = ["Group A", "Group B", "Group C", "Group D"];
  const colors   = ["#ff6b6b", "#6bc5ff", "#51d88a", "#f7d154"];
  const sound    = new Audio("ding.mp3");
  let spinning   = false;

  // DRAW THE WHEEL
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

      ctx.save();
      ctx.translate(radius, radius);
      ctx.rotate(start + arc / 2);
      ctx.textAlign = "right";
      ctx.fillStyle  = "#fff";
      ctx.font       = "bold 18px sans-serif";
      ctx.fillText(seg, radius - 10, 10);
      ctx.restore();
    });
  }

  // SPIN HANDLER
  function spinWheel() {
    if (spinning) return;
    const name = document.getElementById("username").value.trim().toLowerCase();
    if (!name) {
      alert("Please enter your name.");
      return;
    }

    spinning = true;
    const spins      = Math.floor(Math.random() * 4 + 4);
    const randIndex  = Math.floor(Math.random() * segments.length);
    const segmentDeg = 360 / segments.length;
    const targetDeg  = 360 * spins + randIndex * segmentDeg + segmentDeg / 2;

    canvas.style.transition = "transform 9s cubic-bezier(0.33,1,0.68,1)";
    canvas.style.transform  = `rotate(${targetDeg}deg)`;

    setTimeout(() => {
      const group = segments[randIndex];
      const resultEl = document.getElementById("result");
      resultEl.innerText  = `${capitalize(name)}, you’re in ${group}!`;
      resultEl.style.color = getGroupColor(group);
      sound.play();
      // SAVE TO FIREBASE
      push(spinsRef, { name, group, timestamp: Date.now() });
      spinning = false;
    }, 9000);
  }

  // REAL-TIME LISTENER
  onValue(spinsRef, snapshot => {
    const data = snapshot.val() || {};
    const entries = Object.values(data);
    const spinList = document.getElementById("spinList");
    const userList = document.getElementById("userList");
    const groupStats = document.getElementById("groupStats");
    const groupCountsEl = document.getElementById("groupCounts");

    spinList.innerHTML      = "";
    userList.innerHTML      = "";
    groupStats.innerHTML    = "";
    groupCountsEl.innerHTML = "";

    // tally counts
    const counts = { "Group A":0, "Group B":0, "Group C":0, "Group D":0 };

    // sort by name
    entries.sort((a,b) => a.name.localeCompare(b.name));

    entries.forEach(({name, group}) => {
      counts[group]++;

      // spin log
      const logLi = document.createElement("li");
      logLi.textContent = `${capitalize(name)} → ${group}`;
      spinList.appendChild(logLi);

      // user list
      const uLi = document.createElement("li");
      uLi.innerHTML = `
        <span>${capitalize(name)}</span>
        <span class="group-label group-${group.split(" ")[1]}">${group}</span>
      `;
      userList.appendChild(uLi);
    });

    // group stats & totals
    Object.entries(counts).forEach(([grp, cnt]) => {
      groupStats.innerHTML += `<div>${grp}: ${cnt} member${cnt!==1?"s":""}</div>`;
      const div = document.createElement("div");
      div.innerHTML = `<span style="color:${getGroupColor(grp)};font-weight:bold">
                        ${grp}
                      </span>: ${cnt}`;
      groupCountsEl.appendChild(div);
    });
  });

  // RESET
  function resetSpins() {
    if (!confirm("Clear all spins?")) return;
    remove(spinsRef);
    document.getElementById("result").innerText = "";
  }

  // HELPERS
  function getGroupColor(g) {
    return {"Group A":"#ff6b6b","Group B":"#6bc5ff","Group C":"#51d88a","Group D":"#f7d154"}[g];
  }
  function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // expose for inline handlers
  window.spinWheel  = spinWheel;
  window.resetSpins = resetSpins;

  // initial draw
  drawWheel();
});
