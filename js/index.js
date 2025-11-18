/** 
 * Project: MicroSnap Builder
 * Description: Main application logic handling state, user interactions, JSON data parsing, live preview rendering, and export functions.
 * Author: Dominique Thomas (github.com/dominique-thomas)
 * License: Shared publicly for demonstration purposes only. Reuse or redistribution not permitted without permission.
 */
//----------------------------------
//  Global Variables
//----------------------------------
const maxSlides = 5;
const modalTriggers = document.querySelectorAll("[data-modal-target]");
const modals = document.querySelectorAll(".modal-overlay");
const closeButtons = document.querySelectorAll("[data-close]");
const continueBtn = document.getElementById("continueBtn");
const welcomeModal = document.getElementById("welcomeModal");
const warningMaxSlideModal = document.getElementById("warningMaxSlideModal");
const warningOneSlideModal = document.getElementById("warningOneSlideModal");
const navToggle = document.getElementById("navToggle");
const navMenu = document.querySelector(".nav");
const menuIcon = document.querySelector(".menu-icon");
const toggleTitle = document.getElementById("toggleTitle");
const toggleDesc = document.getElementById("toggleDesc");
const previewTitle = document.querySelector(".preview-card h4");
const previewDesc = document.querySelector(".preview-card p");
const modeToggle = document.getElementById("modeToggle");
const quickEditGrid = document.getElementById("quickEditGrid");
const advancedEditor = document.getElementById("advancedEditor");
const addSlideBtn = document.getElementById("addSlideBtn");
const previewBtn = document.getElementById("previewBtn");
const exportBtn = document.getElementById("exportBtn");
const deckPreviewFrame = document.getElementById("deckPreviewFrame");
const deckPreviewModal = document.getElementById("deckPreviewModal");
const deleteSlideBtn = document.getElementById("deleteSlideBtn");
const deleteSlideModal = document.getElementById("deleteSlideModal");
const confirmDelete = document.getElementById("confirmDelete");
const dropdownTrigger = document.querySelector(".dropdown-trigger");
const dropdownMenu = document.querySelector(".dropdown-menu");
const currentSlideLabel = document.getElementById("currentSlideLabel");
const slideDropdown = document.querySelector(".custom-dropdown");
const jsonEditor = document.getElementById("jsonEditor");
const jsonMsg = document.getElementById("jsonMsg");
const runCodeBtn = document.getElementById("runCodeBtn");
const lineNumbers = document.querySelector(".line-numbers");
const iframePreview = document.getElementById("cardPreviewFrame");
const slideTitle = document.getElementById("slideTitle");
const slideDescription = document.getElementById("slideDescription");
const layoutButtons = document.querySelectorAll(".layout-buttons button");
const bgColorInput = document.getElementById("bgColorInput");
const fontButtons = document.querySelectorAll(".font-size-btn");
const bgImageInput = document.getElementById("bgImageInput");
const placementGrid = document.querySelectorAll(".placement-grid button");
const animButtons = document.querySelectorAll(".anim-buttons button");
const autoplayToggle = document.getElementById("autoplayToggle");
const loopToggle = document.getElementById("loopToggle");
const builder = document.getElementById("builder");
const advancedTxt = "Advanced";
const quickEditTxt = "Quick Edit";
const defaultSlide = () => ({
  title: "Example Title",
  description: "This is how your slide will appear.",
  layout: "layout-overlay",
  position: "center",
  fontSize: "medium",
  background: "#0a9c97",
  image: "",
  animation: "none",
});
const defaultDeck = {
  slides: [defaultSlide()],
  autoplay: false,
  loop: false,
};
let allSlidesData = JSON.parse(JSON.stringify(defaultDeck));
let currentSlideIndex = 0;
let imgTimer;


//----------------------------------
//  Navbar and Dropdown Menu Functions
//----------------------------------
// Helper to close the navbar menu/dropdown menu if clicking outside the respective menu
document.addEventListener("mousedown", (e) => {
  const clickedInsideNav = e.target.closest(".nav");
  const clickedMenuIcon = e.target.closest(".menu-icon");
  const clickedInsideDropdown = e.target.closest(".custom-dropdown");

  if (navToggle.checked && !clickedInsideNav && !clickedMenuIcon) {
    navToggle.checked = false;
  }

  if (dropdownMenu && !clickedInsideDropdown) {
    dropdownMenu.classList.add("hidden");
  }
});

