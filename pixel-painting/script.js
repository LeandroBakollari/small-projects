// ======= elements =======
const board = document.getElementById('board');
const colorPicker = document.getElementById('colorPicker');
const sizeSlider = document.getElementById('sizeSlider');
const sizeLabel = document.getElementById('sizeLabel');
const paintBtn = document.getElementById('paintBtn');
const eraserBtn = document.getElementById('eraserBtn');
const rainbowBtn = document.getElementById('rainbowBtn');
const gridBtn = document.getElementById('gridBtn');
const clearBtn = document.getElementById('clearBtn');

// ======= state =======
let gridSize = Number.parseInt(sizeSlider.value, 10);
let isDrawing = false;
let mode = 'paint'; // 'paint' | 'erase'
let rainbow = false;
let showGrid = true;

// ======= helpers =======
const setCSSVar = (name, value) => document.documentElement.style.setProperty(name, value);

function updateSizeLabel() {
  sizeLabel.textContent = `${gridSize} x ${gridSize}`;
}

function randomColor() {
  const h = Math.floor(Math.random() * 360);
  return `hsl(${h} 88% 58%)`;
}

function isRightClick(event) {
  return event.button === 2 || (event.buttons & 2) === 2;
}

function eraseCell(cell) {
  cell.style.backgroundColor = '';
}

function paintCell(cell) {
  cell.style.backgroundColor = rainbow ? randomColor() : colorPicker.value;
}

function applyToCell(cell, pointerEvent) {
  if (!(cell instanceof HTMLElement) || !cell.classList.contains('pixel')) return;

  if (mode === 'erase' || (mode === 'paint' && isRightClick(pointerEvent))) {
    eraseCell(cell);
    return;
  }

  paintCell(cell);
}

function setActive(btn, active) {
  btn.classList.toggle('active', active);
  btn.setAttribute('aria-pressed', String(active));
}

function rebuildGrid() {
  board.innerHTML = '';
  setCSSVar('--grid-size', gridSize);

  const frag = document.createDocumentFragment();
  for (let i = 0; i < gridSize * gridSize; i++) {
    const cell = document.createElement('div');
    cell.className = `pixel${showGrid ? ' grid' : ''}`;
    frag.appendChild(cell);
  }

  board.appendChild(frag);
}

function stopDrawing(event) {
  isDrawing = false;
  if (event && board.hasPointerCapture(event.pointerId)) {
    board.releasePointerCapture(event.pointerId);
  }
}

// ======= init =======
updateSizeLabel();
rebuildGrid();

// Prevent context menu because right-click is used as a temporary eraser.
board.addEventListener('contextmenu', (event) => event.preventDefault());

// Mouse, pen, and touch interactions.
board.addEventListener('pointerdown', (event) => {
  if (event.button !== 0 && event.button !== 2) return;

  isDrawing = true;
  board.setPointerCapture(event.pointerId);
  applyToCell(event.target, event);
});

board.addEventListener('pointermove', (event) => {
  if (!isDrawing) return;

  const cell = document.elementFromPoint(event.clientX, event.clientY);
  applyToCell(cell, event);
});

board.addEventListener('pointerup', stopDrawing);
board.addEventListener('pointercancel', stopDrawing);
board.addEventListener('pointerleave', () => {
  isDrawing = false;
});

// Controls.
sizeSlider.addEventListener('input', () => {
  gridSize = Number.parseInt(sizeSlider.value, 10);
  updateSizeLabel();
  rebuildGrid();
});

paintBtn.addEventListener('click', () => {
  mode = 'paint';
  setActive(paintBtn, true);
  setActive(eraserBtn, false);
});

eraserBtn.addEventListener('click', () => {
  mode = 'erase';
  setActive(paintBtn, false);
  setActive(eraserBtn, true);
});

rainbowBtn.addEventListener('click', () => {
  rainbow = !rainbow;
  setActive(rainbowBtn, rainbow);
});

gridBtn.addEventListener('click', () => {
  showGrid = !showGrid;
  setActive(gridBtn, showGrid);

  board.querySelectorAll('.pixel').forEach((cell) => {
    cell.classList.toggle('grid', showGrid);
  });
});

clearBtn.addEventListener('click', () => {
  board.querySelectorAll('.pixel').forEach(eraseCell);
});

// Keyboard shortcuts.
document.addEventListener('keydown', (event) => {
  if (event.target instanceof HTMLInputElement) return;

  const key = event.key.toLowerCase();
  if (key === 'e') eraserBtn.click();
  if (key === 'p') paintBtn.click();
  if (key === 'g') gridBtn.click();
  if (key === 'r') rainbowBtn.click();
  if (key === 'c') clearBtn.click();
});
