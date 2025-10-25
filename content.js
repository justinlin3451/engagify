
function collectPageText(maxChars = 20000) {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      if (!node.nodeValue) return NodeFilter.FILTER_REJECT;
      const str = node.nodeValue.trim();
      if (!str) return NodeFilter.FILTER_REJECT;
      if (!node.parentElement) return NodeFilter.FILTER_REJECT;
      const style = window.getComputedStyle(node.parentElement);
      if (style && (style.visibility === 'hidden' || style.display === 'none')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  let text = "";
  let linkCount = 0;
  let imageCount = 0;

  // Collect text content
  while (walker.nextNode() && text.length < maxChars) {
    const chunk = walker.currentNode.nodeValue.replace(/\s+/g, ' ');
    if (chunk) text += chunk + "\n";
  }

  // Collect links
  const links = document.querySelectorAll('a[href]');
  for (const link of links) {
    if (linkCount >= 10) break; // Limit to 10 links
    const href = link.href;
    const linkText = link.textContent.trim();
    if (href && linkText && !text.includes(href)) {
      text += `\n[LINK: ${linkText} -> ${href}]`;
      linkCount++;
    }
  }

  // Collect images (increase limit and prioritize content images)
  const images = document.querySelectorAll('img[src]');
  const contentImages = [];
  const authorImages = [];

  for (const img of images) {
    const src = img.src;
    const alt = img.alt || 'Image';
    const parentText = img.parentElement?.textContent?.toLowerCase() || '';

    // Separate content images from author/profile images
    if (parentText.includes('author') || parentText.includes('profile') || parentText.includes('avatar') ||
      alt.includes('author') || alt.includes('profile') || alt.includes('avatar')) {
      authorImages.push({ src, alt });
    } else {
      contentImages.push({ src, alt });
    }
  }

  // Prioritize content images, limit author images
  const allImages = [...contentImages, ...authorImages.slice(0, 2)];
  for (const img of allImages) {
    if (imageCount >= 10) break; // Increased limit
    if (img.src && !text.includes(img.src)) {
      text += `\n[IMAGE: ${img.alt} -> ${img.src}]`;
      imageCount++;
    }
  }

  return text.slice(0, maxChars);
}

function showLoadingScreen(message = 'Processing...') {
  let el = document.getElementById('engagify-loading');
  if (el) return el;

  el = document.createElement('div');
  el.id = 'engagify-loading';
  el.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 2147483648;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  const spinner = document.createElement('div');
  spinner.style.cssText = `
    width: 50px;
    height: 50px;
    border: 4px solid #f3f4f6;
    border-top: 4px solid #2563eb;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
  `;

  const text = document.createElement('div');
  text.textContent = message;
  text.style.cssText = `
    color: white;
    font-size: 18px;
    font-weight: 600;
    text-align: center;
  `;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  el.appendChild(style);
  el.appendChild(spinner);
  el.appendChild(text);
  document.body.appendChild(el);

  return el;
}

function hideLoadingScreen() {
  const el = document.getElementById('engagify-loading');
  if (el) el.remove();
}

function ensureSidebar() {
  let el = document.getElementById('engagify-sidebar');
  if (el) return el;
  el = document.createElement('div');
  el.id = 'engagify-sidebar';
  el.style.cssText = `position:fixed; top:0; right:0; height:100vh; width:360px; background:#ffffff; border-left:1px solid #e2e8f0; box-shadow:-6px 0 14px rgba(0,0,0,.06); z-index:2147483647; padding:14px 16px; overflow:auto; font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;`;
  const hdr = document.createElement('div');
  hdr.style.cssText = "display:flex;align-items:center;justify-content:space-between;margin-bottom:8px";
  hdr.innerHTML = `<div style="font-weight:800;color:#0f172a">Summary</div>`;
  const close = document.createElement('button');
  close.textContent = 'Close';
  close.style.cssText = "background:#156f3b;color:#fff;border:none;padding:6px 10px;border-radius:8px;cursor:pointer";
  close.onclick = () => el.remove();
  hdr.appendChild(close);
  el.appendChild(hdr);

  const content = document.createElement('div');
  content.id = 'engagify-sidebar-content';
  content.style.cssText = "font-size:14px;line-height:1.55;color:#0f172a";
  el.appendChild(content);

  document.body.appendChild(el);
  return el;
}

function ensureOverlay() {
  let el = document.getElementById('engagify-overlay');
  if (el) return el;
  el = document.createElement('div');
  el.id = 'engagify-overlay';
  el.style.cssText = `position:fixed; inset:0; background:rgba(0,0,0,.06); z-index:2147483646; display:flex;align-items:center;justify-content:center;padding:30px;`;
  const card = document.createElement('div');
  card.style.cssText = `width:min(900px, 92vw); height:min(80vh, 800px); background:#fff; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 12px 40px rgba(0,0,0,.12);`;
  const head = document.createElement('div');
  head.style.cssText = "padding:12px 14px;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between";
  head.innerHTML = `<div style="font-weight:800;color:#0f172a">Engagified View</div>`;
  const actions = document.createElement('div');
  const close = document.createElement('button');
  close.textContent = "Close";
  close.style.cssText = "background:#156f3b;color:#fff;border:none;padding:6px 10px;border-radius:8px;cursor:pointer";
  close.onclick = () => el.remove();
  actions.appendChild(close);
  head.appendChild(actions);
  card.appendChild(head);

  const scroller = document.createElement('div');
  scroller.id = 'engagify-overlay-content';
  scroller.style.cssText = "padding:16px;overflow:auto;font-size:16px;line-height:1.7;color:#0f172a";
  card.appendChild(scroller);

  el.appendChild(card);
  document.body.appendChild(el);
  return el;
}

chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.action === 'SUMMARIZE') {
    chrome.storage.local.get({ sumMode: 'sentences', sumCount: 5, engMaxChars: 20000, tone: 'friendly' }, async (cfg) => {
      const text = collectPageText(cfg.engMaxChars);
      if (!text || text.length < 60) { alert('Not enough readable text found on this page.'); return; }

      // Show loading screen
      showLoadingScreen('Summarizing content...');

      const instruction = cfg.sumMode === 'bullets'
        ? `Summarize into ${cfg.sumCount} bullet points.`
        : `Summarize in ${cfg.sumCount} concise sentences.`;
      const prompt = 'You are summarizing a webpage. ' + instruction + '\nKeep facts accurate and neutral. Text START<<' + text + '>>Text END';

      chrome.runtime.sendMessage({ type: 'OPENAI_SUMMARIZE', prompt }, (res) => {
        hideLoadingScreen();
        const el = ensureSidebar();
        const box = document.getElementById('engagify-sidebar-content');
        if (!res || !res.ok) { box.innerHTML = `<div style="color:#b91c1c">Error: ${res?.error || 'Unknown error'}</div>`; return; }
        const out = (res.output || '').trim();
        if (out.startsWith('- ') || out.includes('\n- ')) {
          const items = out.split('\n').filter(Boolean);
          const ul = document.createElement('ul');
          ul.style.marginLeft = '18px';
          items.forEach(line => {
            const li = document.createElement('li');
            li.textContent = line.replace(/^-+\s*/, '');
            ul.appendChild(li);
          });
          box.replaceChildren(ul);
        } else {
          box.textContent = out;
        }
      });
    });
  }

  if (msg.action === 'ENGAGIFY') {
    chrome.storage.local.get({ engMaxChars: 20000, tone: 'friendly' }, async (cfg) => {
      const text = collectPageText(cfg.engMaxChars);
      if (!text || text.length < 60) { alert('Not enough readable text found on this page.'); return; }

      // Show loading screen
      showLoadingScreen('Engagifying content...');

      const prompt = 'Rewrite the following webpage content in an engaging, ' + cfg.tone + ' tone while preserving accuracy. Make it visually appealing with proper formatting: use bold text for key points, different font sizes for headings, and colors to highlight important information. Keep the original information but make it easier to read and more engaging. Use HTML tags like <h1>, <h2>, <h3>, <strong>, <em>, <span style="color: #...">, <span style="font-size: ...">, etc. Avoid emojis. Text START<<' + text + '>>Text END';

      chrome.runtime.sendMessage({ type: 'OPENAI_ENGAGIFY', prompt }, (res) => {
        hideLoadingScreen();
        if (!res || !res.ok) {
          alert('Error: ' + (res?.error || 'Unknown error'));
          return;
        }

        // Apply changes directly to the page content and clean up CSS/HTML code
        let safe = (res.output || '');

        // Remove any CSS code blocks or style tags
        safe = safe.replace(/```html[\s\S]*?```/g, '');
        safe = safe.replace(/```css[\s\S]*?```/g, '');
        safe = safe.replace(/<style[\s\S]*?<\/style>/gi, '');
        safe = safe.replace(/```[\s\S]*?```/g, '');

        // Fix markdown formatting - convert **bold** to <strong> tags
        safe = safe.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        safe = safe.replace(/\*([^*]+)\*/g, '<em>$1</em>');

        // Clean up HTML tags but preserve allowed ones
        safe = safe.replace(/<(?!\/?(h[1-6]|p|ul|li|strong|em|b|i|span|div|br|a|img)\b)[^>]*>/gi, '');
        safe = safe.replace(/on\w+="[^"]*"/g, '');

        // Convert link and image markers back to proper HTML
        safe = safe.replace(/\[LINK: ([^\]]+) -> ([^\]]+)\]/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
        safe = safe.replace(/\[IMAGE: ([^\]]+) -> ([^\]]+)\]/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; margin: 10px 0;">');

        // Find the main content area and replace it
        const mainContent = document.querySelector('main, article, .content, .post, .entry, #content, .main-content') || document.body;

        // Detect page theme colors
        const bodyStyles = window.getComputedStyle(document.body);
        const backgroundColor = bodyStyles.backgroundColor;
        const textColor = bodyStyles.color;
        const isDarkTheme = backgroundColor.includes('rgb(0, 0, 0)') || backgroundColor.includes('rgb(17, 17, 17)') || backgroundColor.includes('rgb(24, 24, 27)');
        const isBlandTheme = textColor.includes('rgb(0, 0, 0)') && backgroundColor.includes('rgb(255, 255, 255)');

        // Choose color scheme based on page theme
        let themeColors = {
          primary: '#2563eb',
          secondary: '#dc2626',
          accent: '#059669',
          background: '#ffffff',
          text: '#1f2937'
        };

        if (isDarkTheme) {
          themeColors = {
            primary: '#60a5fa',
            secondary: '#f87171',
            accent: '#34d399',
            background: '#1f2937',
            text: '#f9fafb'
          };
        } else if (isBlandTheme) {
          themeColors = {
            primary: '#059669',
            secondary: '#dc2626',
            accent: '#2563eb',
            background: '#f0fdf4',
            text: '#1f2937'
          };
        }

        // Create a new container for the engagified content with enhanced styling
        const engagifiedDiv = document.createElement('div');
        engagifiedDiv.id = 'engagified-content';
        engagifiedDiv.style.cssText = `
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.7;
          color: ${themeColors.text};
          max-width: 900px;
          margin: 0 auto;
          padding: 30px;
          background: ${themeColors.background};
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin-top: 80px;
          position: relative;
          z-index: 1;
        `;

        // Add enhanced CSS for better typography with dynamic colors
        const style = document.createElement('style');
        style.textContent = `
          #engagified-content h1 {
            font-size: 2.5rem;
            font-weight: 800;
            color: ${themeColors.primary};
            margin: 2rem 0 1rem 0;
            line-height: 1.2;
          }
          #engagified-content h2 {
            font-size: 2rem;
            font-weight: 700;
            color: ${themeColors.primary};
            margin: 1.5rem 0 0.75rem 0;
            line-height: 1.3;
          }
          #engagified-content h3 {
            font-size: 1.5rem;
            font-weight: 600;
            color: ${themeColors.primary};
            margin: 1.25rem 0 0.5rem 0;
            line-height: 1.4;
          }
          #engagified-content p {
            font-size: 1.1rem;
            margin: 1rem 0;
            color: ${themeColors.text};
          }
          #engagified-content strong {
            font-weight: 700;
            color: ${themeColors.secondary};
          }
          #engagified-content em {
            font-style: italic;
            color: ${themeColors.accent};
            font-weight: 600;
          }
          #engagified-content ul, #engagified-content ol {
            margin: 1rem 0;
            padding-left: 2rem;
          }
          #engagified-content li {
            font-size: 1.1rem;
            margin: 0.5rem 0;
            color: ${themeColors.text};
          }
          #engagified-content a {
            color: ${themeColors.primary};
            text-decoration: underline;
            font-weight: 600;
          }
          #engagified-content a:hover {
            color: ${themeColors.primary};
            text-decoration: none;
            opacity: 0.8;
          }
          #engagified-content img {
            max-width: 100%;
            height: auto;
            margin: 15px 0;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
        `;
        document.head.appendChild(style);
        engagifiedDiv.innerHTML = safe;

        // Hide original content and show engagified version
        const originalContent = mainContent.cloneNode(true);
        originalContent.style.display = 'none';
        originalContent.id = 'original-content';

        // Insert the engagified content
        mainContent.parentNode.insertBefore(engagifiedDiv, mainContent);
        mainContent.parentNode.insertBefore(originalContent, mainContent);
        mainContent.style.display = 'none';

        // Add a restore button
        const restoreBtn = document.createElement('button');
        restoreBtn.textContent = 'Restore Original';
        restoreBtn.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #156f3b;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 8px;
          cursor: pointer;
          z-index: 9999;
          font-weight: bold;
        `;
        restoreBtn.onclick = () => {
          engagifiedDiv.remove();
          originalContent.remove();
          mainContent.style.display = '';
          restoreBtn.remove();
        };
        document.body.appendChild(restoreBtn);
      });
    });
  }
});