// Close the navbar when clicking any link or button inside navbar OR dropdown menu
navMenu.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON" || e.target.tagName === "A") {
    navToggle.checked = false;
  }
});

// Toggle the visibility of the slide dropdown menu
dropdownTrigger.addEventListener("click", () => {
  dropdownMenu.classList.toggle("hidden");
});

// Handles slide switching logic
dropdownMenu.addEventListener("click", (e) => {
  if (e.target.tagName === "LI") {
    const selected = e.target.getAttribute("data-slide");
    currentSlideLabel.textContent = `Slide ${selected}`;
    dropdownMenu.classList.add("hidden");

    const newIndex = parseInt(selected, 10) - 1;
    if (newIndex >= 0 && newIndex < allSlidesData.slides.length) {
      currentSlideIndex = newIndex;
      updateSlideCounter();

      loadSlideToEditor(allSlidesData.slides[currentSlideIndex]);

      animateBuilder();

      // Update the live card preview
      sendToCardPreview(allSlidesData.slides[currentSlideIndex]);
    }
  }
});

// Handles updating the slide dropdown menu on the Actions bar
function updateSlideDropdown() {
  const dropdownMenu = document.querySelector(".dropdown-menu");
  const currentSlideLabel = document.getElementById("currentSlideLabel");

  dropdownMenu.innerHTML = "";

  allSlidesData.slides.forEach((slide, i) => {
    const li = document.createElement("li");
    li.dataset.slide = i + 1;
    li.title = `Slide ${i + 1}`;
    li.role = "option";
    li.textContent = `Slide ${i + 1}`;
    dropdownMenu.appendChild(li);
  });

  currentSlideLabel.textContent = `Slide ${currentSlideIndex + 1}`;
}


//----------------------------------
//  Modal Window Functions
//----------------------------------
// Helper that is used to open modal windows
modalTriggers.forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.getAttribute("data-modal-target");
    const targetModal = document.getElementById(targetId);

    if (targetModal) {
      targetModal.classList.remove("hidden");
      document.body.classList.add("modal-open");
    }
  });
});

// Helper that is used to close modal windows and unfreeze the background
function closeAllModals() {
  modals.forEach((modal) => modal.classList.add("hidden"));
  document.body.classList.remove("modal-open");
}

// Helpers that dynamically closes the modals (close button, escape key, etc.)
closeButtons.forEach((btn) => {
  btn.addEventListener("click", closeAllModals);
});

modals.forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeAllModals();
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeAllModals();
});

// Handles the Welcome modal
if (continueBtn && welcomeModal) {
  let previewLoaded = true;
  iframePreview.addEventListener("load", () => {
    previewLoaded = true;
  });

  document.body.classList.add("modal-open");

  continueBtn.addEventListener("click", () => {
    closeAllModals();
  });
}


//----------------------------------
//  Mode Toggle & Action Buttons
//----------------------------------
// Switches the editor mode (Quick Edit/Advanced)
modeToggle.addEventListener("change", () => {
  const isAdvanced = modeToggle.checked;
  const modeLabel = document.querySelector(".mode-label");

  hidejsonMsgMsg();
  modeToggle.disabled = true;

  if (isAdvanced) {
    quickEditGrid.classList.remove("active");
    modeLabel.textContent = `Mode: ${advancedTxt}`;
    disableFeatures(true);

    setTimeout(() => {
      updateAdvancedEditor();
      quickEditGrid.classList.add("hidden");
      advancedEditor.classList.remove("hidden");
      requestAnimationFrame(() => advancedEditor.classList.add("active"));
    }, 250);

  } else {
    advancedEditor.classList.remove("active");
    modeLabel.textContent = `Mode: ${quickEditTxt}`;
    disableFeatures(false);

    setTimeout(() => {
      updateAdvancedEditor();
      advancedEditor.classList.add("hidden");
      quickEditGrid.classList.remove("hidden");
      requestAnimationFrame(() => quickEditGrid.classList.add("active"));
    }, 250);
  }

  setTimeout(() => {
    modeToggle.disabled = false;
  }, 400);
});

// Helper method that enables/disables the actions buttons/slide dropdown menu, depending on the selected mode
function disableFeatures(bool) {
  if (bool) {
    slideDropdown.classList.add("disabled");
    addSlideBtn.classList.add("disabled");
    deleteSlideBtn.classList.add("disabled");

  } else {
    slideDropdown.classList.remove("disabled");
    addSlideBtn.classList.remove("disabled");
    deleteSlideBtn.classList.remove("disabled");
  }
}

