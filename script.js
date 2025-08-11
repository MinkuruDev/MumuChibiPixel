// Color name mapping
const colorNames = {
    "#000000": "Black",
    "#3c3c3c": "Dark Gray",
    "#787878": "Gray",
    "#d2d2d2": "Light Gray",
    "#ffffff": "White",

    "#600018": "Deep Red",
    "#ed1c24": "Red",
    "#ff7f27": "Orange",

    "#f6aa09": "Gold",
    "#f9dd3b": "Yellow",
    "#fffabc": "Light Yellow",

    "#0eb968": "Dark Green",
    "#13e67b": "Green",
    "#87ff5e": "Light Green",

    "#0c816e": "Dark Teal",
    "#10aea6": "Teal",
    "#13e1be": "Light Teal",
    "#60f7f2": "Cyan",

    "#28509e": "Dark Blue",
    "#4093e4": "Blue",
    "#6b50f6": "Indigo",
    "#99b1fb": "Light Indigo",

    "#780c99": "Dark Purple",
    "#aa38b9": "Purple",
    "#e09ff9": "Light Purple",

    "#cb007a": "Dark Pink",
    "#ec1f80": "Pink",
    "#f38da9": "Light Pink",

    "#684634": "Dark Brown",
    "#95682a": "Brown",

    "#f8b277": "Beige",
};

const imageLoader = document.getElementById('imageLoader');
const canvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d');

let img = new Image();
let scale = 1;
let originalImage = null;

// Selected pixel coordinates
let selectedX = null;
let selectedY = null;

// Chunk viewer setup
const chunkSize = 20;
const chunkCanvas = document.getElementById('chunkCanvas');
const chunkCtx = chunkCanvas.getContext('2d');

// Preload default image
window.addEventListener('load', () => {
  img.onload = function() {
    scale = 5; // Start zoomed in 5x

    // Draw at native resolution to get original pixels
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    originalImage = ctx.getImageData(0, 0, img.width, img.height);

    redraw();
  };
  img.src = './images/Mumu-chibi-wplace.png'; // your default image file
});

// Zoom buttons
document.getElementById('zoomIn').addEventListener('click', () => {
  scale *= 1.2;
  redraw();
});
document.getElementById('zoomOut').addEventListener('click', () => {
  scale /= 1.2;
  redraw();
});

function redraw() {
  if (!originalImage) return;
  canvas.width = originalImage.width * scale;
  canvas.height = originalImage.height * scale;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  if (selectedX !== null && selectedY !== null) {
    drawSelection();
  }
}

const rootWplaceX = 3001; // Adjust as needed
const rootWplaceY = 500; // Adjust as needed

// Get pixel color at coordinates
function updatePixelInfo(x, y) {
  if (!originalImage) return;
  const index = (y * originalImage.width + x) * 4;
  const pixel = originalImage.data;
  
  const r = pixel[index];
  const g = pixel[index + 1];
  const b = pixel[index + 2];
  const hex = rgbToHex(r, g, b);
  
  document.getElementById('coords').textContent = `${x}, ${y}`;
  document.getElementById('wplaceCoords').textContent = `${x + rootWplaceX}, ${y + rootWplaceY} Thanh Hoá #5`;
  document.getElementById('colorValue').textContent = `${hex} (RGB: ${r},${g},${b})`;
  document.getElementById('colorBox').style.backgroundColor = hex;
  document.getElementById('colorName').textContent =
    colorNames[hex.toLowerCase()] ? ` - ${colorNames[hex.toLowerCase()]}` : '';
}

// Draw selection border
function drawSelection() {
  const px = selectedX * scale;
  const py = selectedY * scale;

  ctx.strokeStyle = 'red';
  ctx.lineWidth = 1;
  ctx.strokeRect(px, py, scale, scale);
}

