/**
 * Project: MicroSnap Builder
 * Description: Simple server endpoint that accepts deck data, processes it, and returns generated HTML based on the preview renderer. 
 * Author: Dominique Thomas (github.com/dominique-thomas)
 * License: Shared publicly for demonstration purposes only. Reuse or redistribution not permitted without permission.
 */
const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();

app.use(cors()); 
app.use(express.json({ limit: "2mb" }));

function generateExportHtml(deckData) {

  const deckJson = JSON.stringify(deckData, null, 2);
  const previewCss = fs.readFileSync("js/preview-css.js", "utf-8");
  const previewScript = fs.readFileSync("js/preview-script.js", "utf-8");
  const css = previewCss.match(/`([\s\S]*?)`/)[1];
  const script = previewScript.match(/`([\s\S]*?)`/)[1];

  return `<!DOCTYPE html>
  <html lang="en">
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MicroSnap Deck</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css">
  <style>
  ${css}
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
  ${script}
  renderDeck(deckData, "export");
  </script>
  </body>
  </html>`;
}

app.post("/api/render", (req, res) => {
  const html = generateExportHtml(req.body);
  res.type("html").send(html);
});

app.listen(3000, () => {
  console.log("MicroSnap Builder API is live!");
});