// Shows the Deck Preview modal window
previewBtn.addEventListener("click", () => {
  deckPreviewModal.classList.remove("hidden");
  document.body.classList.add("modal-open");

  const message = {
    type: "updateDeck",
    data: {
      slides: allSlidesData.slides,
      autoplay: allSlidesData.autoplay,
      loop: allSlidesData.loop
    },
    previewMode: "deck"
  };

  deckPreviewFrame.onload = () => {
    deckPreviewFrame.contentWindow.postMessage(message, "*");
  }

  deckPreviewFrame.src = deckPreviewFrame.src;
});

// Displays the preview of the current slide; sends JSON data to the iframe
function sendToCardPreview(slide) {
  const iframe = document.getElementById("cardPreviewFrame");
  if (!iframe || !iframe.contentWindow) return;

  const message = {
    type: "updateDeck",
    data: { slides: [slide], autoplay: allSlidesData.autoplay, loop: allSlidesData.loop },
    previewMode: "card",
  };

  iframe.onload = () => {
    iframe.contentWindow.postMessage(message, "*");
  };
  iframe.src = iframe.src;
}

// Handles adding a new slide
addSlideBtn.addEventListener("click", () => {

  if (allSlidesData.slides.length >= maxSlides) {
    warningMaxSlideModal.classList.remove("hidden");
    return;
  }

  updateAdvancedEditor();
  resetEditorButtons();
  allSlidesData.slides.push(defaultSlide());
  currentSlideIndex = allSlidesData.slides.length - 1;

  animateBuilder();
  updateSlideDropdown();
  updateSlideCounter();

  loadSlideToEditor(allSlidesData.slides[currentSlideIndex]);
  sendToCardPreview(allSlidesData.slides[currentSlideIndex]);
});

// Shows a popup to confirm that we want to delete the modal
deleteSlideBtn.addEventListener("click", () => {
  deleteSlideModal.classList.remove("hidden");
});

// Handles slide deletion
confirmDelete.addEventListener("click", () => {
  deleteSlideModal.classList.add("hidden");

  if (allSlidesData.slides.length <= 1) {
    warningOneSlideModal.classList.remove("hidden");
    return;
  }

  allSlidesData.slides.splice(currentSlideIndex, 1);
  currentSlideIndex = Math.max(0, currentSlideIndex - 1);

  updateAdvancedEditor();

  loadSlideToEditor(allSlidesData.slides[currentSlideIndex]);
  sendToCardPreview(allSlidesData.slides[currentSlideIndex]);

  updateSlideDropdown();
  updateSlideCounter();
});

exportBtn.addEventListener("click", async () => {

  const htmlContent = generateExportHtml(allSlidesData);
  const blob = new Blob([htmlContent], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "microsnap_deck.html";
  link.click();

  URL.revokeObjectURL(url);
});


//----------------------------------
//  Mode Editor Functionality (Quick Edit)
//----------------------------------
// Detects user input for the Slide Title field
slideTitle.addEventListener("input", () => {
  allSlidesData.slides[currentSlideIndex].title = slideTitle.value;
  updateAdvancedEditor();
  sendToCardPreview(allSlidesData.slides[currentSlideIndex]);
});

// Detects user input for the Slide Description field
slideDescription.addEventListener("input", () => {
  allSlidesData.slides[currentSlideIndex].description = slideDescription.value;
  updateAdvancedEditor();
  sendToCardPreview(allSlidesData.slides[currentSlideIndex]);
});

// Detects user input for the Layout & Position buttons
layoutButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    layoutButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const layoutValue = btn.dataset.layout;
    const slide = allSlidesData.slides[currentSlideIndex];
    slide.layout = `layout-${layoutValue}`;
    updateAdvancedEditor();
    sendToCardPreview(slide);
  });
});

// Detects user input for the Overlay Color picker
bgColorInput.addEventListener("input", () => {
  const slide = allSlidesData.slides[currentSlideIndex];
  slide.background = bgColorInput.value;
  updateAdvancedEditor();
  sendToCardPreview(slide);
});

// Detects user input for the Font Size buttons
fontButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    fontButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const slide = allSlidesData.slides[currentSlideIndex];
    slide.fontSize = btn.dataset.font;
    updateAdvancedEditor();
    sendToCardPreview(slide);
  });
});

