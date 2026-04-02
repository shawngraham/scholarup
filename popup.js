// Update the UI count when popup opens
chrome.storage.local.get({ collectedData: [] }, (result) => {
  document.getElementById('status').innerText = `Collected: ${result.collectedData.length}`;
});

// SCRAPE & NEXT
document.getElementById('scrapeBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.tabs.sendMessage(tab.id, { action: "scrape" }, (response) => {
    if (!response) return;

    chrome.storage.local.get({ collectedData: [] }, (result) => {
      const newData = [...result.collectedData, ...response.data];
      
      chrome.storage.local.set({ collectedData: newData }, () => {
        document.getElementById('status').innerText = `Collected: ${newData.length}`;
        
        if (response.nextUrl) {
          chrome.tabs.update(tab.id, { url: response.nextUrl });
        } else {
          alert("No more pages found!");
        }
      });
    });
  });
});

// DOWNLOAD
document.getElementById('downloadBtn').addEventListener('click', () => {
  chrome.storage.local.get({ collectedData: [] }, (result) => {
    if (result.collectedData.length === 0) {
      alert("No data to download!");
      return;
    }
    const blob = new Blob([JSON.stringify(result.collectedData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    chrome.downloads.download({
      url: url,
      filename: `scholar_collection_${new Date().getTime()}.json`
    });
  });
});

// CLEAR
document.getElementById('clearBtn').addEventListener('click', () => {
  if (confirm("Clear all collected data?")) {
    chrome.storage.local.set({ collectedData: [] }, () => {
      document.getElementById('status').innerText = "Collected: 0";
    });
  }
});