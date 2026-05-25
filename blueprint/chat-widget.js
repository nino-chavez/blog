/* Rally HQ Blueprint — AI chat widget
 *
 * Stakeholder exploration tool. Calls /api/chat (Vercel function) which
 * proxies to Claude with the blueprint docs preloaded as system context.
 *
 * Usage: include <script src="./chat-widget.js" defer></script> on any page.
 * No-op on pages where window.PROTO_CHAT_DISABLED is true.
 *
 * Endpoint: /api/chat — see ./api/chat.js (deployed as Vercel function).
 * Without that endpoint deployed (e.g., local file:// serving), the widget
 * shows a "not configured" message instead of attempting requests.
 */
(function () {
  if (window.PROTO_CHAT_DISABLED) return;

  function el(tag, props = {}, ...children) {
    const node = document.createElement(tag);
    Object.entries(props).forEach(([k, v]) => {
      if (k === 'class') node.className = v;
      else if (k.startsWith('on')) node.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'html') node.innerHTML = v;
      else node.setAttribute(k, v);
    });
    children.flat().forEach(c => {
      if (c == null) return;
      node.appendChild(c.nodeType ? c : document.createTextNode(c));
    });
    return node;
  }

  // ─────────────── styles (scoped) ───────────────
  const style = document.createElement('style');
  style.textContent = `
    .chat-fab {
      position: fixed;
      bottom: 90px; right: 16px;
      width: 56px; height: 56px;
      border-radius: 28px;
      background: var(--brand-600, hsl(235, 75%, 50%));
      color: white;
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      cursor: pointer;
      z-index: 45;
      transition: transform 200ms;
    }
    .chat-fab:hover { transform: scale(1.05); }
    .chat-window {
      position: fixed;
      bottom: 158px; right: 16px;
      width: min(380px, calc(100vw - 32px));
      height: min(560px, calc(100vh - 200px));
      background: white;
      border-radius: 16px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.25);
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 45;
      font-family: var(--font-body, system-ui);
    }
    .chat-window.open { display: flex; }
    .chat-header {
      background: hsl(220, 30%, 12%);
      color: white;
      padding: 14px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .chat-header strong { font-family: var(--font-display, system-ui); font-size: 15px; }
    .chat-header small { color: hsl(0, 0%, 70%); font-size: 11px; display: block; margin-top: 2px; }
    .chat-header button { color: hsl(0, 0%, 70%); font-size: 20px; cursor: pointer; background: none; border: none; }
    .chat-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      background: hsl(35, 25%, 98%);
    }
    .chat-msg {
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 14px;
      margin-bottom: 10px;
      font-size: 14px;
      line-height: 1.45;
    }
    .chat-msg.user {
      background: hsl(235, 75%, 50%);
      color: white;
      margin-left: auto;
      border-bottom-right-radius: 4px;
    }
    .chat-msg.bot {
      background: white;
      color: hsl(220, 30%, 12%);
      border: 1px solid hsl(220, 18%, 90%);
      border-bottom-left-radius: 4px;
    }
    .chat-msg.system {
      background: hsl(45, 85%, 95%);
      color: hsl(45, 85%, 25%);
      font-size: 12px;
      font-style: italic;
      text-align: center;
      max-width: 100%;
    }
    .chat-input {
      padding: 12px;
      border-top: 1px solid hsl(220, 18%, 90%);
      background: white;
      display: flex;
      gap: 8px;
    }
    .chat-input input {
      flex: 1;
      padding: 10px 12px;
      border: 1px solid hsl(220, 18%, 90%);
      border-radius: 20px;
      font: inherit;
      font-size: 14px;
    }
    .chat-input button {
      padding: 10px 16px;
      background: hsl(235, 75%, 50%);
      color: white;
      border: none;
      border-radius: 20px;
      font-weight: 600;
      cursor: pointer;
    }
    .chat-input button:disabled { opacity: 0.5; cursor: not-allowed; }
    .chat-suggestions {
      display: flex;
      gap: 6px;
      padding: 8px 12px 0;
      flex-wrap: wrap;
      background: white;
    }
    .chat-suggestions button {
      padding: 6px 10px;
      background: hsl(35, 15%, 96%);
      border: 1px solid hsl(220, 18%, 90%);
      border-radius: 16px;
      font-size: 12px;
      cursor: pointer;
      color: hsl(220, 30%, 30%);
    }
    .chat-suggestions button:hover { background: hsl(220, 25%, 98%); }
  `;
  document.head.appendChild(style);

  // ─────────────── state ───────────────
  let isOpen = false;
  let isLoading = false;
  const messages = [];
  let messagesEl, inputEl, sendBtn;

  const SUGGESTIONS = [
    "What's the biggest gap?",
    "Why per-tournament accent?",
    "How does the viral loop work?",
    "What's deferred to Phase 3?"
  ];

  // ─────────────── render ───────────────
  function renderMessage(role, text) {
    const cls = role === 'user' ? 'user' : role === 'system' ? 'system' : 'bot';
    const msg = el('div', { class: `chat-msg ${cls}` });
    msg.innerHTML = text.replace(/\n/g, '<br>');
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  async function send(text) {
    if (!text.trim() || isLoading) return;
    renderMessage('user', text);
    messages.push({ role: 'user', content: text });
    inputEl.value = '';
    isLoading = true;
    sendBtn.disabled = true;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          page: window.PROTO_PAGE?.id || 'index',
          pageTitle: window.PROTO_PAGE?.title || 'Portal'
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      renderMessage('bot', data.reply || '(empty response)');
      messages.push({ role: 'assistant', content: data.reply });
    } catch (err) {
      renderMessage('system', `Chat unavailable. ${err.message || ''} — when deployed on Vercel, the chat function will respond using the blueprint docs as context.`);
    } finally {
      isLoading = false;
      sendBtn.disabled = false;
    }
  }

  function buildWindow() {
    const fab = el('button', { class: 'chat-fab', onclick: toggle, 'aria-label': 'Open chat' }, '💬');

    const window_ = el('div', { class: 'chat-window' });

    const header = el('div', { class: 'chat-header' },
      el('div', {},
        el('strong', {}, 'Ask the blueprint'),
        el('small', {}, 'Claude has read the docs · ask anything')
      ),
      el('button', { onclick: toggle, 'aria-label': 'Close chat' }, '×')
    );

    messagesEl = el('div', { class: 'chat-messages' });

    const suggestions = el('div', { class: 'chat-suggestions' });
    SUGGESTIONS.forEach(s => {
      suggestions.appendChild(el('button', { onclick: () => send(s) }, s));
    });

    inputEl = el('input', { placeholder: 'Ask about the blueprint...', onkeydown: (e) => { if (e.key === 'Enter') send(inputEl.value); } });
    sendBtn = el('button', { onclick: () => send(inputEl.value) }, 'Send');
    const inputRow = el('div', { class: 'chat-input' }, inputEl, sendBtn);

    window_.appendChild(header);
    window_.appendChild(messagesEl);
    window_.appendChild(suggestions);
    window_.appendChild(inputRow);

    document.body.appendChild(fab);
    document.body.appendChild(window_);
    window.__chatWindow = window_;

    // Greeting
    renderMessage('bot', "I've read the blueprint docs — research synthesis, design principles, CX strategy, roadmap, gaps, and feasibility. Ask about any decision, gap, or recommendation.");
  }

  function toggle() {
    isOpen = !isOpen;
    window.__chatWindow.classList.toggle('open', isOpen);
    if (isOpen && inputEl) inputEl.focus();
  }

  document.addEventListener('DOMContentLoaded', buildWindow);
})();
