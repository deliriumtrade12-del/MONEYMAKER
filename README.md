# MONEYMAKER

A Cloudflare Workers + AI project for a multi-agent assistant dashboard.

This repository was previously storing a large embedded Worker script directly inside `README.md`. The embedded JavaScript had malformed fragments and broken event-handler syntax, which caused browser/worker parsing failures. The corrected version below keeps the project intent while restoring valid, runnable JavaScript.

## What this project does

- Hosts a browser-based chat and control panel
- Uses Cloudflare Workers AI
- Maintains worker roles and autonomous task orchestration
- Connects to GitHub and Cloudflare APIs
- Exposes REST endpoints for chat, code generation, reflection, and logs

## Corrected example source

```js
const MODEL = "@cf/meta/llama-3.2-3b-instruct";

const WORKER_ROLES = [
  { id: "w01", name: "aura-orchestrator", role: "Coordinates the entire system and assigns work between agents.", tags: ["system", "planning", "coordination", "routing"] },
  { id: "w02", name: "aura-planner", role: "Builds plans and execution strategies.", tags: ["planning", "strategy", "execution"] },
  { id: "w03", name: "aura-analyzer", role: "Analyzes context, root causes, and risks.", tags: ["analysis", "diagnostics", "research"] },
  { id: "w04", name: "aura-researcher", role: "Gathers facts and relevant context.", tags: ["research", "facts", "investigation"] }
];

async function callAI(env, messages, opts = {}) {
  if (!env.AI || typeof env.AI.run !== "function") {
    console.error("callAI: env.AI binding is missing");
    return null;
  }

  const maxAttempts = opts.retries ?? 3;
  const models = [MODEL, "@cf/meta/llama-3.1-8b-instruct-fast", "@cf/meta/llama-3.2-3b-instruct"];

  for (let attempts = 0; attempts <= maxAttempts; attempts++) {
    try {
      const modelIndex = Math.min(Math.floor(attempts / 2), models.length - 1);
      const useModel = models[modelIndex];

      const result = await env.AI.run(useModel, {
        messages,
        max_tokens: opts.max_tokens ?? 4096,
        temperature: opts.temperature ?? 0.7,
        top_p: 0.9
      });

      const text =
        (result && typeof result === "object" && (result.response || result.result || result.text || result.data)) ||
        (typeof result === "string" ? result : "");

      if (typeof text === "string" && text.trim().length > 0) {
        return text;
      }
    } catch (error) {
      console.error("AI error:", error?.message || String(error));
    }

    if (attempts === maxAttempts) {
      return null;
    }

    await new Promise((resolve) => setTimeout(resolve, 500 * (attempts + 1)));
  }

  return null;
}

function showTab(name, event) {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === name);
  });

  document.querySelectorAll(".panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === `${name}-panel`);
  });

  if (event && event.target) {
    event.target.classList.add("active");
  }
}

const msgInput = document.getElementById("msg-input");
msgInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    sendMsg();
  }
});
```

## Corrected pattern for the broken `if` statement

The malformed snippet below was the main problem:

```js
if (event.key === "Enter") {
  sendMsg();
}
```

This is the valid version of the event handler logic that should be used instead of any broken `if(ev[` fragment.

## Setup

1. Create a Cloudflare Worker project.
2. Add the Worker AI binding (`env.AI`).
3. Add any required secrets such as GitHub and Cloudflare tokens.
4. Deploy the Worker and open the generated URL.

## Notes

- Do not leave partial JavaScript fragments inside HTML event attributes.
- Always close conditions and brackets properly.
- Use `event.key === "Enter"` instead of incomplete bracket access such as `if (ev[...)`.

This cleans up the broken README content and restores valid JavaScript examples that represent the intended app behavior.
