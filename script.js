/* Aspect Ratio Data Sets */
const horizontalRatios = [
  { value: "1:1",   text: "1:1 (Square) - 1.00" },
  { value: "4:3",   text: "4:3 (Standard/Classic) - 1.33" },
  { value: "3:2",   text: "3:2 (Photography) - 1.50" },
  { value: "16:10", text: "16:10 (Widescreen Monitor) - 1.60" },
  { value: "16:9",  text: "16:9 (Widescreen HD) - 1.78" },
  { value: "21:9",  text: "21:9 (Ultrawide) - 2.33" },
  { value: "5:4",   text: "5:4 - 1.25" },
  { value: "2:1",   text: "2:1 (Univisium) - 2.00" },
  { value: "2.35:1", text: "2.35:1 (Cinemascope) - 2.35" }
];
const verticalRatios = [
  { value: "9:16", text: "9:16 (Portrait - Tall) - 0.56" },
  { value: "4:5",  text: "4:5 (Portrait - Medium Format) - 0.80" },
  { value: "5:7",  text: "5:7 (Portrait - Standard Print) - 0.71" },
  { value: "2:3",  text: "2:3 (Portrait - 35mm Film) - 0.67" },
  { value: "3:4",  text: "3:4 (Portrait) - 0.75" },
  { value: "1:1",  text: "1:1 (Square) - 1.00" }
];

/* References for first/second tools */
const pixelWidthInput   = document.getElementById("pixelWidth");
const pixelHeightInput  = document.getElementById("pixelHeight");
const megapixelsInput   = document.getElementById("megapixels");
const aspectRatioSelect = document.getElementById("aspectRatioSelect");
const customRatioInput  = document.getElementById("customAspectRatio");
const savedRatiosSelect = document.getElementById("savedRatiosSelect");
const resolutionMultiplier = document.getElementById("resolutionMultiplier");
const resultDiv1 = document.getElementById("result1");
const resultDiv2 = document.getElementById("result2");
const aspectRatioPreview = document.getElementById("aspectRatioPreview");
const flipSuggestionDiv  = document.getElementById("flipSuggestion");
const horizontalButton = document.getElementById("horizontalButton");
const verticalButton   = document.getElementById("verticalButton");
const themeToggleButton = document.getElementById("themeToggleButton");
const bodyElement       = document.getElementById("body");

/* Third tool references */
const dropZone                   = document.getElementById("dropZone");
const imageFileInput             = document.getElementById("imageFileInput");
const detectedWidthInput         = document.getElementById("detectedWidth");
const detectedHeightInput        = document.getElementById("detectedHeight");
const detectedAspectRatioInput   = document.getElementById("detectedAspectRatio");
const detectedMegapixelsInput    = document.getElementById("detectedMegapixels");
const detectedResolutionMultiplier = document.getElementById("detectedResolutionMultiplier");

/* Initialize placeholders for first two tools */
resultDiv1.innerHTML = "<span style='color: firebrick;'>Enter width and height in pixels.</span>";
resultDiv2.innerHTML = "<span style='color: firebrick;'>Enter megapixels and aspect ratio.</span>";

/* 1) Pixels -> MP & Aspect Ratio */
function calculateMegapixels() {
  const w = parseFloat(pixelWidthInput.value);
  const h = parseFloat(pixelHeightInput.value);
  if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
    resultDiv1.innerHTML = "<span style='color: firebrick;'>Enter valid width and height in pixels.</span>";
    removeCopyButton(resultDiv1);
    resetPreviewBox();
    return;
  }
  const mp = (w * h) / 1e6;
  const ratioDecimal = w / h;
  const ratioSimplified = simplifyAspectRatio(w, h);

  resultDiv1.innerHTML = `Megapixels: <span>${mp.toFixed(2)} MP</span><br>` +
                         `Aspect Ratio: <span>${ratioSimplified}</span> ` +
                         `(<span>${ratioDecimal.toFixed(2)}</span>)`;

  const pngSize  = estimatePNGFileSize(w, h);
  const jpegSize = estimateJPEGFileSize(w, h);
  resultDiv1.innerHTML += `<br><br>Est. PNG File Size: <span>${pngSize}</span> <span style="font-size: 0.8em; color: #777;">(approx)</span>`;
  resultDiv1.innerHTML += `<br>Est. JPEG File Size: <span>${jpegSize}</span> <span style="font-size: 0.8em; color: #777;">(approx)</span>`;
  addCopyButton(resultDiv1, resultDiv1.textContent);

  resultDiv1.classList.add("result-highlight");
  setTimeout(() => resultDiv1.classList.remove("result-highlight"), 800);

  updatePreviewBox(ratioDecimal);
  aspectRatioPreview.textContent = ratioSimplified;
}

