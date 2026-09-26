# LawAI

LawAI is an intelligent AI Legal Assistant designed to help you understand, compare, and navigate legal documents. 

## Features

- **Understand**: Translates complex legal text into simple, 8th-grade level plain English, explicitly highlighting any hidden risks or liabilities for the user.
- **Compare**: Upload two separate legal documents to identify key differences and discover which document favors the user more.
- **Navigate**: A sticky chat interface allows you to ask specific follow-up questions about your uploaded documents for deep-dive analysis.

## Architecture

- **Frontend**: Built with Next.js, React, and Tailwind CSS.
- **Backend**: Native Netlify serverless functions (`netlify/functions`).
- **AI Engine**: Google's Gemini API (Gemini Flash model) handles all intelligent analysis and document comparisons.

## Security

LawAI implements several strict security measures:
- **Rate Limiting**: IP-based rate limiting (via Netlify Blobs) prevents API abuse.
- **Anti-Replay Tokens**: HMAC-signed tokens authenticate frontend requests and protect the backend from replay attacks.
- **Content-Security-Policy (CSP)**: Strict headers are configured in Next.js to mitigate cross-site scripting (XSS) and injection attacks.
