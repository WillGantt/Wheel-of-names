const MAX_NAMES = 100;
const MONEY_PER_ENTRY = 5;
const SEGMENT_COLORS = [
  '#ff6b35', '#00c9a7', '#ffd93d', '#6bcb77', '#4d96ff', '#c44dff',
  '#ff8c42', '#2ec4b6', '#e8c547', '#7bdcb5'
];

const nameInput = document.getElementById('name-input');
const addBtn = document.getElementById('add-btn');
const clearBtn = document.getElementById('clear-btn');
const nameList = document.getElementById('name-list');
const nameCountEl = document.getElementById('name-count');
const wheelEl = document.getElementById('wheel');
const spinBtn = document.getElementById('spin-btn');
const prizeMoneyEl = document.getElementById('prize-money');
const charityMoneyEl = document.getElementById('charity-money');
const winnerBanner = document.getElementById('winner-banner');
const winnerNameEl = document.getElementById('winner-name');

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
  spinBtn.disabled = names.length < 2 || isSpinning;
  if (names.length >= MAX_NAMES) {
    nameInput.placeholder = 'Maximum 100 names reached';
  } else {
    nameInput.placeholder = 'Enter a name...';
  }
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
  nameInput.placeholder = 'Enter a name...';
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
    li.className = 'name-tag';
    const span = document.createElement('span');
    span.textContent = name;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.innerHTML = '×';
    btn.setAttribute('aria-label', `Remove ${name}`);
    btn.addEventListener('click', () => removeName(i));
    li.appendChild(span);
    li.appendChild(btn);
    nameList.appendChild(li);
  });
}

function getSegmentClipPath(angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  const x = 50 + 50 * Math.cos(rad);
  const y = 50 - 50 * Math.sin(rad);
  return `polygon(0 0, 100% 0, ${x}% ${y}%)`;
}

function drawWheel() {
  accumulatedRotation = 0;
  wheelEl.innerHTML = '';
  wheelEl.classList.remove('spinning');
  wheelEl.style.transform = '';

  if (names.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-wheel-message';
    empty.textContent = 'Add at least 2 names to spin';
    wheelEl.appendChild(empty);
    return;
  }

  const n = names.length;
  const anglePerSegment = 360 / n;

  names.forEach((name, i) => {
    const segment = document.createElement('div');
    segment.className = 'wheel-segment';
    segment.style.transform = `rotate(${i * anglePerSegment}deg)`;
    segment.style.background = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
    segment.style.clipPath = getSegmentClipPath(anglePerSegment);
    segment.style.webkitClipPath = getSegmentClipPath(anglePerSegment);

    const inner = document.createElement('div');
    inner.className = 'wheel-segment-inner';
    inner.style.transform = `rotate(${anglePerSegment / 2}deg)`;
    const span = document.createElement('span');
    span.textContent = name;
    inner.appendChild(span);
    segment.appendChild(inner);
    wheelEl.appendChild(segment);
  });
}

function hideWinner() {
  winnerBanner.classList.add('hidden');
}

function showWinner(name) {
  winnerNameEl.textContent = name;
  winnerBanner.classList.remove('hidden');
}

function spinWheel() {
  if (names.length < 2 || isSpinning) return;

  isSpinning = true;
  spinBtn.disabled = true;
  hideWinner();

  const n = names.length;
  const anglePerSegment = 360 / n;
  const winnerIndex = Math.floor(Math.random() * n);
  const pointerAngle = 270;
  const winnerCenterAngle = winnerIndex * anglePerSegment + anglePerSegment / 2;
  const fullSpins = 4 + Math.random() * 3;
  const winnerAngle = (winnerCenterAngle - pointerAngle - accumulatedRotation + 360 * 10) % 360;
  const totalRotation = 360 * fullSpins + winnerAngle;

  const startRotation = accumulatedRotation;
  accumulatedRotation += totalRotation;

  wheelEl.style.transform = `rotate(${startRotation}deg)`;
  wheelEl.offsetHeight;

  wheelEl.classList.add('spinning');
  wheelEl.style.transform = `rotate(${accumulatedRotation}deg)`;

  setTimeout(() => {
    isSpinning = false;
    spinBtn.disabled = names.length < 2;
    showWinner(names[winnerIndex]);
  }, 4000);
}

addBtn.addEventListener('click', addName);
nameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addName();
});
nameInput.addEventListener('input', () => {
  addBtn.disabled = names.length >= MAX_NAMES || !nameInput.value.trim();
});
clearBtn.addEventListener('click', clearAll);
spinBtn.addEventListener('click', spinWheel);

updateNameCount();
updateMoneyDisplays();
drawWheel();