/* 2) Megapixels & Aspect Ratio -> Pixels */
function calculatePixels() {
  const mp = parseFloat(megapixelsInput.value);

  // If user typed nothing or invalid in Megapixels, show an error & clear
  if (isNaN(mp) || mp <= 0) {
    resultDiv2.innerHTML = "<span style='color: firebrick;'>Enter valid megapixels first.</span>";
    removeCopyButton(resultDiv2);
    resetPreviewBox();
    return;
  }

  // Decide ratio from custom input or preset
  let ratioStr = aspectRatioSelect.value;
  if (customRatioInput.value.trim() !== "") {
    ratioStr = customRatioInput.value;
  }
  if (!ratioStr) {
    resultDiv2.innerHTML = "<span style='color: firebrick;'>Select or enter an aspect ratio.</span>";
    removeCopyButton(resultDiv2);
    resetPreviewBox();
    return;
  }

  const parts = ratioStr.split(":");
  if (parts.length !== 2) {
    resultDiv2.innerHTML = "<span style='color: firebrick;'>Invalid aspect ratio format. Use '16:9' etc.</span>";
    removeCopyButton(resultDiv2);
    return;
  }
  const rw = parseFloat(parts[0]);
  const rh = parseFloat(parts[1]);
  if (isNaN(rw) || isNaN(rh) || rw <= 0 || rh <= 0) {
    resultDiv2.innerHTML = "<span style='color: firebrick;'>Invalid aspect ratio values.</span>";
    removeCopyButton(resultDiv2);
    return;
  }

  // Perform the actual calculation
  const x = Math.sqrt((mp * 1e6) / (rw * rh));
  const pixW = Math.round(rw * x);
  const pixH = Math.round(rh * x);

  resultDiv2.innerHTML = `Pixel Width: <span>${pixW} px</span><br>` +
                         `Pixel Height: <span>${pixH} px</span>`;

  // Show PNG & JPEG estimates
  const pngSize  = estimatePNGFileSize(pixW, pixH);
  const jpegSize = estimateJPEGFileSize(pixW, pixH);
  resultDiv2.innerHTML += `<br><br>Est. PNG File Size: <span>${pngSize}</span> <span style="font-size: 0.8em; color: #777;">(approx)</span>`;
  resultDiv2.innerHTML += `<br>Est. JPEG File Size: <span>${jpegSize}</span> <span style="font-size: 0.8em; color: #777;">(approx)</span>`;
  addCopyButton(resultDiv2, resultDiv2.textContent);

  resultDiv2.classList.add("result-highlight");
  setTimeout(() => resultDiv2.classList.remove("result-highlight"), 800);

  // Update preview
  const ratioDecimal = rw / rh;
  updatePreviewBox(ratioDecimal);
  aspectRatioPreview.textContent = ratioStr;

  // Possibly show Flip suggestion if ratio is very tall or wide
  if (ratioDecimal < 0.5 || ratioDecimal > 2) {
    flipSuggestionDiv.innerHTML = `<button class="flip-button" onclick="flipSecondTool()">Flip Ratio</button>`;
  } else {
    flipSuggestionDiv.innerHTML = "";
  }
}

/* Called when user changes the preset aspect ratio */
function presetChanged() {
  // Clear any custom ratio
  customRatioInput.value = "";
  // Immediately recalc with the new ratio
  calculatePixels();
}

