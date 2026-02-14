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
const totalEntriesEl = document.getElementById('total-entries');

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
  if (totalEntriesEl) totalEntriesEl.textContent = `Total entries: ${names.length}`;
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
    text.textContent = 'Add names to spin';
    if (sub) sub.textContent = '';
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

function getSegmentClipPath(angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  const x = 50 + 50 * Math.cos(rad);
  const y = 50 - 50 * Math.sin(rad);
  return `polygon(50% 50%, 100% 50%, ${x}% ${y}%)`;
}

function drawWheel() {
  accumulatedRotation = 0;
  wheelEl.innerHTML = '';
  wheelEl.classList.remove('spinning');
  wheelEl.style.transform = '';

  const n = names.length;

  if (n === 0) {
    const full = document.createElement('div');
    full.className = 'wheel-segment wheel-segment-full';
    full.style.background = '#2a2a35';
    wheelEl.appendChild(full);
    const empty = document.createElement('div');
    empty.className = 'empty-wheel-message';
    empty.textContent = 'Add names to get started';
    wheelEl.appendChild(empty);
    updateSpinPrompt();
    return;
  }

  const anglePerSegment = 360 / n;

  if (n === 1) {
    const segment = document.createElement('div');
    segment.className = 'wheel-segment wheel-segment-full';
    segment.style.background = SEGMENT_COLORS[0];
    const inner = document.createElement('div');
    inner.className = 'wheel-segment-inner wheel-segment-inner-center';
    const span = document.createElement('span');
    span.textContent = names[0];
    inner.appendChild(span);
    segment.appendChild(inner);
    wheelEl.appendChild(segment);
  } else {
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
  updateSpinPrompt();
}

function hideWinner() {
  winnerBanner.classList.add('hidden');
}

function showWinner(name) {
  winnerNameEl.textContent = name;
  winnerBanner.classList.remove('hidden');
  updateSpinPrompt();
}

function spinWheel() {
  if (names.length < 1 || isSpinning) return;

  isSpinning = true;
  updateSpinPrompt();
  hideWinner();

  const n = names.length;
  const anglePerSegment = n === 1 ? 360 : 360 / n;
  const winnerIndex = n === 1 ? 0 : Math.floor(Math.random() * n);
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
    showWinner(names[winnerIndex]);
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
