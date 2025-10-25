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

  // Collect links (limit to 5 for speed)
  const links = document.querySelectorAll('a[href]');
  for (const link of links) {
    if (linkCount >= 5) break;
    const href = link.href;
    const linkText = link.textContent.trim();
    if (href && linkText && !text.includes(href)) {
      text += `\n[LINK: ${linkText} -> ${href}]`;
      linkCount++;
    }
  }

  // Collect images (limit to 10 for speed)
  const images = document.querySelectorAll('img[src]');
  for (const img of images) {
    if (imageCount >= 10) break;
    const src = img.src || img.getAttribute('data-src');
    const alt = img.alt || 'Image';
    if (src && !text.includes(src)) {
      text += `\n[IMAGE: ${alt} -> ${src}]`;
      imageCount++;
    }
  }

  return text.slice(0, maxChars);
}

// Detect if page has custom styling/colors
function detectPageColorScheme() {
  const bodyStyles = window.getComputedStyle(document.body);
  const backgroundColor = bodyStyles.backgroundColor;
  const textColor = bodyStyles.color;
  
  // Parse RGB values
  const parseRgb = (rgbString) => {
    const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    return match ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])] : null;
  };
  
  const bgRgb = parseRgb(backgroundColor);
  const textRgb = parseRgb(textColor);
  
  if (!bgRgb || !textRgb) {
    return { useGreenTheme: true };
  }
  
  // Check if background is light (close to white)
  const isLightBg = bgRgb[0] > 240 && bgRgb[1] > 240 && bgRgb[2] > 240;
  
  // Check if text is dark (close to black)
  const isDarkText = textRgb[0] < 60 && textRgb[1] < 60 && textRgb[2] < 60;
  
  // Check for styled headings
  const headings = document.querySelectorAll('h1, h2, h3');
  let hasColoredHeadings = false;
  let headingColor = null;
  
  for (const heading of headings) {
    const color = window.getComputedStyle(heading).color;
    const rgb = parseRgb(color);
    if (rgb) {
      // If heading color is not black/dark grey
      if (rgb[0] > 80 || rgb[1] > 80 || rgb[2] > 80) {
        hasColoredHeadings = true;
        headingColor = color;
        break;
      }
    }
  }
  
  // Check for styled links
  const links = document.querySelectorAll('a');
  let linkColor = null;
  
  for (const link of links) {
    const color = window.getComputedStyle(link).color;
    const rgb = parseRgb(color);
    if (rgb && !color.includes('0, 0, 0')) {
      linkColor = color;
      break;
    }
  }
  
  // Decision: Use green theme if page is plain (light bg + dark text + no colored elements)
  const useGreenTheme = isLightBg && isDarkText && !hasColoredHeadings;
  
  return {
    useGreenTheme,
    headingColor,
    linkColor,
    backgroundColor,
    textColor
  };
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
    border-top: 4px solid #156f3b;
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

chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.action === 'SUMMARIZE') {
    chrome.storage.local.get({ sumMode: 'sentences', sumCount: 5, engMaxChars: 20000, tone: 'conversational' }, async (cfg) => {
      const text = collectPageText(cfg.engMaxChars);
      if (!text || text.length < 60) { alert('Not enough readable text found on this page.'); return; }

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
          box.innerHTML = '<ul style="margin:0;padding-left:20px">' + items.map(i => `<li style="margin:6px 0">${i.replace(/^-\s*/, '')}</li>`).join('') + '</ul>';
        } else {
          box.innerHTML = `<div style="color:#374151">${out}</div>`;
        }
      });
    });
  } else if (msg.action === 'ENGAGIFY') {
    chrome.storage.local.get({ tone: 'conversational', engMaxChars: 20000 }, async (cfg) => {
      const text = collectPageText(cfg.engMaxChars);
      if (!text || text.length < 60) { alert('Not enough readable text found on this page.'); return; }

      showLoadingScreen('Engagifying content...');

      // Detect page color scheme
      const colorScheme = detectPageColorScheme();

      // Build concise tone-specific instructions
      let toneInstruction = '';
      if (cfg.tone === 'concise') {
        toneInstruction = 'CONCISE: Short sentences (10-15 words). Use bullets. Brief 2-3 sentence paragraphs.';
      } else if (cfg.tone === 'academic') {
        toneInstruction = 'ACADEMIC: Formal language. Complex sentences. Technical terms. Objective tone. 5-7 sentence paragraphs.';
      } else {
        toneInstruction = 'CONVERSATIONAL: Friendly tone. Use "you". Vary sentence length. Like talking to a friend.';
      }

      // Build color instructions
      let colorInstruction = '';
      if (colorScheme.useGreenTheme) {
        colorInstruction = `USE GREEN THEME: Headings: #156f3b. Bold: <strong style="color: #0f5a31;">text</strong>. Emphasis: <em style="color: #6b7280;">text</em>. Links: #156f3b.`;
      } else {
        colorInstruction = `PRESERVE COLORS: Keep heading color ${colorScheme.headingColor || 'as original'}. Keep link color ${colorScheme.linkColor || 'as original'}. Don't override existing colors.`;
      }

      // Shorter, faster prompt
      const prompt = `Rewrite this webpage content. ${toneInstruction} ${colorInstruction}

MUST DO:
- Every [IMAGE: desc -> url] becomes <img src="url" alt="desc">
- Every [LINK: text -> url] becomes <a href="url">text</a>
- Keep ALL facts and details
- Output ONLY HTML (no \`\`\`, no <style>, no code blocks)
- Use tags: <h1> <h2> <h3> <p> <strong> <em> <ul> <li> <a> <img>

Content:
${text}`;

      chrome.runtime.sendMessage({ type: 'OPENAI_ENGAGIFY', prompt }, (res) => {
        hideLoadingScreen();
        if (!res || !res.ok) { 
          alert('Error: ' + (res?.error || 'Unknown error')); 
          return; 
        }
        
        let output = (res.output || '').trim();
        
        // Clean up output
        output = output.replace(/```html\n?/g, '').replace(/```\n?/g, '');
        output = output.replace(/<style>[\s\S]*?<\/style>/gi, '');
        output = output.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

        // Sanitize
        const safe = output
          .replace(/<script[\s\S]*?<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');

        const mainContent = document.querySelector('main, article, .content, .post, .entry, #content, .main-content') || document.body;

        // Determine colors based on detection
        let themeColors;
        if (colorScheme.useGreenTheme) {
          themeColors = {
            heading: '#156f3b',
            text: '#1f2937',
            strong: '#0f5a31',
            emphasis: '#6b7280',
            link: '#156f3b',
            background: '#ffffff',
            tableHeader: '#156f3b',
            tableHeaderText: '#ffffff'
          };
        } else {
          themeColors = {
            heading: colorScheme.headingColor || '#1f2937',
            text: colorScheme.textColor || '#1f2937',
            strong: colorScheme.headingColor || '#1f2937',
            emphasis: colorScheme.linkColor || '#6b7280',
            link: colorScheme.linkColor || '#3b82f6',
            background: colorScheme.backgroundColor || '#ffffff',
            tableHeader: colorScheme.headingColor || '#1f2937',
            tableHeaderText: '#ffffff'
          };
        }

        // Create container
        const engagifiedDiv = document.createElement('div');
        engagifiedDiv.id = 'engagified-content';
        engagifiedDiv.style.cssText = `
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.8;
          color: ${themeColors.text};
          max-width: 900px;
          margin: 0 auto;
          padding: 40px;
          background: ${themeColors.background};
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          margin-top: 80px;
          position: relative;
          z-index: 1;
        `;

        // CSS with proper contrast
        const style = document.createElement('style');
        style.textContent = `
          #engagified-content h1 {
            font-size: 2.5rem;
            font-weight: 800;
            color: ${themeColors.heading} !important;
            margin: 2rem 0 1rem 0;
            line-height: 1.2;
          }
          #engagified-content h2 {
            font-size: 2rem;
            font-weight: 700;
            color: ${themeColors.heading} !important;
            margin: 1.5rem 0 0.75rem 0;
            line-height: 1.3;
          }
          #engagified-content h3 {
            font-size: 1.5rem;
            font-weight: 600;
            color: ${themeColors.heading} !important;
            margin: 1.25rem 0 0.5rem 0;
            line-height: 1.4;
          }
          #engagified-content h4 {
            font-size: 1.25rem;
            font-weight: 600;
            color: ${themeColors.heading} !important;
            margin: 1rem 0 0.5rem 0;
          }
          #engagified-content p {
            font-size: 1.1rem;
            margin: 1rem 0;
            color: ${themeColors.text} !important;
            line-height: 1.8;
          }
          #engagified-content strong {
            font-weight: 700;
            color: ${themeColors.strong} !important;
          }
          #engagified-content em {
            font-style: normal;
            color: ${themeColors.emphasis} !important;
            font-weight: 600;
          }
          #engagified-content ul, #engagified-content ol {
            margin: 1.25rem 0;
            padding-left: 2rem;
          }
          #engagified-content li {
            font-size: 1.1rem;
            margin: 0.5rem 0;
            color: ${themeColors.text} !important;
            line-height: 1.7;
          }
          #engagified-content a {
            color: ${themeColors.link} !important;
            text-decoration: underline;
            font-weight: 600;
            transition: opacity 0.2s;
          }
          #engagified-content a:hover {
            opacity: 0.7;
          }
          #engagified-content img {
            max-width: 100%;
            height: auto;
            margin: 20px auto;
            display: block;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          #engagified-content table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            border: 2px solid ${themeColors.tableHeader};
            border-radius: 8px;
            overflow: hidden;
          }
          #engagified-content th {
            background-color: ${themeColors.tableHeader};
            color: ${themeColors.tableHeaderText};
            padding: 12px;
            text-align: left;
            font-weight: 700;
          }
          #engagified-content td {
            padding: 12px;
            border: 1px solid #e5e7eb;
            color: ${themeColors.text} !important;
          }
          #engagified-content tr:nth-child(even) {
            background-color: rgba(0, 0, 0, 0.02);
          }
          #engagified-content blockquote {
            border-left: 4px solid ${themeColors.heading};
            padding-left: 20px;
            margin: 20px 0;
            font-style: italic;
            color: ${themeColors.emphasis};
          }
        `;
        document.head.appendChild(style);
        engagifiedDiv.innerHTML = safe;

        // Hide original and show engagified
        const originalContent = mainContent.cloneNode(true);
        originalContent.style.display = 'none';
        originalContent.id = 'original-content';

        mainContent.parentNode.insertBefore(engagifiedDiv, mainContent);
        mainContent.parentNode.insertBefore(originalContent, mainContent);
        mainContent.style.display = 'none';

        // Restore button
        const restoreBtn = document.createElement('button');
        restoreBtn.textContent = 'Restore Original';
        restoreBtn.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #156f3b;
          color: white;
          border: none;
          padding: 12px 18px;
          border-radius: 8px;
          cursor: pointer;
          z-index: 9999;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(21, 111, 59, 0.3);
          transition: all 0.2s;
        `;
        restoreBtn.onmouseover = () => {
          restoreBtn.style.background = '#0f5a31';
          restoreBtn.style.transform = 'translateY(-2px)';
        };
        restoreBtn.onmouseout = () => {
          restoreBtn.style.background = '#156f3b';
          restoreBtn.style.transform = 'translateY(0)';
        };
        restoreBtn.onclick = () => {
          engagifiedDiv.remove();
          originalContent.remove();
          mainContent.style.display = '';
          restoreBtn.remove();
          style.remove();
        };
        document.body.appendChild(restoreBtn);
      });
    });
  }
});