
document.getElementById('engagifyBtn').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'ENGAGIFY' }, (response) => {
      if (chrome.runtime.lastError) {
        console.log('Content script not ready, injecting...');
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ['content.js']
        }, () => {
          setTimeout(() => {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'ENGAGIFY' });
          }, 100);
        });
      }
    });
  });
});

document.getElementById('summarizeBtn').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'SUMMARIZE' }, (response) => {
      if (chrome.runtime.lastError) {
        console.log('Content script not ready, injecting...');
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ['content.js']
        }, () => {
          setTimeout(() => {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'SUMMARIZE' });
          }, 100);
        });
      }
    });
  });
});

document.getElementById('customizeBtn').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});
