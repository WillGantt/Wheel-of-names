const MAX_NAMES = 100;
const MONEY_PER_ENTRY = 5;
const SEGMENT_COLORS = [
  '#e74c3c', '#f1c40f', '#2ecc71', '#3498db', '#e74c3c', '#f1c40f',
  '#2ecc71', '#3498db', '#9b59b6', '#1abc9c'
];

const nameInput = document.getElementById('name-input');
const addBtn = document.getElementById('add-btn');
const clearBtn = document.getElementById('clear-btn');
const nameList = document.getElementById('name-list');
const nameCountEl = document.getElementById('name-count');
const wheelEl = document.getElementById('wheel');
const wheelCenter = document.getElementById('wheel-center');
const prizeMoneyEl = document.getElementById('prize-money');
const charityMoneyEl = document.getElementById('charity-money');
const winnerBanner = document.getElementById('winner-banner');
const winnerNameEl = document.getElementById('winner-name');
const spinBtn = document.getElementById('spin-btn');

let names = [];
let isSpinning = false;
let accumulatedRotation = 0;

function updateMoneyDisplays() {
  const total = names.length * MONEY_PER_ENTRY;
  prizeMoneyEl.textContent = `$${total}`;
  charityMoneyEl.textContent = `$${total}`;
}

function updateNameCount() {
  nameCountEl.textContent = names.length;
  addBtn.disabled = names.length >= MAX_NAMES || !nameInput.value.trim();
  if (names.length >= MAX_NAMES) {
    nameInput.placeholder = 'Max 100 names';
  } else {
    nameInput.placeholder = 'Add a name...';
  }
  updateSpinPrompt();
}

function updateSpinPrompt() {
  if (!wheelCenter) return;
  const text = wheelCenter.querySelector('.wheel-center-text');
  const sub = wheelCenter.querySelector('.wheel-center-sub');
  if (names.length < 1) {
    text.textContent = 'Add names';
    if (sub) sub.textContent = 'then spin';
  } else if (isSpinning) {
    text.textContent = 'Spinning...';
    if (sub) sub.textContent = '';
  } else {
    text.textContent = 'Click to spin';
    if (sub) sub.textContent = 'or press Ctrl+Enter';
  }
  if (spinBtn) spinBtn.disabled = names.length < 1 || isSpinning;
}

function addName() {
  const value = nameInput.value.trim();
  if (!value || names.length >= MAX_NAMES) return;
  names.push(value);
  nameInput.value = '';
  renderNameList();
  updateNameCount();
  updateMoneyDisplays();
  drawWheel();
  hideWinner();
  nameInput.focus();
}

function removeName(index) {
  names.splice(index, 1);
  renderNameList();
  updateNameCount();
  updateMoneyDisplays();
  drawWheel();
  hideWinner();
}

function clearAll() {
  names = [];
  nameInput.value = '';
  nameInput.placeholder = 'Add a name...';
  renderNameList();
  updateNameCount();
  updateMoneyDisplays();
  drawWheel();
  hideWinner();
}

function renderNameList() {
  nameList.innerHTML = '';
  names.forEach((name, i) => {
    const li = document.createElement('li');
    li.className = 'name-list-item';
    const span = document.createElement('span');
    span.textContent = name;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'name-remove';
    btn.innerHTML = '×';
    btn.setAttribute('aria-label', `Remove ${name}`);
    btn.addEventListener('click', () => removeName(i));
    li.appendChild(span);
    li.appendChild(btn);
    nameList.appendChild(li);
  });
}

