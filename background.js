const BACKEND_URL = "http://localhost:3000";

async function callBackend(endpoint, prompt) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Backend error: ${errorText}`);
    }

    const data = await res.json();
    if (!data.ok) {
      throw new Error(data.error || 'Backend processing failed');
    }

    return data.output;
  } catch (err) {
    throw new Error(`Failed to connect to backend server. Make sure it's running on ${BACKEND_URL}. Error: ${err.message}`);
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    if (msg.type === 'OPENAI_SUMMARIZE') {
      try {
        const output = await callBackend('summarize', msg.prompt);
        sendResponse({ ok: true, output });
      } catch (e) {
        sendResponse({ ok: false, error: e.message });
      }
    } else if (msg.type === 'OPENAI_ENGAGIFY') {
      try {
        const output = await callBackend('engagify', msg.prompt);
        sendResponse({ ok: true, output });
      } catch (e) {
        sendResponse({ ok: false, error: e.message });
      }
    } else if (msg.type === 'OPENAI_CHAT') {
      try {
        const output = await callBackend('chat', msg.prompt);
        sendResponse({ ok: true, output });
      } catch (e) {
        sendResponse({ ok: false, error: e.message });
      }
    }
  })();
  return true; // async
});