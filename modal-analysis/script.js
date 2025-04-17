const canvas = document.getElementById('simCanvas');
const ctx = canvas.getContext('2d');

let requestId;
let time = 0;

function getInputs() {
  const m = [
    parseFloat(document.getElementById('mass1').value),
    parseFloat(document.getElementById('mass2').value),
    parseFloat(document.getElementById('mass3').value)
  ];
  const k = [
    parseFloat(document.getElementById('stiff1').value),
    parseFloat(document.getElementById('stiff2').value),
    parseFloat(document.getElementById('stiff3').value)
  ];
  const damping = parseFloat(document.getElementById('damping').value);
  const scale = parseFloat(document.getElementById('scale').value);
  const mode = parseInt(document.querySelector('input[name="mode"]:checked').value);
  return { m, k, damping, scale, mode };
}

function calculateModeShapes(m, k) {
  // Simplified symmetric stiffness matrix for equal mass/stiffness
  // Only for visualization purpose
  const modes = [
    [1, 1, 1],
    [1, 0, -1],
    [1, -2, 1]
  ];
  const frequencies = [1.0, 2.0, 3.0]; // Hz (dummy values for now)

  return { modes, frequencies };
}

function drawBuilding(displacements) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const baseX = 200;
  const baseY = 350;
  const storyHeight = 80;

  let xPrev = baseX;
  let yPrev = baseY;

  for (let i = 0; i < 3; i++) {
    const xCurr = baseX + displacements[i];
    const yCurr = baseY - storyHeight * (i + 1);

    // Draw beam segment
    ctx.beginPath();
    ctx.moveTo(xPrev, yPrev);
    ctx.lineTo(xCurr, yCurr);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw mass as circle
    ctx.beginPath();
    ctx.arc(xCurr, yCurr, 10, 0, 2 * Math.PI);
    ctx.fillStyle = "#007BFF";
    ctx.fill();

    xPrev = xCurr;
    yPrev = yCurr;
  }
}

function animate() {
  const { m, k, damping, scale, mode } = getInputs();
  const { modes, frequencies } = calculateModeShapes(m, k);
  const shape = modes[mode - 1];
  const freq = frequencies[mode - 1];

  document.getElementById('frequency').textContent = freq.toFixed(2);

  const omega = 2 * Math.PI * freq;
  const amplitude = scale * 40; // pixels

  const displacements = shape.map(val => amplitude * val * Math.sin(omega * time) * Math.exp(-damping * time));

  drawBuilding(displacements);
  time += 0.016;
  requestId = requestAnimationFrame(animate);
}

function startAnimation() {
  time = 0;
  if (!requestId) animate();
}

function stopAnimation() {
  cancelAnimationFrame(requestId);
  requestId = null;
}
