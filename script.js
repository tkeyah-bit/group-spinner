const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const segments = ["Group A", "Group B", "Group C", "Group D"];
const colors = ["#ff6b6b", "#6bc5ff", "#51d88a", "#f7d154"];
const sound = new Audio("ding.mp3");
let angle = 0;
let spinning = false;

function drawWheel() {
  const radius = canvas.width / 2;
  const arc = (2 * Math.PI) / segments.length;

  for (let i = 0; i < segments.length; i++) {
    const startAngle = arc * i;
    const endAngle = startAngle + arc;

    ctx.beginPath();
    ctx.moveTo(radius, radius);
    ctx.arc(radius, radius, radius, startAngle, endAngle);
    ctx.fillStyle = colors[i];
    ctx.fill();

    // text 
    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(startAngle + arc / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#fff";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText(segments[i], radius - 10, 10);
    ctx.restore();
  }
}

function spinWheel() {
  if (spinning) return;
  const name = document.getElementById("username").value.trim().toLowerCase();

  if (!name) {
    alert("Please enter your name.");
    return;
  }

  if (localStorage.getItem(`spun-${name}`)) {
    alert("You've already spun the wheel!");
    return;
  }

  spinning = true;

  const spins = Math.floor(Math.random() * 4 + 4); // 4 to 8 spins
  const randSegment = Math.floor(Math.random() * segments.length);
  const segmentAngle = 360 / segments.length;
  const targetAngle = 360 * spins + randSegment * segmentAngle + segmentAngle / 2;

  canvas.style.transition = "transform 9s cubic-bezier(0.33, 1, 0.68, 1)";
  canvas.style.transform = `rotate(${targetAngle}deg)`;

  setTimeout(() => {
    const group = segments[randSegment];
    const resultEl = document.getElementById("result");
    resultEl.innerText = `${capitalize(name)}, you're in ${group}!`;

    switch (group) {
      case "Group A": resultEl.style.color = "#ff6b6b"; break;
      case "Group B": resultEl.style.color = "#6bc5ff"; break;
      case "Group C": resultEl.style.color = "#51d88a"; break;
      case "Group D": resultEl.style.color = "#f7d154"; break;
      default: resultEl.style.color = "#333";
    }

    localStorage.setItem(`spun-${name}`, group);
    sound.play();
    spinning = false;
    updateUserList();
  }, 9000);
}

function updateUserList() {
  const userList = document.getElementById("userList");
  const groupStats = document.getElementById("groupStats");
  const spinList = document.getElementById("spinList");
  const groupCountsBox = document.getElementById("groupCounts");

  userList.innerHTML = "";
  groupStats.innerHTML = "";
  spinList.innerHTML = "";
  groupCountsBox.innerHTML = "";

  let entries = [];
  let groupCounts = { "Group A": 0, "Group B": 0, "Group C": 0, "Group D": 0 };

  Object.keys(localStorage).forEach(key => {
    if (key.startsWith("spun-")) {
      const name = key.replace("spun-", "");
      const group = localStorage.getItem(key);
      entries.push({ name, group });
      if (groupCounts[group] !== undefined) {
        groupCounts[group]++;
      }
    }
  });

  entries.sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    const groupClass = "group-" + entry.group.split(" ")[1];

    const li = document.createElement("li");
    li.innerHTML = `
      <span>${capitalize(entry.name)}</span>
      <span class="group-label ${groupClass}">${entry.group}</span>
    `;
    userList.appendChild(li);

    const logLi = document.createElement("li");
    logLi.textContent = `${capitalize(entry.name)} → ${entry.group}`;
    spinList.appendChild(logLi);
  }

  for (let group in groupCounts) {
    const count = groupCounts[group];
    groupStats.innerHTML += `<div>${group}: ${count} member${count !== 1 ? "s" : ""}</div>`;
  }

  for (let group in groupCounts) {
    const count = groupCounts[group];
    const color = getGroupColor(group);
    const div = document.createElement("div");
    div.innerHTML = `<span style="color: ${color}; font-weight: bold;">${group}</span>: ${count}`;
    groupCountsBox.appendChild(div);
  }
}

function getGroupColor(group) {
  switch (group) {
    case "Group A": return "#ff6b6b";
    case "Group B": return "#6bc5ff";
    case "Group C": return "#51d88a";
    case "Group D": return "#f7d154";
    default: return "#333";
  }
}

function resetSpins() {
  if (confirm("Are you sure you want to clear all spins?")) {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith("spun-")) {
        localStorage.removeItem(key);
      }
    });
    updateUserList();
    document.getElementById("result").innerText = "";
    alert("Spin records have been cleared.");
  }
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

drawWheel();
updateUserList();