/* 3) Third Tool: Image Import (Dimension Check) */
dropZone.addEventListener("click", () => {
  imageFileInput.click();
});
dropZone.addEventListener("dragover", e => {
  e.preventDefault();
  dropZone.style.backgroundColor = "#c8e6c9";
});
dropZone.addEventListener("dragleave", e => {
  e.preventDefault();
  dropZone.style.backgroundColor = "";
});
dropZone.addEventListener("drop", e => {
  e.preventDefault();
  dropZone.style.backgroundColor = "";
  if(e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    resetCalculator3(); // Clear old data first
    handleImageFile(e.dataTransfer.files[0]);
  }
});
imageFileInput.addEventListener("change", () => {
  if(imageFileInput.files && imageFileInput.files.length > 0) {
    resetCalculator3(); // Clear old data first
    handleImageFile(imageFileInput.files[0]);
  }
});

function handleImageFile(file) {
  if(!file.type.startsWith("image/")) {
    alert("Not an image file!");
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      detectedWidthInput.value  = img.naturalWidth;
      detectedHeightInput.value = img.naturalHeight;

      // Show aspect ratio
      const ratioText = simplifyAspectRatio(img.naturalWidth, img.naturalHeight);
      const ratioDecimal = img.naturalWidth / img.naturalHeight;
      detectedAspectRatioInput.value = `${ratioText} (${ratioDecimal.toFixed(2)})`;

      // Show megapixels
      const mp = (img.naturalWidth * img.naturalHeight)/1e6;
      detectedMegapixelsInput.value = mp.toFixed(2);
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function scaleDetectedResolution() {
  const multiplier = parseFloat(detectedResolutionMultiplier.value);
  if (!multiplier || isNaN(multiplier) || multiplier <= 1) {
    return;
  }
  let w = parseFloat(detectedWidthInput.value);
  let h = parseFloat(detectedHeightInput.value);
  if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
    alert("Please load an image first to detect dimensions.");
    detectedResolutionMultiplier.selectedIndex = 0;
    return;
  }
  detectedWidthInput.value  = Math.round(w * multiplier);
  detectedHeightInput.value = Math.round(h * multiplier);

  // Update aspect ratio
  const ratioText = simplifyAspectRatio(detectedWidthInput.value, detectedHeightInput.value);
  const ratioDecimal = detectedWidthInput.value / detectedHeightInput.value;
  detectedAspectRatioInput.value = `${ratioText} (${ratioDecimal.toFixed(2)})`;

  // Update megapixels
  const mp = (detectedWidthInput.value * detectedHeightInput.value)/1e6;
  detectedMegapixelsInput.value = mp.toFixed(2);

  detectedResolutionMultiplier.selectedIndex = 0;
}

/* Resets the third tool's fields */
function resetCalculator3() {
  detectedWidthInput.value       = "";
  detectedHeightInput.value      = "";
  detectedAspectRatioInput.value = "";
  detectedMegapixelsInput.value  = "";
  detectedResolutionMultiplier.selectedIndex = 0;
}

/* Scale resolution for the first tool */
function scaleResolution() {
  const multiplier = parseFloat(resolutionMultiplier.value);
  if (!multiplier || isNaN(multiplier) || multiplier <= 1) {
    return;
  }
  let w = parseFloat(pixelWidthInput.value);
  let h = parseFloat(pixelHeightInput.value);
  if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
    alert("Please enter a valid width and height first.");
    resolutionMultiplier.selectedIndex = 0;
    return;
  }
  pixelWidthInput.value = Math.round(w * multiplier);
  pixelHeightInput.value = Math.round(h * multiplier);
  calculateMegapixels();
  resolutionMultiplier.selectedIndex = 0;
}

/* Flip function for the upper tool only */
function flipUpperTool() {
  const currentWidth = pixelWidthInput.value;
  const currentHeight = pixelHeightInput.value;
  if (!currentWidth || !currentHeight) {
    alert("Please enter both width and height first.");
    return;
  }
  pixelWidthInput.value = currentHeight;
  pixelHeightInput.value = currentWidth;
  calculateMegapixels();
}

/* Flip function for the lower tool (auto-flip suggestion) */
function flipSecondTool() {
  let ratioStr = customRatioInput.value.trim() || aspectRatioSelect.value;
  const parts = ratioStr.split(":");
  if (parts.length !== 2) {
    alert("Please enter a valid ratio (e.g., 16:9) to flip.");
    return;
  }
  const flipped = parts[1] + ":" + parts[0];
  customRatioInput.value = flipped;
  calculatePixels();
}

