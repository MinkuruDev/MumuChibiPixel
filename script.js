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

// Preload default image
window.addEventListener('load', () => {
  img.onload = function() {
    scale = 5; // Start zoomed in 5x

    // Step 1: Draw at native resolution to get original pixel data
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    originalImage = ctx.getImageData(0, 0, img.width, img.height);

    // Step 2: Now redraw zoomed
    redraw();
  };
  img.src = './mumu-chibi-wplace.png'; // your default image file
});

// // Load image
// imageLoader.addEventListener('change', function(e) {
//   const reader = new FileReader();
//   reader.onload = function(event) {
//     img.onload = function() {
//       scale = 4;
//       canvas.width = img.width;
//       canvas.height = img.height;
//       ctx.drawImage(img, 0, 0);
//       originalImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
//       selectedX = null;
//       selectedY = null;
//     };
//     img.src = event.target.result;
//   };
//   reader.readAsDataURL(e.target.files[0]);
// });

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

function drawSelection() {
  const px = selectedX * scale;
  const py = selectedY * scale;

  ctx.strokeStyle = 'red';
  ctx.lineWidth = 1;
  ctx.strokeRect(px, py, scale, scale);
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
});

// Keyboard navigation
canvas.addEventListener('keydown', function(e) {
  if (selectedX === null || selectedY === null) return;
  
  if (e.key === 'ArrowUp' && selectedY > 0) selectedY--;
  else if (e.key === 'ArrowDown' && selectedY < originalImage.height - 1) selectedY++;
  else if (e.key === 'ArrowLeft' && selectedX > 0) selectedX--;
  else if (e.key === 'ArrowRight' && selectedX < originalImage.width - 1) selectedX++;
  else return; // Ignore other keys
  
  redraw();
  updatePixelInfo(selectedX, selectedY);
  e.preventDefault();
});

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(v => {
    const h = v.toString(16);
    return h.length === 1 ? "0" + h : h;
  }).join('');
}
