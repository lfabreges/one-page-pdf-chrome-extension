chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.url || !tab.url.startsWith("http")) return;

  const target = { tabId: tab.id };

  try {
    await chrome.debugger.attach(target, "1.3");

    const rawTitle = tab.title || "Export";
    const safeFilename = rawTitle.replace(/[\/\\?%*:|"<>]/g, '_') + ".pdf";

    const { result } = await chrome.debugger.sendCommand(target, "Runtime.evaluate", {
      expression: `({
        w: document.documentElement.scrollWidth,
        h: document.documentElement.scrollHeight
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
      paperWidth: widthPx / 96,
      paperHeight: heightPx / 96,
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
    chrome.debugger.detach(target).catch(() => {}); 
  }
});