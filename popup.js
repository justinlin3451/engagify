
document.getElementById('engagifyBtn').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'ENGAGIFY' });
  });
});

document.getElementById('summarizeBtn').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'SUMMARIZE' });
  });
});

document.getElementById('customizeBtn').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});
