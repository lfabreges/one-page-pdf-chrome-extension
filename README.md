# One Page PDF

A lightweight Google Chrome extension to export any webpage as a single, continuous PDF file with one click.

## Features

* **No Page Breaks:** Generates a PDF that matches the total height and width of the webpage.
* **Native Quality:** Uses the browser's native printing engine. Text remains selectable and links stay functional.
* **Privacy Focused:** Runs entirely locally. No data collection, no external server processing.
* **Simple:** One click on the icon triggers the download.

## Installation

### From Chrome Web Store
*(Add link here once published)*

### Manual Installation (Developer Mode)
1.  Clone this repository or download the source code.
2.  Open Chrome and navigate to `chrome://extensions/`.
3.  Enable **"Developer mode"** (toggle in the top right corner).
4.  Click **"Load unpacked"** and select the project folder.

## How it works

The extension uses the **Chrome DevTools Protocol (CDP)** via the `debugger` API to:
1.  Calculate the full scrollable dimensions of the page.
2.  Override the device metrics to fit the entire content.
3.  Invoke `Page.printToPDF` with custom page dimensions.