function drawWheel() {
  accumulatedRotation = 0;
  wheelEl.innerHTML = '';
  wheelEl.classList.remove('spinning');
  wheelEl.style.transform = '';

  const n = names.length;

  if (n === 0) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 200 200');
    svg.setAttribute('class', 'wheel-svg');
    svg.innerHTML = '<circle cx="100" cy="100" r="100" fill="#2a2a35"/>';
    wheelEl.appendChild(svg);
    updateSpinPrompt();
    return;
  }

  const anglePerSegment = 360 / n;
  const cx = 100;
  const cy = 100;
  const r = 100;
  const textRadius = 65;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 200 200');
  svg.setAttribute('class', 'wheel-svg');

  for (let i = 0; i < n; i++) {
    if (n === 1) {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', cx);
      circle.setAttribute('cy', cy);
      circle.setAttribute('r', r);
      circle.setAttribute('fill', SEGMENT_COLORS[0]);
      svg.appendChild(circle);
    } else {
      const a1 = (i * anglePerSegment - 90) * (Math.PI / 180);
      const a2 = ((i + 1) * anglePerSegment - 90) * (Math.PI / 180);
      const x1 = cx + r * Math.cos(a1);
      const y1 = cy + r * Math.sin(a1);
      const x2 = cx + r * Math.cos(a2);
      const y2 = cy + r * Math.sin(a2);
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`);
      path.setAttribute('fill', SEGMENT_COLORS[i % SEGMENT_COLORS.length]);
      svg.appendChild(path);
    }

    const midAngle = (i * anglePerSegment + anglePerSegment / 2 - 90) * (Math.PI / 180);
    const tx = cx + textRadius * Math.cos(midAngle);
    const ty = cy + textRadius * Math.sin(midAngle);
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', tx);
    text.setAttribute('y', ty);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('class', 'wheel-segment-text');
    text.setAttribute('transform', `rotate(${(i * anglePerSegment + anglePerSegment / 2) % 360} ${tx} ${ty})`);
    const name = names[i];
    text.textContent = name.length > 12 ? name.slice(0, 11) + '…' : name;
    svg.appendChild(text);
  }

  wheelEl.appendChild(svg);
  updateSpinPrompt();
}

function hideWinner() {
  winnerBanner.classList.remove('winner-show');
  winnerBanner.classList.add('hidden');
}

function showWinner(name) {
  winnerNameEl.textContent = name;
  winnerBanner.classList.remove('hidden');
  winnerBanner.classList.add('winner-show');
  updateSpinPrompt();

  if (typeof confetti === 'function') {
    const count = 200;
    const defaults = { origin: { y: 0.6 }, zIndex: 9999 };
    confetti({ ...defaults, particleCount: count, spread: 70 });
    confetti({ ...defaults, particleCount: count * 0.6, angle: 60, spread: 55 });
    confetti({ ...defaults, particleCount: count * 0.6, angle: 120, spread: 55 });
  }
}

function spinWheel() {
  if (names.length < 1 || isSpinning) return;

  isSpinning = true;
  updateSpinPrompt();
  hideWinner();

  const n = names.length;
  const anglePerSegment = n === 1 ? 360 : 360 / n;
  const fullSpins = 4 + Math.random() * 3;
  const extraDegrees = Math.random() * 360;
  const totalRotation = 360 * fullSpins + extraDegrees;

  const startRotation = accumulatedRotation;
  accumulatedRotation += totalRotation;

  wheelEl.style.transform = `rotate(${startRotation}deg)`;
  wheelEl.offsetHeight;

  wheelEl.classList.add('spinning');
  wheelEl.style.transform = `rotate(${accumulatedRotation}deg)`;

  setTimeout(() => {
    const finalRotation = accumulatedRotation % 360;
    const pointerAngle = 270;
    const angleAtPointer = (pointerAngle - finalRotation + 360) % 360;
    const winnerIndex =
      n === 1 ? 0 : Math.floor(((angleAtPointer + 90) % 360) / anglePerSegment) % n;
    const clampedIndex = Math.min(winnerIndex, n - 1);
    isSpinning = false;
    showWinner(names[clampedIndex]);
    updateSpinPrompt();
    if (spinBtn) spinBtn.disabled = false;
  }, 4000);
}

addBtn.addEventListener('click', addName);
nameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.ctrlKey) addName();
});
nameInput.addEventListener('input', () => {
  addBtn.disabled = names.length >= MAX_NAMES || !nameInput.value.trim();
});
clearBtn.addEventListener('click', clearAll);

if (wheelCenter) wheelCenter.addEventListener('click', spinWheel);
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'Enter') {
    e.preventDefault();
    spinWheel();
  }
});
if (spinBtn) spinBtn.addEventListener('click', spinWheel);

updateNameCount();
updateMoneyDisplays();
drawWheel();
