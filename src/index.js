const APP_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MONEYMAKER</title>
    <style>
      :root {
        --bg: #07111f;
        --panel: #0d1e2d;
        --panel-strong: #12293d;
        --primary: #7dd3fc;
        --primary-strong: #38bdf8;
        --text: #e2e8f0;
        --muted: #94a3b8;
        --border: #1e3a5f;
        --success: #22c55e;
        --danger: #ef4444;
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        font-family: Arial, sans-serif;
        background: linear-gradient(180deg, #020817 0%, #0b1320 100%);
        color: var(--text);
        min-height: 100vh;
      }

      .shell {
        max-width: 980px;
        margin: 0 auto;
        padding: 32px 16px 40px;
      }

      .topbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        margin-bottom: 24px;
      }

      h1 {
        margin: 0;
        font-size: clamp(2rem, 4vw, 3rem);
      }

      .badge {
        padding: 8px 12px;
        border-radius: 999px;
        border: 1px solid var(--border);
        background: rgba(125, 211, 252, 0.08);
        color: var(--primary);
        font-size: 0.8rem;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }

      .chat-box {
        background: rgba(15, 23, 42, 0.9);
        border: 1px solid var(--border);
        border-radius: 18px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
      }

      .messages {
        min-height: 360px;
        max-height: 520px;
        overflow-y: auto;
        padding: 18px;
        background: rgba(2, 6, 23, 0.56);
      }

      .message {
        margin: 12px 0;
        padding: 14px 16px;
        border-radius: 12px;
        line-height: 1.5;
        max-width: 85%;
      }

      .message.user {
        margin-left: auto;
        background: linear-gradient(135deg, #0f766e 0%, #155e75 100%);
        border-bottom-right-radius: 4px;
      }

      .message.assistant {
        background: rgba(30, 41, 59, 0.95);
        border: 1px solid rgba(148, 163, 184, 0.15);
        border-bottom-left-radius: 4px;
      }

      .composer {
        display: flex;
        gap: 12px;
        padding: 16px;
        border-top: 1px solid var(--border);
        background: rgba(15, 23, 42, 0.86);
      }

      input {
        flex: 1;
        background: rgba(15, 23, 42, 0.75);
        color: var(--text);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 14px 16px;
        font-size: 1rem;
      }

      input:focus {
        outline: 2px solid rgba(125, 211, 252, 0.35);
        border-color: var(--primary);
      }

      button {
        border: none;
        border-radius: 12px;
        padding: 14px 18px;
        font-weight: 700;
        background: linear-gradient(135deg, var(--primary-strong), #2563eb);
        color: #04121d;
        cursor: pointer;
      }

      button:disabled {
        cursor: wait;
        opacity: 0.7;
      }

      .status {
        color: var(--muted);
        font-size: 0.85rem;
        margin-top: 12px;
      }
    </style>
  </head>
  <body>
    <div class="shell">
      <div class="topbar">
        <h1>MONEYMAKER</h1>
        <div class="badge">Cloudflare Worker</div>
      </div>

      <div class="chat-box">
        <div id="messages" class="messages" aria-live="polite"></div>
        <div class="composer">
          <input id="prompt" type="text" placeholder="Ask MONEYMAKER something..." />
          <button id="sendBtn" type="button">Send</button>
        </div>
      </div>
      <div id="status" class="status">Ready.</div>
    </div>

    <script>
      const messagesEl = document.getElementById('messages');
      const inputEl = document.getElementById('prompt');
      const sendBtn = document.getElementById('sendBtn');
      const statusEl = document.getElementById('status');

      function addMessage(role, text) {
        const div = document.createElement('div');
        div.className = `message ${role}`;
        div.textContent = text;
        messagesEl.appendChild(div);
        messagesEl.scrollTop = messagesEl.scrollHeight;
      }

      function setStatus(text) {
        statusEl.textContent = text;
      }

      async function sendMessage() {
        const prompt = inputEl.value.trim();
        if (!prompt) return;

        addMessage('user', prompt);
        inputEl.value = '';
        setStatus('Thinking...');
        sendBtn.disabled = true;

        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: prompt })
          });

          const data = await response.json();
          const reply = data.reply || data.error || 'No response received.';

          addMessage('assistant', reply);
          setStatus(response.ok ? 'Ready.' : 'Error.');
        } catch (error) {
          addMessage('assistant', 'Something went wrong while contacting the Worker.');
          setStatus('Error.');
        } finally {
          sendBtn.disabled = false;
          inputEl.focus();
        }
      }

      sendBtn.addEventListener('click', sendMessage);
      inputEl.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          sendMessage();
        }
      });

      addMessage('assistant', 'Hello! I am MONEYMAKER. Ask me anything.');
    </script>
  </body>
</html>`;

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

function parseAIReply(result) {
  if (!result) {
    return 'No response was produced.';
  }

  if (typeof result === 'string') {
    return result;
  }

  if (typeof result.response === 'string') {
    return result.response;
  }

  if (typeof result.result === 'string') {
    return result.result;
  }

  if (Array.isArray(result.response)) {
    return result.response.map((item) => item?.text || item?.content || '').filter(Boolean).join('\n');
  }

  if (Array.isArray(result.result)) {
    return result.result.map((item) => item?.text || item?.content || '').filter(Boolean).join('\n');
  }

  if (Array.isArray(result?.output)) {
    return result.output
      .map((item) => item?.text || item?.content || '')
      .filter(Boolean)
      .join('\n');
  }

  if (result?.choices?.[0]?.message?.content) {
    return result.choices[0].message.content;
  }

  return 'I generated a response, but it was not in the expected format.';
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    if (url.pathname === '/api/health') {
      return jsonResponse({ ok: true, app: 'MONEYMAKER' });
    }

    if (url.pathname === '/api/chat' && request.method === 'POST') {
      try {
        const body = await request.json();
        const message = typeof body?.message === 'string' ? body.message.trim() : '';

        if (!message) {
          return jsonResponse({ error: 'A message is required.' }, 400);
        }

        if (!env.AI || typeof env.AI.run !== 'function') {
          return jsonResponse({
            reply: 'AI is not configured yet. Add the Cloudflare AI binding and redeploy.'
          });
        }

        const aiResponse = await env.AI.run('@cf/meta/llama-3.2-3b-instruct', {
          messages: [
            {
              role: 'system',
              content: 'You are MONEYMAKER, a helpful and concise assistant.'
            },
            {
              role: 'user',
              content: message
            }
          ],
          max_tokens: 512,
          temperature: 0.7,
          top_p: 0.9
        });

        return jsonResponse({ reply: parseAIReply(aiResponse) });
      } catch (error) {
        return jsonResponse({ error: error.message || 'Unknown error' }, 500);
      }
    }

    return new Response(APP_HTML, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      }
    });
  }
};
