const fs = require("fs");
const path = require("path");

async function generateExportHtml(deckData) {
    const deckJson = JSON.stringify(deckData, null, 2);
    const cssResponse = await fetch("https://microsnap-builder.netlify.app/js/preview-css.js");
    const scriptResponse = await fetch("https://microsnap-builder.netlify.app/js/preview-script.js");
    const previewCss = await cssResponse.text();
    const previewScript = await scriptResponse.text();
    const cssMatch = previewCss.match(/`([\s\S]*?)`/);
    const css = cssMatch ? cssMatch[1] : "";
    const scriptMatch = previewScript.match(/`([\s\S]*?)`/);
    const script = scriptMatch ? scriptMatch[1] : "";

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

exports.handler = async (event) => {
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "POST, OPTIONS"
            },
            body: ""
        };
    }

    try {
        const body = JSON.parse(event.body);
        const html = await generateExportHtml(body);

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "text/html",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "POST, OPTIONS"
            },
            body: html
        };

    } catch (err) {
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            body: "Error: " + err.message
        };
    }
};