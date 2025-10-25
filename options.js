
const defaults = {
  tone: 'conversational',
  sumMode: 'sentences',
  sumCount: 5,
  engMaxChars: 20000
};

function load() {
  chrome.storage.local.get(defaults, (cfg) => {
    document.getElementById('tone').value = cfg.tone;
    document.getElementById('sumMode').value = cfg.sumMode;
    document.getElementById('sumCount').value = cfg.sumCount;
    document.getElementById('engMaxChars').value = cfg.engMaxChars;
  });
}

document.getElementById('saveBtn').addEventListener('click', () => {
  const cfg = {
    tone: document.getElementById('tone').value,
    sumMode: document.getElementById('sumMode').value,
    sumCount: Number(document.getElementById('sumCount').value) || defaults.sumCount,
    engMaxChars: Number(document.getElementById('engMaxChars').value) || defaults.engMaxChars
  };
  chrome.storage.local.set(cfg, () => {
    alert('Saved!');
  });
});

document.getElementById('resetBtn').addEventListener('click', () => {
  chrome.storage.local.set(defaults, load);
});

document.addEventListener('DOMContentLoaded', load);
