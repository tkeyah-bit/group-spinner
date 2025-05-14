const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const segments = ["Group A", "Group B", "Group C", "Group D"];
const colors = ["#ff6b6b", "#6bc5ff", "#51d88a", "#f7d154"];
let angle = 0;
let spinning = false;

function drawWheel(){
 const radius = canvas.width / 2;
 const arc = (2 * Math.PI) / segments.length;

 for(let i = 0; i < segments.length; i++) {
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
 const name = document.getElementById("username").value.trim();

 if (!name){
  alert("please enter you name.");
  return;
 }

 if (localStorage.getItem(`spun-${name.toLowerCase()}`)){
  alert("You've already spun the wheel!");
  return;
 }
 
 spinning = true;

 const spins = Math.floor(Math.random() * 4 + 4); // 4 to 8 spins
 const randSegment = Math.floor(Math.random() * segments.length);
 const segmentAngle = 360 / segments.length;
 const targetAngle = 360 * spins + randSegment * segmentAngle + segmentAngle / 2;

 canvas.style.transition = "transform 5s cubic-bezier(0.33, 1, 0.68, 1)";
 canvas.style.transform = `rotate(${targetAngle}deg)`;

 setTimeout(() => {
  const group = segments[randSegment];
  document.getElementById("result").innerText = `${name}, you're in ${group}!`;
  localStorage.setItem(`spun-${name.toLowerCase()}`, group);
  spinning = false;
 }, 5000);
}
drawWheel();