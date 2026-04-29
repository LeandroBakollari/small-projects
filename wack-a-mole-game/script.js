const letters = 'qweasdzxc';

const START_SPAWN_MS = 1800;
const MIN_SPAWN_MS = 600;
const SPAWN_STEP = 5;

const START_LIFE_MS = 2300;
const MIN_LIFE_MS = 900;
const LIFE_STEP = 3;

const MISS_DAMAGE = 6;
const circleColors = [
  { fill: '#ffd7b5', border: '#df8d63', text: '#3f2b22' },
  { fill: '#cbe7ff', border: '#77a9d8', text: '#17324a' },
  { fill: '#d7eddc', border: '#7eb48a', text: '#1d3a27' },
  { fill: '#e8d9ff', border: '#aa8ed8', text: '#2f234b' },
];

let score = 0;
let combo = 0;
let maxCombo = 0;
let health = 100;
let gameRunning = false;
let currentSpawnMs = START_SPAWN_MS;
let currentLifeMs = START_LIFE_MS;
let lastSpawnTime = 0;
let startTime = 0;

const screens = {
  start: document.getElementById('start-screen'),
  game: document.getElementById('game-screen'),
  over: document.getElementById('game-over-screen'),
};
const gameArea = document.getElementById('game-area');
const scoreEl = document.getElementById('score');
const comboEl = document.getElementById('combo');
const maxComboEl = document.getElementById('max-combo');
const healthWrapper = document.getElementById('health-wrapper');
const healthBar = document.getElementById('health-bar');
const spawnMsEl = document.getElementById('spawn-ms');
const lifeMsEl = document.getElementById('life-ms');
const finalScoreEl = document.getElementById('final-score');
const maxComboOutEl = document.getElementById('max-combo-out');

function showScreen(screenName) {
  Object.values(screens).forEach(screen => screen.classList.remove('active'));
  screens[screenName].classList.add('active');
}

function startGame() {
  if (gameRunning) return;

  score = 0;
  combo = 0;
  maxCombo = 0;
  health = 100;
  currentSpawnMs = START_SPAWN_MS;
  currentLifeMs = START_LIFE_MS;
  startTime = performance.now();
  lastSpawnTime = startTime;
  gameArea.innerHTML = '';

  showScreen('game');
  gameRunning = true;
  updateUI();
  spawnCircle();
  requestAnimationFrame(gameLoop);
}

function endGame() {
  if (!gameRunning) return;

  gameRunning = false;
  gameArea.querySelectorAll('.circle').forEach(circle => {
    clearTimeout(circle.expireTimer);
  });

  finalScoreEl.textContent = `Score: ${score}`;
  maxComboOutEl.textContent = `Max Combo: ${maxCombo}`;
  showScreen('over');
}

function gameLoop(timestamp) {
  if (!gameRunning) return;

  const elapsed = timestamp - startTime;
  currentSpawnMs = Math.max(MIN_SPAWN_MS, START_SPAWN_MS - (elapsed / 1000) * SPAWN_STEP);
  currentLifeMs = Math.max(MIN_LIFE_MS, START_LIFE_MS - (elapsed / 1000) * LIFE_STEP);

  if (timestamp - lastSpawnTime >= currentSpawnMs) {
    spawnCircle();
    lastSpawnTime = timestamp;
  }

  updateUI();
  requestAnimationFrame(gameLoop);
}

function spawnCircle() {
  const circle = document.createElement('button');
  const letter = letters[Math.floor(Math.random() * letters.length)];
  const color = circleColors[Math.floor(Math.random() * circleColors.length)];
  const size = 56;
  const maxX = Math.max(0, gameArea.clientWidth - size);
  const maxY = Math.max(0, gameArea.clientHeight - size);

  circle.type = 'button';
  circle.className = 'circle';
  circle.textContent = letter;
  circle.dataset.letter = letter;
  circle.setAttribute('aria-label', `Hit ${letter}`);
  circle.style.left = `${Math.random() * maxX}px`;
  circle.style.top = `${Math.random() * maxY}px`;
  circle.style.setProperty('--circle-fill', color.fill);
  circle.style.setProperty('--circle-border', color.border);
  circle.style.setProperty('--circle-text', color.text);
  circle.addEventListener('click', () => hitCircle(circle));

  circle.expireTimer = setTimeout(() => {
    if (circle.isConnected) missCircle(circle);
  }, currentLifeMs);

  gameArea.appendChild(circle);
}

function hitCircle(circle) {
  if (!gameRunning || !resolveCircle(circle, 'hit')) return;

  const comboBonus = Math.floor(combo / 10) * 2;
  score += 10 + comboBonus;
  combo++;
  maxCombo = Math.max(maxCombo, combo);

  if (combo % 10 === 0) {
    health = Math.min(100, health + 3);
  }

  setTimeout(() => circle.remove(), 120);
  updateUI();
}

function missCircle(circle) {
  if (!gameRunning || !resolveCircle(circle, 'miss')) return;

  applyMissPenalty();
  setTimeout(() => circle.remove(), 120);
}

function resolveCircle(circle, resultClass) {
  if (circle.dataset.resolved === 'true') return false;

  circle.dataset.resolved = 'true';
  circle.disabled = true;
  clearTimeout(circle.expireTimer);
  circle.classList.add(resultClass);
  return true;
}

function applyMissPenalty() {
  if (!gameRunning) return;

  health = Math.max(0, health - MISS_DAMAGE);
  combo = 0;
  updateUI();

  if (health === 0) {
    endGame();
  }
}

function handleKeydown(event) {
  if (!gameRunning || event.repeat) return;

  const key = event.key.toLowerCase();
  if (!letters.includes(key)) return;

  const matchingCircle = [...gameArea.querySelectorAll('.circle')]
    .find(circle => circle.dataset.resolved !== 'true' && circle.dataset.letter === key);

  if (matchingCircle) {
    hitCircle(matchingCircle);
  } else {
    applyMissPenalty();
  }
}

function updateUI() {
  scoreEl.textContent = score;
  comboEl.textContent = combo;
  maxComboEl.textContent = maxCombo;
  healthBar.style.width = `${health}%`;
  healthBar.style.backgroundColor = health > 60
    ? 'var(--health-good)'
    : health > 30
      ? 'var(--health-warn)'
      : 'var(--health-danger)';
  healthWrapper.setAttribute('aria-valuenow', health);
  spawnMsEl.textContent = `${Math.round(currentSpawnMs)} ms`;
  lifeMsEl.textContent = `${Math.round(currentLifeMs)} ms`;
}

document.addEventListener('keydown', handleKeydown);
document.getElementById('start-button').addEventListener('click', startGame);
document.getElementById('restart-button').addEventListener('click', startGame);
