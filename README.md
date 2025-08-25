# 🔐 Password Strength & Breach Checker

A clean Flask web app that:
- Estimates password entropy (bits of strength)
- Runs rule checks (length, diversity, sequences, repeats)
- Queries the HaveIBeenPwned (HIBP) API using **k-anonymity** to see if a password appears in public breaches

> Privacy-friendly: The full password never leaves your machine; only the first 5 chars of the SHA‑1 hash are sent to HIBP.

## 🧱 Project Structure
```
password-checker/
├─ app.py
├─ requirements.txt
├─ static/
│  ├─ styles.css
│  └─ app.js
└─ templates/
   ├─ base.html
   └─ index.html
```

## 🚀 Getting Started (Local)
1) Create a virtualenv and install deps
```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
source .venv/bin/activate
pip install -r requirements.txt
```

2) Run the dev server
```bash
python app.py
```
Open http://127.0.0.1:5000

## 🧪 What it does
- Strength meter with **entropy estimate** (length × log2(charset))
- Actionable feedback list (add uppercase, avoid repeats, avoid sequences, etc.)
- HIBP **range API** integration to return breach count safely
- UI extras: **password generator**, visibility toggle, copy button

## 🛡️ Security Notes
- Do **not** log plaintext passwords.
- This demo calls HIBP server-side using k-anonymity. For maximum privacy, you can move the SHA‑1 hashing client-side and call HIBP directly from the browser.

## 📦 Requirements
```
Flask==3.0.3
requests==2.32.3
```

## 📸 Screenshots
Add screenshots to `/assets` and embed them here.

## 🧭 Roadmap
- Add zxcvbn scoring as an additional heuristic
- Client-side SHA‑1 hash & HIBP fetch (no password touches server)
- Dockerfile for containerized deploy