/* Toggling ratio sets for the second tool */
function showHorizontalRatios() {
  populateAspectRatioDropdown(horizontalRatios);
  horizontalButton.classList.add("active");
  verticalButton.classList.remove("active");
  customRatioInput.value = "";
  // Recalc right away
  calculatePixels();
}
function showVerticalRatios() {
  populateAspectRatioDropdown(verticalRatios);
  verticalButton.classList.add("active");
  horizontalButton.classList.remove("active");
  customRatioInput.value = "";
  // Recalc right away
  calculatePixels();
}

function populateAspectRatioDropdown(ratios) {
  aspectRatioSelect.innerHTML = "";
  ratios.forEach(r => {
    const opt = document.createElement("option");
    opt.value = r.value;
    opt.text = r.text;
    aspectRatioSelect.add(opt);
  });
  customRatioInput.value = "";
}

/* Save Favorite Ratios */
function saveCurrentRatio() {
  let currentRatio = customRatioInput.value.trim() || aspectRatioSelect.value;
  if (!currentRatio || currentRatio.indexOf(":") === -1) {
    alert("No valid ratio to save.");
    return;
  }
  let saved = JSON.parse(localStorage.getItem("savedRatios") || "[]");
  if (!saved.some(r => r.toLowerCase() === currentRatio.toLowerCase())) {
    saved.push(currentRatio);
    localStorage.setItem("savedRatios", JSON.stringify(saved));
    updateSavedRatiosDropdown();
    alert("Ratio saved!");
  } else {
    alert("This ratio is already saved.");
  }
}
function updateSavedRatiosDropdown() {
  savedRatiosSelect.innerHTML = "<option value=''>--Select Saved Ratio--</option>";
  let saved = JSON.parse(localStorage.getItem("savedRatios") || "[]");
  saved.forEach(r => {
    const opt = document.createElement("option");
    opt.value = r;
    opt.text = r;
    savedRatiosSelect.add(opt);
  });
}
function loadSavedRatio() {
  const selected = savedRatiosSelect.value;
  if (selected) {
    customRatioInput.value = selected;
    calculatePixels();
  }
  savedRatiosSelect.selectedIndex = 0;
}

/* Copy & Reset Helpers */
function resetCalculator1() {
  pixelWidthInput.value = "";
  pixelHeightInput.value = "";
  resultDiv1.innerHTML = "<span style='color: firebrick;'>Enter width and height in pixels.</span>";
  removeCopyButton(resultDiv1);
  resetPreviewBox();
}
function resetCalculator2() {
  megapixelsInput.value = "";
  customRatioInput.value = "";
  resultDiv2.innerHTML = "<span style='color: firebrick;'>Enter megapixels and aspect ratio.</span>";
  removeCopyButton(resultDiv2);
  resetPreviewBox();
  showHorizontalRatios(); // default ratio set
}

function addCopyButton(resultDiv, textToCopy) {
  let copyBtn = resultDiv.querySelector(".copy-button");
  if (!copyBtn) {
    copyBtn = document.createElement("button");
    copyBtn.className = "copy-button";
    copyBtn.textContent = "Copy";
    copyBtn.onclick = () => copyToClipboard(textToCopy, copyBtn);
    resultDiv.appendChild(copyBtn);
  }
}
function removeCopyButton(resultDiv) {
  const copyBtn = resultDiv.querySelector(".copy-button");
  if (copyBtn) {
    copyBtn.remove();
  }
}
function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = "Copied!";
    setTimeout(() => { btn.textContent = "Copy"; }, 2000);
  }).catch(err => {
    console.error("Failed to copy:", err);
    btn.textContent = "Copy Failed";
    setTimeout(() => { btn.textContent = "Copy"; }, 3000);
  });
}

/* Ratio Simplifier */
function simplifyAspectRatio(width, height) {
  function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
  }
  const div = gcd(width, height);
  const sw = width/div;
  const sh = height/div;
  return `${sw}:${sh}`;
}