// Show chunk viewer
function showChunkForPixel(x, y) {
  if (!originalImage) return;

  const chunkX = Math.floor(x / chunkSize);
  const chunkY = Math.floor(y / chunkSize);
  
  const x1 = chunkX * chunkSize;
  const y1 = chunkY * chunkSize;
  const x2 = Math.min(x1 + chunkSize, originalImage.width) - 1;
  const y2 = Math.min(y1 + chunkSize, originalImage.height) - 1;

  const width = x2 - x1 + 1;
  const height = y2 - y1 + 1;
  const chunkData = ctx.createImageData(width, height);

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const srcIndex = ((y1 + row) * originalImage.width + (x1 + col)) * 4;
      const dstIndex = (row * width + col) * 4;
      chunkData.data[dstIndex] = originalImage.data[srcIndex];
      chunkData.data[dstIndex + 1] = originalImage.data[srcIndex + 1];
      chunkData.data[dstIndex + 2] = originalImage.data[srcIndex + 2];
      chunkData.data[dstIndex + 3] = originalImage.data[srcIndex + 3];
    }
  }

  chunkCanvas.width = width * 10;
  chunkCanvas.height = height * 10;
  chunkCtx.imageSmoothingEnabled = false;

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  tempCanvas.getContext('2d').putImageData(chunkData, 0, 0);
  chunkCtx.drawImage(tempCanvas, 0, 0, chunkCanvas.width, chunkCanvas.height);

  // Highlight the selected pixel in chunk view
  const selChunkX = (x - x1) * 10;
  const selChunkY = (y - y1) * 10;
  chunkCtx.strokeStyle = 'red';
  chunkCtx.lineWidth = 1;
  chunkCtx.strokeRect(selChunkX, selChunkY, 10, 10);

  document.getElementById('chunkInfo').textContent = `Chunk: (${x1},${y1}) -> (${x2},${y2})`;
}

// Click to select pixel
canvas.addEventListener('click', function(e) {
  if (!originalImage) return;
  
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / scale);
  const y = Math.floor((e.clientY - rect.top) / scale);
  
  if (x < 0 || y < 0 || x >= originalImage.width || y >= originalImage.height) return;
  
  selectedX = x;
  selectedY = y;
  redraw();
  updatePixelInfo(x, y);
  showChunkForPixel(x, y);
});

// Keyboard navigation
window.addEventListener('keydown', function(e) {
  if (selectedX === null || selectedY === null) return;
  
  if (e.key === 'ArrowUp' && selectedY > 0) selectedY--;
  else if (e.key === 'ArrowDown' && selectedY < originalImage.height - 1) selectedY++;
  else if (e.key === 'ArrowLeft' && selectedX > 0) selectedX--;
  else if (e.key === 'ArrowRight' && selectedX < originalImage.width - 1) selectedX++;
  else return;
  
  redraw();
  updatePixelInfo(selectedX, selectedY);
  showChunkForPixel(selectedX, selectedY);
  e.preventDefault();
});

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(v => {
    const h = v.toString(16);
    return h.length === 1 ? "0" + h : h;
  }).join('');
}

// Allow clicking inside the chunk viewer
chunkCanvas.addEventListener('click', function(e) {
  if (!originalImage || selectedX === null || selectedY === null) return;

  const rect = chunkCanvas.getBoundingClientRect();
  const clickX = Math.floor((e.clientX - rect.left) / 10); // 10 = scale factor in chunk view
  const clickY = Math.floor((e.clientY - rect.top) / 10);

  // Find current chunk bounds
  const chunkX = Math.floor(selectedX / chunkSize);
  const chunkY = Math.floor(selectedY / chunkSize);
  const x1 = chunkX * chunkSize;
  const y1 = chunkY * chunkSize;

  // New selected pixel in full image
  const newX = x1 + clickX;
  const newY = y1 + clickY;

  if (newX >= originalImage.width || newY >= originalImage.height) return;

  selectedX = newX;
  selectedY = newY;
  redraw();
  updatePixelInfo(newX, newY);
  showChunkForPixel(newX, newY);
});