// Detects user input for the Background Image field
bgImageInput.addEventListener("input", () => {
  clearTimeout(imgTimer);
  imgTimer = setTimeout(() => {
    const slide = allSlidesData.slides[currentSlideIndex];
    const url = bgImageInput.value.trim();

    // Accepts websites and local images in the 'example' folder
    if (url.startsWith("http") || url.startsWith("example")) {
      slide.image = url;
      sendToCardPreview(slide);
    } else if (url === "") {
      slide.image = "";
      sendToCardPreview(slide);
    }

    updateAdvancedEditor();
  }, 400);

});

// Detects user input for the Entry Animation buttons
animButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    animButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const slide = allSlidesData.slides[currentSlideIndex];
    slide.animation = btn.dataset.anim;

    updateAdvancedEditor();
    sendToCardPreview(slide);
  });
});

// Detects user input for the Content Alignment buttons
placementGrid.forEach((btn) => {
  btn.addEventListener("click", () => {
    placementGrid.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const alignValue = btn.dataset.align;
    const slide = allSlidesData.slides[currentSlideIndex];
    slide.position = alignValue;

    updateAdvancedEditor();
    sendToCardPreview(slide);
  });
});

// Detects user input for the Autoplay Toggle button
autoplayToggle.addEventListener("change", () => {
  allSlidesData.autoplay = autoplayToggle.checked;
  updateAdvancedEditor();
});

// Detects user input for the Loop Toggle button
loopToggle.addEventListener("change", () => {
  allSlidesData.loop = loopToggle.checked;
  updateAdvancedEditor();
});


//----------------------------------
//  Mode Editor Functionality (Advanced)
//----------------------------------
// Hides the JSON warning message when we edit the code
if (jsonEditor && jsonMsg) {
  jsonEditor.addEventListener("input", () => {
    hidejsonMsgMsg();
  });
}

// Helper function that hdies the JSON warning messge
function hidejsonMsgMsg() {
  jsonMsg.classList.add("hide");
}

// Update the line numbers dynamically 
const updateLineNumbers = () => {
  const lines = jsonEditor.value.split("\n").length;
  lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join("<br>");
};

// Event listeners to update line numbers on input/scroll 
jsonEditor.addEventListener("input", updateLineNumbers);
let scrollTimeout;
jsonEditor.addEventListener("scroll", () => {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    lineNumbers.scrollTop = jsonEditor.scrollTop;
  }, 5);
});

updateLineNumbers(); // Initialize line numbers

// Run the input code
runCodeBtn.addEventListener("click", () => {
  hidejsonMsgMsg();

  try {
    const parsed = JSON.parse(jsonEditor.value.trim());

    if (!parsed.slides || !Array.isArray(parsed.slides)) {
      showjsonMsgMsg("Missing or invalid 'slides' array.");
      jsonMsg.classList.add("warn");
      jsonMsg.classList.remove("success");
      return;
    }

    allSlidesData = parsed;

    updateSlideDropdown();
    updateSlideCounter();

    loadSlideToEditor(allSlidesData.slides[currentSlideIndex]);
    sendToCardPreview(allSlidesData.slides[currentSlideIndex]);

    showjsonMsgMsg("Slide deck successfully updated!");

    jsonMsg.classList.add("success");
    jsonMsg.classList.remove("warn");

  } catch (error) {
    jsonMsg.classList.add("warn");
    jsonMsg.classList.remove("success");
    showjsonMsgMsg("Your code is not formatted correctly.");
  }
});

//----------------------------------
//  Misc
//----------------------------------
// Helper function to add slide data from the data array
function addSlide(slideData) {
  allSlidesData.slides.push(slideData);
}

// Helper function to delete slide data the data array
function deleteSlide(index) {
  allSlidesData.slides.splice(index, 1);
}

// Helper function to update the data array passed to the full slide deck
function updateSlide(index, updatedData) {
  allSlidesData.slides[index] = { ...allSlidesData.slides[index], ...updatedData };
}

// Helper function that updates the slide counter; called when a new slide is created in either mode
function updateSlideCounter() {
  const currentSlideLabel = document.getElementById("currentSlideLabel");
  if (!currentSlideLabel) return;

  const total = allSlidesData.slides.length;
  currentSlideLabel.textContent = `Slide ${currentSlideIndex + 1}`;
}

