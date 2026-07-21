// Chrome / Edge / Brave Extension Service Worker
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'share-to-collector',
    title: '📌 Share link to Collector',
    contexts: ['page', 'link', 'selection'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'share-to-collector') {
    const targetUrl = info.linkUrl || info.pageUrl || tab?.url;
    const selectedText = info.selectionText || tab?.title || '';

    if (targetUrl) {
      fetch('http://localhost:3000/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          url: targetUrl,
          notes: selectedText,
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error('Server returned ' + res.status);
          return res.json();
        })
        .then((data) => {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            title: 'Saved to Collector!',
            message: `📌 ${data.item?.title || targetUrl}`,
          });
        })
        .catch((err) => {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            title: 'Collector Extension Error',
            message: `Make sure http://localhost:3000 is running (${err.message})`,
          });
        });
    }
  }
});
