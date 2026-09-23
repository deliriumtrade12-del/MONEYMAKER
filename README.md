# MONEYMAKER

MONEYMAKER is a lightweight Cloudflare Worker app that serves a chat interface and uses Cloudflare AI for simple responses.

## Features

- Minimal browser-based chat UI
- Uses the `env.AI` binding for inference
- Serves the app from a single Worker
- Includes a health endpoint

## Run locally

1. Install dependencies:
   npm install

2. Start the dev server:
   npm run dev

3. Open your local Wrangler URL (usually http://localhost:8787)

## Deploy

npm run deploy

## Cloudflare setup

In `wrangler.toml`, the app expects an AI binding:

```toml
[ai]
binding = "AI"
```

If your Cloudflare account does not support AI bindings, the app will still serve the UI and return a friendly error from the `/api/chat` endpoint.
