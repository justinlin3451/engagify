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
    if (linkCount >= 10) break;
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

// Detect if page has custom styling/colors
function detectPageColorScheme() {
  const bodyStyles = window.getComputedStyle(document.body);
  const backgroundColor = bodyStyles.backgroundColor;
  const textColor = bodyStyles.color;
  
  // Check for styled elements
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const links = document.querySelectorAll('a');
  const styledElements = document.querySelectorAll('[style*="color"], [class*="color"]');
  
  let hasCustomColors = false;
  let extractedColors = {
    heading: null,
    link: null,
    accent: null
  };
  
  // Check if page has custom heading colors
  for (const heading of headings) {
    const color = window.getComputedStyle(heading).color;
    // Not black or very dark grey = custom color
    if (color && !color.match(/rgb\((0|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9]), ?(0|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9]), ?(0|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])\)/)) {
      hasCustomColors = true;
      extractedColors.heading = color;
      break;
    }
  }
  
  // Check link colors
  for (const link of links) {
    const color = window.getComputedStyle(link).color;
    if (color && !color.match(/rgb\((0|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9]), ?(0|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9]), ?(0|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])\)/)) {
      hasCustomColors = true;
      extractedColors.link = color;
      break;
    }
  }
  
  // Check for other styled elements
  if (styledElements.length > 5) {
    hasCustomColors = true;
  }
  
  // Determine if it's a plain/research style page (black text on white background)
  const isPlainPage = textColor.match(/rgb\((0|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9]), ?(0|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9]), ?(0|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])\)/) 
    && backgroundColor.match(/rgb\((2[4-5][0-9]|255), ?(2[4-5][0-9]|255), ?(2[4-5][0-9]|255)\)/);
  
  return {
    hasCustomColors,
    isPlainPage,
    extractedColors,
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
    chrome.storage.local.get({ sumMode: 'sentences', sumCount: 5, engMaxChars: 20000, tone: 'conversational' }, async (cfg) => {
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

      // Show loading screen
      showLoadingScreen('Engagifying content...');

      // Detect page color scheme
      const colorScheme = detectPageColorScheme();

      // Build tone-specific instructions
      let toneInstruction = '';
      if (cfg.tone === 'concise') {
        toneInstruction = `Write in a CONCISE style:
- Use short, punchy sentences (10-15 words max)
- Get straight to the point - no fluff
- Use bullet points and numbered lists extensively
- Break content into scannable chunks
- Use brief paragraphs (2-3 sentences max)
- Focus on key facts and actionable information
- Think: TL;DR style but comprehensive`;
      } else if (cfg.tone === 'academic') {
        toneInstruction = `Write in an ACADEMIC style:
- Use formal, scholarly language
- Employ complex sentence structures with proper subordination
- Include transitional phrases (e.g., "Furthermore," "Consequently," "In contrast")
- Use precise technical terminology
- Maintain objective, third-person perspective
- Structure with clear thesis and supporting evidence
- Include longer, well-developed paragraphs (5-7 sentences)
- Think: Research paper or journal article tone`;
      } else {
        // conversational
        toneInstruction = `Write in a CONVERSATIONAL style:
- Use friendly, approachable language
- Include rhetorical questions to engage readers
- Use contractions (it's, you'll, we're) naturally
- Vary sentence length for rhythm and flow
- Use relatable examples and analogies
- Address the reader directly with "you"
- Mix short punchy sentences with longer explanatory ones
- Think: Talking to a smart friend over coffee`;
      }

      // Build color scheme instructions
      let colorInstruction = '';
      if (colorScheme.isPlainPage) {
        // Plain black-on-white page: use our green/grey color scheme
        colorInstruction = `Use this GREEN/GREY color scheme (plain page detected):
- Headings (h1, h2, h3): Use #156f3b (forest green) for ALL headings
- Important text: Use <strong style="color: #0f5a31; font-weight: 700;">text</strong> (darker green)
- Highlights/emphasis: Use <em style="color: #6b7280; font-weight: 600; font-style: normal;">text</em> (grey)
- Regular text: Keep as #374151 (dark grey)
- Links: Use #156f3b (green) for links
- Background: Use subtle #f0fdf4 (very light green) for emphasis boxes if needed
- Tables: Green headers (#156f3b), light grey alternating rows
IMPORTANT: This creates a clean, professional green/grey aesthetic.`;
      } else if (colorScheme.hasCustomColors) {
        // Page has custom colors: preserve them
        colorInstruction = `PRESERVE the original page's color scheme:
- Headings: Keep similar colors to original (${colorScheme.extractedColors.heading || 'original heading color'})
- Links: Keep similar colors to original (${colorScheme.extractedColors.link || 'original link color'})
- Use <strong> tags without changing colors for bold text
- Use <em> tags without changing colors for emphasis
- Maintain the page's existing visual identity and branding
- Keep the same color temperature (warm/cool) as the original
IMPORTANT: Match the original page's style, don't override with new colors.`;
      } else {
        // Default: use our green/white/grey scheme
        colorInstruction = `Use this GREEN/GREY color scheme:
- Headings: #156f3b (forest green)
- Bold text: #0f5a31 (darker green)
- Highlights: #6b7280 (grey)
- Links: #156f3b (green)
- Keep clean and minimal`;
      }

      const prompt = `You are rewriting webpage content to make it more engaging while preserving ALL important information.

${toneInstruction}

${colorInstruction}

CRITICAL RULES:
1. PRESERVE ALL IMAGES: For every [IMAGE: ...] tag in the source, create an <img> tag with proper src
2. PRESERVE ALL LINKS: Convert [LINK: text -> url] to <a href="url">text</a>
3. PRESERVE ALL TABLES: Recreate tables with proper HTML
4. Include ALL factual content - don't skip important details
5. Output ONLY clean HTML content (no CSS code blocks, no \`\`\`html tags, no style tags)
6. Use proper HTML tags: <h1>, <h2>, <h3>, <p>, <strong>, <em>, <ul>, <ol>, <li>, <a>, <img>, <table>
7. Convert markdown-style **bold** to <strong>tags</strong>
8. Make content visually engaging with proper heading hierarchy
9. Use spacing and structure for readability

Source content:
${text}

Output clean HTML that's engaging and visually appealing:`;

      chrome.runtime.sendMessage({ type: 'OPENAI_ENGAGIFY', prompt }, (res) => {
        hideLoadingScreen();
        if (!res || !res.ok) { 
          alert('Error: ' + (res?.error || 'Unknown error')); 
          return; 
        }
        
        let output = (res.output || '').trim();
        
        // Clean up the output - remove code blocks if present
        output = output.replace(/```html\n?/g, '').replace(/```\n?/g, '');
        output = output.replace(/<style>[\s\S]*?<\/style>/gi, '');
        
        // Convert markdown-style bold to HTML
        output = output.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

        // Sanitize but keep safe HTML
        const safe = output
          .replace(/<script[\s\S]*?<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');

        // Find the main content area and replace it
        const mainContent = document.querySelector('main, article, .content, .post, .entry, #content, .main-content') || document.body;

        // Determine color scheme for styling
        let themeColors;
        if (colorScheme.isPlainPage) {
          // Plain page: green/grey scheme
          themeColors = {
            heading: '#156f3b',
            strong: '#0f5a31',
            emphasis: '#6b7280',
            link: '#156f3b',
            background: '#f9fdf9',
            text: '#374151',
            tableHeader: '#156f3b',
            tableHeaderText: '#ffffff'
          };
        } else if (colorScheme.hasCustomColors) {
          // Preserve original colors
          themeColors = {
            heading: colorScheme.extractedColors.heading || colorScheme.textColor,
            strong: colorScheme.extractedColors.heading || colorScheme.textColor,
            emphasis: colorScheme.extractedColors.accent || colorScheme.textColor,
            link: colorScheme.extractedColors.link || '#3b82f6',
            background: colorScheme.backgroundColor,
            text: colorScheme.textColor,
            tableHeader: colorScheme.extractedColors.heading || '#374151',
            tableHeaderText: '#ffffff'
          };
        } else {
          // Default green/grey
          themeColors = {
            heading: '#156f3b',
            strong: '#0f5a31',
            emphasis: '#6b7280',
            link: '#156f3b',
            background: '#ffffff',
            text: '#374151',
            tableHeader: '#156f3b',
            tableHeaderText: '#ffffff'
          };
        }

        // Create container for engagified content
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

        // Enhanced CSS for better typography
        const style = document.createElement('style');
        style.textContent = `
          #engagified-content h1 {
            font-size: 2.75rem;
            font-weight: 800;
            color: ${themeColors.heading} !important;
            margin: 2.5rem 0 1.25rem 0;
            line-height: 1.2;
            letter-spacing: -0.02em;
          }
          #engagified-content h2 {
            font-size: 2.25rem;
            font-weight: 700;
            color: ${themeColors.heading} !important;
            margin: 2rem 0 1rem 0;
            line-height: 1.3;
            letter-spacing: -0.01em;
          }
          #engagified-content h3 {
            font-size: 1.75rem;
            font-weight: 600;
            color: ${themeColors.heading} !important;
            margin: 1.75rem 0 0.75rem 0;
            line-height: 1.4;
          }
          #engagified-content h4 {
            font-size: 1.5rem;
            font-weight: 600;
            color: ${themeColors.heading} !important;
            margin: 1.5rem 0 0.5rem 0;
          }
          #engagified-content p {
            font-size: 1.125rem;
            margin: 1.25rem 0;
            color: ${themeColors.text};
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
            margin: 1.5rem 0;
            padding-left: 2rem;
          }
          #engagified-content li {
            font-size: 1.125rem;
            margin: 0.75rem 0;
            color: ${themeColors.text};
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
            text-decoration: none;
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
            margin: 25px 0;
            border: 2px solid ${themeColors.tableHeader};
            border-radius: 8px;
            overflow: hidden;
          }
          #engagified-content th {
            background-color: ${themeColors.tableHeader};
            color: ${themeColors.tableHeaderText};
            padding: 14px;
            text-align: left;
            font-weight: 700;
            font-size: 1.05rem;
          }
          #engagified-content td {
            padding: 12px 14px;
            border: 1px solid #e5e7eb;
            font-size: 1.05rem;
          }
          #engagified-content tr:nth-child(even) {
            background-color: rgba(0, 0, 0, 0.02);
          }
          #engagified-content tr:hover {
            background-color: rgba(0, 0, 0, 0.04);
          }
          #engagified-content blockquote {
            border-left: 4px solid ${themeColors.heading};
            padding-left: 20px;
            margin: 20px 0;
            font-style: italic;
            color: ${themeColors.emphasis};
          }
          #engagified-content hr {
            border: none;
            border-top: 2px solid #e5e7eb;
            margin: 30px 0;
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

        // Add a restore button with green theme
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
          font-size: 14px;
        `;
        restoreBtn.onmouseover = () => {
          restoreBtn.style.background = '#0f5a31';
          restoreBtn.style.transform = 'translateY(-2px)';
          restoreBtn.style.boxShadow = '0 4px 12px rgba(21, 111, 59, 0.4)';
        };
        restoreBtn.onmouseout = () => {
          restoreBtn.style.background = '#156f3b';
          restoreBtn.style.transform = 'translateY(0)';
          restoreBtn.style.boxShadow = '0 2px 8px rgba(21, 111, 59, 0.3)';
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