// Helper function that updates the content of the advanced editor; called when a change is made in Quick Edit mode
function updateAdvancedEditor() {

  if (!jsonEditor) return;
  try {
    const formatted = JSON.stringify(allSlidesData, null, 2);
    jsonEditor.value = formatted;
  } catch (err) {
    console.warn("Could not update advanced editor:", err);
  }
}

// Helper function that updates the Quick Edit mode buttons/fields
function loadSlideToEditor(slide) {

  slideTitle.value = slide.title || "";
  slideDescription.value = slide.description || "";

  placementGrid.forEach((btn) => {
    const isActive = `${btn.dataset.align}` === slide.position;
    btn.classList.toggle("active", isActive);
  });

  layoutButtons.forEach((btn) => {
    const isActive = `layout-${btn.dataset.layout}` === slide.layout;
    btn.classList.toggle("active", isActive);
  });

  const defaultHexVal = "#0a9c97";

  if (slide.background) {
    let expanded = expandHex(slide.background);
    if (expanded) {
      bgColorInput.value = expanded;
    } else {
      bgColorInput.value = defaultHexVal;
    }
  } else {
    bgColorInput.value = defaultHexVal;
  }

  const fontSize = slide.fontSize || "medium";
  fontButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.font === fontSize);
  });

  if (autoplayToggle.checked !== allSlidesData.autoplay) {
    autoplayToggle.click();
  }

  if (loopToggle.checked !== allSlidesData.loop) {
    loopToggle.click();
  }

  animButtons.forEach((btn) => {
    const isActive = `${btn.dataset.anim}` === slide.animation;
    btn.classList.toggle("active", isActive);
  });

  bgImageInput.value = slide.image || "";
}

// Helper function that "expands" a shortened hex value
function expandHex(hex) {
  hex = hex.trim().toLowerCase();

  if (/^#[0-9a-f]{6}$/.test(hex)) return hex;
  if (/^#[0-9a-f]{3}$/.test(hex)) {
    return "#" + hex[1] + hex[1] +
      hex[2] + hex[2] +
      hex[3] + hex[3];
  }
  return null;
}

// Helper function that updates the JSON message seen in Advanced Mode when user runs the Run Code button
function showjsonMsgMsg(msg = "Your code is not formatted correctly.") {
  jsonMsg.textContent = msg;
  jsonMsg.classList.remove("hide");
  advancedEditor.focus();
}

// Helper function that hides the JSON message seen in Advanced Mode when user runs the Run Code button 
function hidejsonMsgMsg() {
  jsonMsg.classList.add("hide");
}

// Helper function that shows a quick fade animation when a new slide is added 
function animateBuilder() {
  builder.classList.add("fade");
  setTimeout(() => builder.classList.remove("fade"), 150);
}

// Helper function that resets the default buttons in the Quick Edit Mode
function resetEditorButtons() {
  document.querySelectorAll("#placementGrid .icon-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.align === "center");
  });

  document.querySelectorAll(".layout-buttons button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.layout === "overlay");
  });

  document.querySelectorAll("#entryAnimBtns .icon-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.anim === "no_fade-in");
  });
}

// Helper function that is used to help generate the HTML content
function generateExportHtml() {
  const deckJson = JSON.stringify(allSlidesData, null, 2);
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MicroSnap Deck</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css">
  <style>
  ${window.previewCss}
  </style>
  </head>
  <body>
  <div class="deck-container">
    <div class="progress-bar" id="progressBar"></div>
    <div class="slides" id="slides"></div>
    <div class="nav-arrows">
      <button id="prevSlide"><i class="fa-solid fa-chevron-left"></i></button>
      <button id="nextSlide"><i class="fa-solid fa-chevron-right"></i></button>
    </div>
    <div class="slide-counter">
      <a href="https://microsnap-builder.netlify.app/" target="_blank" title="Made with MicroSnap Builder"><i class="fa-solid fa-bolt"></i></a><span id="slideCounter"></span>
    </div>
  </div>
  <script>
  const deckData = ${deckJson};
  ${window.previewScript}
  renderDeck(deckData, "export");
  </script>
  </body>
  </html>`;
}

//----------------------------------
//  Init
//----------------------------------
sendToCardPreview(allSlidesData.slides[0]);
loadSlideToEditor(allSlidesData.slides[0]);
resetEditorButtons();