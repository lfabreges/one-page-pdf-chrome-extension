const CSS_PIXELS_PER_INCH = 96;
const exportingTabs = new Set();

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.url || !tab.url.startsWith("http")) return;
  if (exportingTabs.has(tab.id)) return;
  exportingTabs.add(tab.id);

  const target = { tabId: tab.id };
  let attached = false;

  try {
    await chrome.debugger.attach(target, "1.3");
    attached = true;

    const rawTitle = tab.title || "Export";
    const safeFilename = rawTitle.replace(/[\/\\?%*:|"<>]/g, '_') + ".pdf";

    const { result } = await chrome.debugger.sendCommand(target, "Runtime.evaluate", {
      expression: `({
        w: Math.max(
          document.documentElement.scrollWidth,
          document.documentElement.offsetWidth,
          document.body ? document.body.scrollWidth : 0,
          document.body ? document.body.offsetWidth : 0
        ),
        h: Math.max(
          document.documentElement.scrollHeight,
          document.documentElement.offsetHeight,
          document.body ? document.body.scrollHeight : 0,
          document.body ? document.body.offsetHeight : 0
        )
      })`,
      returnByValue: true
    });

    const widthPx = result.value.w;
    const heightPx = result.value.h;

    await chrome.debugger.sendCommand(target, "Emulation.setDeviceMetricsOverride", {
      width: widthPx,
      height: heightPx,
      deviceScaleFactor: 1,
      mobile: false
    });

    const pdf = await chrome.debugger.sendCommand(target, "Page.printToPDF", {
      printBackground: true,
      paperWidth: widthPx / CSS_PIXELS_PER_INCH,
      paperHeight: heightPx / CSS_PIXELS_PER_INCH,
      marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0,
      pageRanges: "1"
    });

    await chrome.downloads.download({
      url: `data:application/pdf;base64,${pdf.data}`,
      filename: safeFilename,
      saveAs: false
    });

  } catch (err) {
    console.error("Error during PDF export:", err);
  } finally {
    if (attached) {
      await chrome.debugger.sendCommand(target, "Emulation.clearDeviceMetricsOverride").catch(() => {});
      chrome.debugger.detach(target).catch(() => {});
    }
    exportingTabs.delete(tab.id);
  }
});
