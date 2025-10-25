function collectPageText(maxChars = 15000) {
  // First, try to find the main article content
  const mainContentSelectors = [
    'article',
    '[role="main"]',
    'main',
    '.post-content',
    '.article-content',
    '.entry-content',
    '.content',
    '#content',
    '.story',
    '.post',
    '.article-body',
    '.abstract-content',  // PubMed
    '#abstract',          // PubMed
    '.article-details'    // PubMed
  ];
  
  let mainContainer = null;
  for (const selector of mainContentSelectors) {
    const element = document.querySelector(selector);
    if (element && element.textContent.trim().length > 500) {
      mainContainer = element;
      break;
    }
  }
  
  // If no main container found, use body but filter more aggressively
  if (!mainContainer) {
    mainContainer = document.body;
  }

  // Elements to exclude (cookie banners, ads, navigation, etc.)
  const excludeSelectors = [
    '[class*="cookie"]',
    '[id*="cookie"]',
    '[class*="consent"]',
    '[id*="consent"]',
    '[class*="banner"]',
    '[class*="advertisement"]',
    '[class*="ad-"]',
    '[id*="ad-"]',
    'aside',
    'nav',
    'header:not(.article-header)',
    'footer',
    '[class*="sidebar"]',
    '[class*="navigation"]',
    '[class*="menu"]',
    '[class*="popup"]',
    '[class*="modal"]',
    '[class*="donate"]',
    '[class*="subscribe"]',
    '[class*="newsletter"]',
    '[class*="social"]',
    '[class*="share"]',
    '[class*="comment"]',
    '[role="complementary"]',
    '[aria-label*="advertisement"]'
  ];

  // Remove excluded elements temporarily
  const excludedElements = [];
  excludeSelectors.forEach(selector => {
    const elements = mainContainer.querySelectorAll(selector);
    elements.forEach(el => {
      excludedElements.push({ element: el, parent: el.parentNode, nextSibling: el.nextSibling });
      el.remove();
    });
  });

  const walker = document.createTreeWalker(mainContainer, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      if (!node.nodeValue) return NodeFilter.FILTER_REJECT;
      const str = node.nodeValue.trim();
      if (!str) return NodeFilter.FILTER_REJECT;
      if (str.length < 3) return NodeFilter.FILTER_REJECT;
      if (!node.parentElement) return NodeFilter.FILTER_REJECT;
      
      const style = window.getComputedStyle(node.parentElement);
      if (style && (style.visibility === 'hidden' || style.display === 'none')) {
        return NodeFilter.FILTER_REJECT;
      }
      
      // Skip if text looks like a button or label
      const text = node.nodeValue.toLowerCase();
      if (text.includes('click here') || text.includes('subscribe') || 
          text.includes('donate') || text.includes('sign up') ||
          text.match(/^\$\d+$/)) {
        return NodeFilter.FILTER_REJECT;
      }
      
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  let text = "";
  let linkCount = 0;
  let imageCount = 0;

  // Collect text content
  while (walker.nextNode() && text.length < maxChars) {
    const chunk = walker.currentNode.nodeValue.replace(/\s+/g, ' ').trim();
    if (chunk && chunk.length > 2) {
      text += chunk + " ";
    }
  }

  // Restore excluded elements
  excludedElements.reverse().forEach(({ element, parent, nextSibling }) => {
    if (parent) {
      if (nextSibling && nextSibling.parentNode === parent) {
        parent.insertBefore(element, nextSibling);
      } else {
        parent.appendChild(element);
      }
    }
  });

  // Collect links from main content only (limit to 5 for speed)
  if (mainContainer) {
    const links = mainContainer.querySelectorAll('a[href]');
    for (const link of links) {
      if (linkCount >= 5) break;
      const href = link.href;
      const linkText = link.textContent.trim();
      if (href && linkText && linkText.length > 3 && !text.includes(href) && 
          !href.includes('donate') && !href.includes('subscribe')) {
        text += `\n[LINK: ${linkText} -> ${href}]`;
        linkCount++;
      }
    }

    // Collect images from main content (limit to 8 for speed)
    const images = mainContainer.querySelectorAll('img[src]');
    for (const img of images) {
      if (imageCount >= 8) break;
      const src = img.src || img.getAttribute('data-src');
      const alt = img.alt || 'Image';
      if (src && !text.includes(src) && !src.includes('avatar') && !src.includes('icon')) {
        text += `\n[IMAGE: ${alt} -> ${src}]`;
        imageCount++;
      }
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
  
  // Load Lora font
  if (!document.querySelector('link[href*="Lora"]')) {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  
  el = document.createElement('div');
  el.id = 'engagify-sidebar';
  el.style.cssText = `position:fixed; top:0; right:0; height:100vh; width:400px; background:#ffffff; border-left:1px solid #e2e8f0; box-shadow:-6px 0 14px rgba(0,0,0,.06); z-index:2147483647; padding:20px; overflow:auto; font-family: 'Lora', serif;`;
  
  const hdr = document.createElement('div');
  hdr.style.cssText = "display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;padding-bottom:12px;border-bottom:2px solid #156f3b";
  hdr.innerHTML = `<div style="font-weight:700;color:#156f3b;font-size:1.5rem">📝 Summary</div>`;
  
  const close = document.createElement('button');
  close.textContent = '✕';
  close.style.cssText = "background:#156f3b;color:#fff;border:none;padding:8px 12px;border-radius:8px;cursor:pointer;font-size:18px;font-weight:700;transition:all 0.2s";
  close.onmouseover = () => { close.style.background = '#0f5a31'; close.style.transform = 'scale(1.1)'; };
  close.onmouseout = () => { close.style.background = '#156f3b'; close.style.transform = 'scale(1)'; };
  close.onclick = () => el.remove();
  hdr.appendChild(close);
  el.appendChild(hdr);

  const content = document.createElement('div');
  content.id = 'engagify-sidebar-content';
  content.style.cssText = "font-size:16px;line-height:1.7;color:#1f2937;font-family:'Lora',serif";
  el.appendChild(content);

  document.body.appendChild(el);
  return el;
}

chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.action === 'SUMMARIZE') {
    chrome.storage.local.get({ sumMode: 'sentences', sumCount: 5, engMaxChars: 15000, tone: 'conversational' }, async (cfg) => {
      const text = collectPageText(cfg.engMaxChars);
      if (!text || text.length < 60) { alert('Not enough readable text found on this page.'); return; }

      showLoadingScreen('Summarizing content...');

      const instruction = cfg.sumMode === 'bullets'
        ? `Summarize into ${cfg.sumCount} bullet points.`
        : `Summarize in ${cfg.sumCount} concise sentences.`;
      
      const prompt = `You are creating an engaging summary of a webpage.

${instruction}

IMPORTANT FORMATTING:
- Identify 5-10 KEY TERMS or important words and wrap them like this: <span class="green-bold">[key term]</span>
- These should be impactful nouns, action verbs, or critical concepts
- Make the summary engaging and scannable
- Keep facts accurate

If there are any key statistics, data points, or important quotes, format them in a special box:
<div class="summary-highlight">📊 [statistic or key point]</div>

Text to summarize:
${text}`;

      chrome.runtime.sendMessage({ type: 'OPENAI_SUMMARIZE', prompt }, (res) => {
        hideLoadingScreen();
        const el = ensureSidebar();
        const box = document.getElementById('engagify-sidebar-content');
        if (!res || !res.ok) { 
          box.innerHTML = `<div style="color:#b91c1c;font-family:'Lora',serif">Error: ${res?.error || 'Unknown error'}</div>`; 
          return; 
        }
        
        let out = (res.output || '').trim();
        
        // Add CSS for summary styling
        if (!document.getElementById('summary-styles')) {
          const summaryStyle = document.createElement('style');
          summaryStyle.id = 'summary-styles';
          summaryStyle.textContent = `
            #engagify-sidebar-content {
              font-family: 'Lora', serif !important;
            }
            #engagify-sidebar-content .green-bold {
              color: #156f3b !important;
              font-weight: 700;
              font-size: 1.05em;
              background: rgba(21, 111, 59, 0.08);
              padding: 2px 4px;
              border-radius: 3px;
            }
            #engagify-sidebar-content .summary-highlight {
              background: linear-gradient(135deg, #e0f2e9 0%, #f0fdf4 100%);
              border-left: 4px solid #156f3b;
              padding: 15px;
              margin: 15px 0;
              border-radius: 8px;
              font-weight: 600;
              color: #1f2937 !important;
              box-shadow: 0 2px 8px rgba(21, 111, 59, 0.1);
            }
            #engagify-sidebar-content p {
              margin: 12px 0;
              line-height: 1.7;
            }
            #engagify-sidebar-content ul {
              margin: 15px 0;
              padding-left: 25px;
            }
            #engagify-sidebar-content li {
              margin: 10px 0;
              line-height: 1.7;
            }
            #engagify-sidebar-content strong {
              color: #0f5a31 !important;
              font-weight: 700;
            }
          `;
          document.head.appendChild(summaryStyle);
        }
        
        if (out.startsWith('- ') || out.includes('\n- ')) {
          const items = out.split('\n').filter(Boolean);
          box.innerHTML = '<ul style="margin:0;padding-left:25px;font-family:\'Lora\',serif">' + 
            items.map(i => `<li style="margin:10px 0;line-height:1.7">${i.replace(/^-\s*/, '')}</li>`).join('') + 
            '</ul>';
        } else {
          box.innerHTML = `<div style="font-family:'Lora',serif;color:#1f2937">${out}</div>`;
        }
      });
    });
  } else if (msg.action === 'ENGAGIFY') {
    chrome.storage.local.get({ tone: 'conversational', engMaxChars: 15000 }, async (cfg) => {
      const text = collectPageText(cfg.engMaxChars);
      if (!text || text.length < 60) { alert('Not enough readable text found on this page.'); return; }

      showLoadingScreen('Engagifying content...');
      
      // Load Lora font
      if (!document.querySelector('link[href*="Lora"]')) {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }

      // Build tone-specific instructions
      let toneInstruction = '';
      if (cfg.tone === 'concise') {
        toneInstruction = 'CONCISE style: Short punchy sentences (8-12 words). Use bullet points frequently. Keep paragraphs to 2 sentences max. Make it scannable and quick to read.';
      } else if (cfg.tone === 'academic') {
        toneInstruction = 'ACADEMIC style: Use formal scholarly language with complex sentence structures. Include transitional phrases like "Furthermore," "Consequently," "In contrast." Maintain objective third-person perspective. Write longer paragraphs (5-7 sentences) with proper topic sentences.';
      } else {
        toneInstruction = 'CONVERSATIONAL style: Write like you\'re talking to a friend. Use "you" to address the reader. Include rhetorical questions. Vary sentence length - mix short punchy ones with longer explanatory sentences. Use contractions naturally (it\'s, you\'ll, we\'re). Make it engaging and relatable.';
      }

      // Enhanced prompt with engagement features
      const prompt = `Rewrite this article in an extremely engaging way. ${toneInstruction}

CRITICAL ENGAGEMENT FEATURES:
1. START WITH TL;DR: Create a 2-sentence summary in a special box format like this:
   <div class="tldr-box">📌 <strong>TL;DR:</strong> [2 sentence summary here]</div>

2. HIGHLIGHT KEY PHRASES: Wrap 5-8 important phrases/concepts with:
   <mark class="highlight">[key phrase]</mark>

3. GREEN BOLD WORDS: Make important action words, key terms, and impactful nouns GREEN and BOLD:
   <span class="green-bold">[important word]</span>
   Use this liberally - 10-15 times throughout!

4. CALLOUT BOXES: For important quotes, facts, or statistics, use:
   <div class="callout-box">💡 [Important fact or quote here]</div>

5. LARGE STATISTICS: Make numbers/statistics BIG and eye-catching:
   <span class="big-stat">85%</span>

6. VISUAL DIVIDERS: Between major sections, add:
   <div class="section-divider">✦ ✦ ✦</div>

7. KEEP PARAGRAPHS SHORT: Maximum 2-3 sentences per paragraph for readability.

FORMATTING RULES:
- Headings: GREEN (#156f3b) using <h1>, <h2>, <h3>
- Regular bold: <strong style="color: #0f5a31;">[text]</strong>
- Links: GREEN (#156f3b)
- Convert [IMAGE: desc -> url] to <img src="url" alt="desc">
- Convert [LINK: text -> url] to <a href="url">[text]</a>
- ALL body text must be DARK GREY/BLACK - never white
- Output ONLY HTML (no code blocks, no markdown)

Make this VISUALLY EXCITING and ENGAGING!

Article content:
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

        // Check if we got valid content
        if (!safe || safe.length < 100) {
          alert('Error: Could not generate engagified content. The page structure might be too complex.');
          return;
        }

        // Find main content - try multiple selectors for PubMed and other sites
        const mainContentSelectors = [
          'main',
          'article', 
          '.article-details',
          '.content',
          '.post',
          '.entry',
          '#content',
          '.main-content',
          'body'
        ];
        
        let mainContent = null;
        for (const selector of mainContentSelectors) {
          const el = document.querySelector(selector);
          if (el && el.textContent.trim().length > 100) {
            mainContent = el;
            break;
          }
        }
        
        if (!mainContent) {
          mainContent = document.body;
        }

        // Create container
        const engagifiedDiv = document.createElement('div');
        engagifiedDiv.id = 'engagified-content';
        engagifiedDiv.style.cssText = `
          font-family: 'Lora', serif;
          line-height: 1.8;
          color: #1f2937;
          max-width: 850px;
          margin: 0 auto;
          padding: 50px 40px;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          margin-top: 80px;
          margin-bottom: 80px;
          position: relative;
          z-index: 1;
        `;

        // Enhanced CSS with all engagement features
        const style = document.createElement('style');
        style.textContent = `
          #engagified-content {
            font-family: 'Lora', serif !important;
          }
          #engagified-content * {
            color: #1f2937 !important;
          }
          
          /* TL;DR Box */
          #engagified-content .tldr-box {
            background: linear-gradient(135deg, #e0f2e9 0%, #f0fdf4 100%);
            border-left: 5px solid #156f3b;
            padding: 20px 25px;
            margin: 0 0 35px 0;
            border-radius: 10px;
            font-size: 1.15rem;
            line-height: 1.7;
            box-shadow: 0 3px 10px rgba(21, 111, 59, 0.1);
            color: #1f2937 !important;
            font-family: 'Lora', serif;
          }
          #engagified-content .tldr-box strong {
            color: #156f3b !important;
            font-size: 1.25rem;
          }
          
          /* Highlighted Key Phrases */
          #engagified-content mark.highlight {
            background: linear-gradient(120deg, #d4fc79 0%, #96e6a1 100%);
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 600;
            color: #1f2937 !important;
            box-shadow: 0 1px 3px rgba(21, 111, 59, 0.15);
          }
          
          /* Green Bold Words */
          #engagified-content .green-bold {
            color: #156f3b !important;
            font-weight: 800;
            font-size: 1.1em;
            letter-spacing: 0.3px;
          }
          
          /* Callout Boxes */
          #engagified-content .callout-box {
            background: #f0fdf4;
            border: 2px solid #156f3b;
            border-radius: 10px;
            padding: 20px 25px;
            margin: 25px 0;
            font-size: 1.1rem;
            line-height: 1.7;
            box-shadow: 0 3px 12px rgba(21, 111, 59, 0.15);
            color: #1f2937 !important;
            font-weight: 500;
            font-family: 'Lora', serif;
          }
          
          /* Large Statistics */
          #engagified-content .big-stat {
            font-size: 3rem;
            font-weight: 900;
            color: #156f3b !important;
            display: inline-block;
            margin: 0 8px;
            line-height: 1;
            text-shadow: 2px 2px 4px rgba(21, 111, 59, 0.1);
          }
          
          /* Section Dividers */
          #engagified-content .section-divider {
            text-align: center;
            margin: 40px 0;
            font-size: 1.5rem;
            color: #156f3b;
            letter-spacing: 20px;
            opacity: 0.6;
          }
          
          /* Headings - Keep Inter for headers */
          #engagified-content h1,
          #engagified-content h2,
          #engagified-content h3,
          #engagified-content h4 {
            color: #156f3b !important;
            font-weight: 700;
            line-height: 1.3;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          #engagified-content h1 {
            font-size: 2.75rem;
            margin: 2.5rem 0 1.25rem 0;
            font-weight: 800;
            letter-spacing: -0.02em;
          }
          #engagified-content h2 {
            font-size: 2.25rem;
            margin: 2rem 0 1rem 0;
            letter-spacing: -0.01em;
          }
          #engagified-content h3 {
            font-size: 1.75rem;
            margin: 1.75rem 0 0.75rem 0;
          }
          #engagified-content h4 {
            font-size: 1.4rem;
            margin: 1.5rem 0 0.5rem 0;
          }
          
          /* Paragraphs */
          #engagified-content p {
            font-size: 1.15rem;
            margin: 1.25rem 0;
            color: #1f2937 !important;
            line-height: 1.8;
            font-family: 'Lora', serif;
          }
          
          /* Regular Strong */
          #engagified-content strong {
            font-weight: 700;
            color: #0f5a31 !important;
          }
          
          /* Emphasis */
          #engagified-content em {
            font-style: italic;
            color: #6b7280 !important;
            font-weight: 600;
          }
          
          /* Lists */
          #engagified-content ul, #engagified-content ol {
            margin: 1.5rem 0;
            padding-left: 2rem;
            font-family: 'Lora', serif;
          }
          #engagified-content li {
            font-size: 1.15rem;
            margin: 0.75rem 0;
            color: #1f2937 !important;
            line-height: 1.7;
            font-family: 'Lora', serif;
          }
          
          /* Links */
          #engagified-content a {
            color: #156f3b !important;
            text-decoration: underline;
            font-weight: 600;
            transition: opacity 0.2s;
          }
          #engagified-content a:hover {
            opacity: 0.7;
          }
          
          /* Images */
          #engagified-content img {
            max-width: 100%;
            height: auto;
            margin: 25px auto;
            display: block;
            border-radius: 10px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
          }
          
          /* Tables */
          #engagified-content table {
            width: 100%;
            border-collapse: collapse;
            margin: 25px 0;
            border: 2px solid #156f3b;
            border-radius: 8px;
            overflow: hidden;
            font-family: 'Lora', serif;
          }
          #engagified-content th {
            background-color: #156f3b;
            color: #ffffff !important;
            padding: 14px;
            text-align: left;
            font-weight: 700;
            font-size: 1.05rem;
          }
          #engagified-content td {
            padding: 12px 14px;
            border: 1px solid #e5e7eb;
            color: #1f2937 !important;
          }
          #engagified-content tr:nth-child(even) {
            background-color: rgba(21, 111, 59, 0.05);
          }
          #engagified-content tr:hover {
            background-color: rgba(21, 111, 59, 0.08);
          }
          
          /* Blockquotes */
          #engagified-content blockquote {
            border-left: 4px solid #156f3b;
            padding-left: 24px;
            margin: 25px 0;
            font-style: italic;
            color: #6b7280 !important;
            font-size: 1.1rem;
            font-family: 'Lora', serif;
          }
          
          /* Horizontal Rules */
          #engagified-content hr {
            border: none;
            border-top: 2px solid #e5e7eb;
            margin: 35px 0;
          }
        `;
        document.head.appendChild(style);
        engagifiedDiv.innerHTML = safe;

        // For PubMed and similar sites, clear everything and insert fresh
        if (window.location.hostname.includes('pubmed')) {
          // Clear the body content
          while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
          }
          document.body.appendChild(engagifiedDiv);
          document.body.appendChild(style);
        } else {
          // Standard approach for other sites
          const originalContent = mainContent.cloneNode(true);
          originalContent.style.display = 'none';
          originalContent.id = 'original-content';

          if (mainContent.parentNode) {
            mainContent.parentNode.insertBefore(engagifiedDiv, mainContent);
            mainContent.parentNode.insertBefore(originalContent, mainContent);
            mainContent.style.display = 'none';
          }
        }

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
          padding: 12px 20px;
          border-radius: 10px;
          cursor: pointer;
          z-index: 9999;
          font-weight: 700;
          font-size: 14px;
          box-shadow: 0 3px 10px rgba(21, 111, 59, 0.3);
          transition: all 0.2s;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        restoreBtn.onmouseover = () => {
          restoreBtn.style.background = '#0f5a31';
          restoreBtn.style.transform = 'translateY(-2px)';
          restoreBtn.style.boxShadow = '0 5px 15px rgba(21, 111, 59, 0.4)';
        };
        restoreBtn.onmouseout = () => {
          restoreBtn.style.background = '#156f3b';
          restoreBtn.style.transform = 'translateY(0)';
          restoreBtn.style.boxShadow = '0 3px 10px rgba(21, 111, 59, 0.3)';
        };
        restoreBtn.onclick = () => {
          if (window.location.hostname.includes('pubmed')) {
            window.location.reload();
          } else {
            engagifiedDiv.remove();
            const orig = document.getElementById('original-content');
            if (orig) orig.remove();
            if (mainContent) mainContent.style.display = '';
            restoreBtn.remove();
            style.remove();
          }
        };
        document.body.appendChild(restoreBtn);
      });
    });
  }
});