/* PNG File Size Estimate */
function estimatePNGFileSize(w, h) {
  if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
    return "N/A";
  }
  const bytesPerPixel = 3;
  const uncompressed = w * h * bytesPerPixel;
  const compressed = uncompressed / 3;
  return formatFileSize(compressed);
}
/* JPEG File Size Estimate */
function estimateJPEGFileSize(w, h) {
  if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
    return "N/A";
  }
  const bytesPerPixel = 3;
  const uncompressed = w * h * bytesPerPixel;
  // We'll assume a factor of ~10 compression for JPEG as a rough average
  const compressed = uncompressed / 10;
  return formatFileSize(compressed);
}

function formatFileSize(bytes) {
  if (bytes < 1024) {
    return bytes + " bytes";
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + " KB";
  } else if (bytes < 1024 * 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  } else {
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
  }
}

/* Update Preview Box Dimensions Based on Ratio */
function updatePreviewBox(ratioDecimal) {
  const maxDim = 300;
  if (ratioDecimal >= 1) {
    const w = maxDim;
    const h = maxDim / ratioDecimal;
    aspectRatioPreview.style.width = w + "px";
    aspectRatioPreview.style.height = h + "px";
  } else {
    const h = maxDim;
    const w = maxDim * ratioDecimal;
    aspectRatioPreview.style.width = w + "px";
    aspectRatioPreview.style.height = h + "px";
  }
}
function resetPreviewBox() {
  aspectRatioPreview.style.width = "200px";
  aspectRatioPreview.style.height = "200px";
  aspectRatioPreview.innerHTML = `Enter values to see preview<br>
  <span style="font-size:0.85em; color:#777;">
    Shortcut Keys: Shift+H (Horizontal), Shift+V (Vertical), Shift+F (Flip), Shift+R (Reset), Shift+T (Toggle Theme), Shift+S (Save Ratio)
  </span>`;
}

/* Keyboard Shortcuts (Shift-based) */
document.addEventListener("keydown", function(e) {
  if (e.shiftKey) {
    switch (e.key.toLowerCase()) {
      case "h":
        showHorizontalRatios();
        break;
      case "v":
        showVerticalRatios();
        break;
      case "f":
        // If the user is in the first tool inputs, flip those; else flip second tool ratio
        if (document.activeElement === pixelWidthInput || document.activeElement === pixelHeightInput) {
          flipUpperTool();
        } else {
          flipSecondTool();
        }
        break;
      case "r":
        // Reset all three tools
        resetCalculator1();
        resetCalculator2();
        resetCalculator3();
        break;
      case "t":
        toggleTheme();
        break;
      case "s":
        saveCurrentRatio();
        break;
    }
  }
});

/* Dark/Light Mode Toggle */
function toggleTheme() {
  bodyElement.classList.toggle("dark-mode");
  const isDark = bodyElement.classList.contains("dark-mode");
  themeToggleButton.textContent = isDark ? "Light Mode" : "Dark Mode";
  localStorage.setItem("themePreference", isDark ? "dark" : "light");
}

/* Info Modal Toggle */
function toggleInfo() {
  const infoOverlay = document.getElementById("infoOverlay");
  const infoToggleButton = document.getElementById("infoToggleButton");
  if (infoOverlay.style.display === "block") {
    infoOverlay.style.display = "none";
    infoToggleButton.textContent = "Show Info";
  } else {
    infoOverlay.style.display = "block";
    infoToggleButton.textContent = "Hide Info";
  }
}

/* On Page Load */
window.onload = function() {
  pixelWidthInput.focus();
  showHorizontalRatios(); // default ratio set is horizontal
  resetPreviewBox();
  updateSavedRatiosDropdown();

  const themePreference = localStorage.getItem("themePreference");
  if (themePreference === "dark") {
    bodyElement.classList.add("dark-mode");
    themeToggleButton.textContent = "Light Mode";
  } else {
    bodyElement.classList.remove("dark-mode");
    themeToggleButton.textContent = "Dark Mode";
  }
};

/* Smooth scroll to preview (for mobile) */
function scrollToPreview() {
  aspectRatioPreview.scrollIntoView({ behavior: "smooth" });
}
