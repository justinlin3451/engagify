
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

  // Collect ALL images, tables, and graphs from the entire page
  const images = document.querySelectorAll('img[src], svg, canvas');
  const tables = document.querySelectorAll('table');
  const charts = document.querySelectorAll('[class*="chart"], [class*="graph"], [id*="chart"], [id*="graph"]');

  // Collect all images (no limit, include all)
  for (const img of images) {
    const src = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src');
    const alt = img.alt || img.getAttribute('title') || 'Image';
    if (src && !text.includes(src)) {
      text += `\n[IMAGE: ${alt} -> ${src}]`;
      imageCount++;
    }
  }

  // Collect all tables
  for (const table of tables) {
    const tableText = table.textContent.trim();
    if (tableText && tableText.length > 10) {
      text += `\n[TABLE: ${tableText}]`;
    }
  }

  // Collect all charts/graphs
  for (const chart of charts) {
    const chartText = chart.textContent.trim();
    const chartSrc = chart.querySelector('img')?.src || chart.getAttribute('data-src');
    if (chartText && chartText.length > 5) {
      text += `\n[CHART: ${chartText}]`;
    }
    if (chartSrc && !text.includes(chartSrc)) {
      text += `\n[CHART_IMAGE: ${chartText} -> ${chartSrc}]`;
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

      // Create tone-specific prompts
      let tonePrompt = '';
      if (cfg.tone === 'concise') {
        tonePrompt = 'Rewrite the following webpage content in a CONCISE, direct tone. Be brief and to the point. Use short sentences and bullet points. Focus on key facts and essential information only.';
      } else if (cfg.tone === 'conversational') {
        tonePrompt = 'Rewrite the following webpage content in a CONVERSATIONAL, friendly tone. Use "you" and "we" language. Make it feel like a conversation with the reader. Be engaging and approachable.';
      } else if (cfg.tone === 'academic') {
        tonePrompt = 'Rewrite the following webpage content in an ACADEMIC, formal tone. Use precise language and technical terms. Structure information logically with clear arguments and evidence.';
      }

      const prompt = tonePrompt + ' Make it visually appealing with proper formatting: use bold text for key points, different font sizes for headings, and colors to highlight important information. Keep the original information but make it easier to read and more engaging. Use HTML tags like <h1>, <h2>, <h3>, <strong>, <em>, <span style="color: #...">, <span style="font-size: ...">, etc. Avoid emojis. Include ALL images from the original content. Text START<<' + text + '>>Text END';

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
        safe = safe.replace(/\[IMAGE: ([^\]]+) -> ([^\]]+)\]/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">');
        safe = safe.replace(/\[CHART_IMAGE: ([^\]]+) -> ([^\]]+)\]/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; margin: 15px 0; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.15);">');

        // Convert table markers to proper HTML tables
        safe = safe.replace(/\[TABLE: ([^\]]+)\]/g, (match, tableContent) => {
          const rows = tableContent.split('\n').filter(row => row.trim());
          if (rows.length < 2) return match;

          let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 2px solid #8b5cf6;">';
          rows.forEach((row, index) => {
            const cells = row.split('\t').filter(cell => cell.trim());
            if (cells.length > 0) {
              const tag = index === 0 ? 'th' : 'td';
              const style = index === 0 ? 'background-color: #8b5cf6; color: white; padding: 12px; font-weight: bold;' : 'padding: 12px; border: 1px solid #e5e7eb;';
              tableHtml += `<tr><${tag} style="${style}">${cells.join(`</${tag}><${tag} style="${style}">`)}</${tag}></tr>`;
            }
          });
          tableHtml += '</table>';
          return tableHtml;
        });

        // Convert chart markers to proper HTML
        safe = safe.replace(/\[CHART: ([^\]]+)\]/g, '<div style="background: #f8fafc; border: 2px solid #8b5cf6; border-radius: 8px; padding: 15px; margin: 15px 0; font-weight: bold; color: #8b5cf6;">📊 Chart: $1</div>');

        // Find the main content area and replace it
        const mainContent = document.querySelector('main, article, .content, .post, .entry, #content, .main-content') || document.body;

        // Detect page theme colors and extract actual colors
        const bodyStyles = window.getComputedStyle(document.body);
        const backgroundColor = bodyStyles.backgroundColor;
        const textColor = bodyStyles.color;
        const isDarkTheme = backgroundColor.includes('rgb(0, 0, 0)') || backgroundColor.includes('rgb(17, 17, 17)') || backgroundColor.includes('rgb(24, 24, 27)');
        const isBlandTheme = textColor.includes('rgb(0, 0, 0)') && backgroundColor.includes('rgb(255, 255, 255)');

        // Extract colors from page elements
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const links = document.querySelectorAll('a');
        let pagePrimaryColor = '#2563eb';
        let pageSecondaryColor = '#dc2626';
        let pageAccentColor = '#059669';

        // Try to extract colors from page elements
        if (headings.length > 0) {
          const headingColor = window.getComputedStyle(headings[0]).color;
          if (headingColor && !headingColor.includes('rgb(0, 0, 0)')) {
            pagePrimaryColor = headingColor;
          }
        }

        if (links.length > 0) {
          const linkColor = window.getComputedStyle(links[0]).color;
          if (linkColor && !linkColor.includes('rgb(0, 0, 0)')) {
            pageSecondaryColor = linkColor;
          }
        }

        // Choose color scheme based on page theme with more diverse colors
        let themeColors = {
          primary: '#8b5cf6', // Purple for headings
          secondary: '#f59e0b', // Orange for bold text
          accent: '#10b981', // Green for highlights
          background: '#ffffff',
          text: '#374151'
        };

        if (isDarkTheme) {
          themeColors = {
            primary: '#a78bfa', // Light purple
            secondary: '#fbbf24', // Light orange
            accent: '#34d399', // Light green
            background: '#1f2937',
            text: '#f9fafb'
          };
        } else if (isBlandTheme) {
          themeColors = {
            primary: '#059669', // Green
            secondary: '#dc2626', // Red
            accent: '#2563eb', // Blue
            background: '#f0fdf4',
            text: '#1f2937'
          };
        } else {
          // Use diverse colors for colorful pages
          themeColors = {
            primary: '#8b5cf6', // Purple
            secondary: '#f59e0b', // Orange
            accent: '#10b981', // Green
            background: '#ffffff',
            text: '#374151'
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

        // Add enhanced CSS for better typography with diverse colors
        const style = document.createElement('style');
        style.textContent = `
          #engagified-content h1 {
            font-size: 2.5rem;
            font-weight: 800;
            color: #8b5cf6 !important;
            margin: 2rem 0 1rem 0;
            line-height: 1.2;
          }
          #engagified-content h2 {
            font-size: 2rem;
            font-weight: 700;
            color: #8b5cf6 !important;
            margin: 1.5rem 0 0.75rem 0;
            line-height: 1.3;
          }
          #engagified-content h3 {
            font-size: 1.5rem;
            font-weight: 600;
            color: #8b5cf6 !important;
            margin: 1.25rem 0 0.5rem 0;
            line-height: 1.4;
          }
          #engagified-content p {
            font-size: 1.1rem;
            margin: 1rem 0;
            color: #374151;
          }
          #engagified-content strong {
            font-weight: 700;
            color: #f59e0b !important;
          }
          #engagified-content em {
            font-style: italic;
            color: #10b981 !important;
            font-weight: 600;
          }
          #engagified-content ul, #engagified-content ol {
            margin: 1rem 0;
            padding-left: 2rem;
          }
          #engagified-content li {
            font-size: 1.1rem;
            margin: 0.5rem 0;
            color: #374151;
          }
          #engagified-content a {
            color: #3b82f6 !important;
            text-decoration: underline;
            font-weight: 600;
          }
          #engagified-content a:hover {
            color: #1d4ed8 !important;
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
          #engagified-content table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            border: 2px solid #8b5cf6;
          }
          #engagified-content th {
            background-color: #8b5cf6;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
          }
          #engagified-content td {
            padding: 12px;
            border: 1px solid #e5e7eb;
          }
          #engagified-content tr:nth-child(even) {
            background-color: #f9fafb;
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
