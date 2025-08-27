# 🔐 Password Strength & Breach Checker  

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)  
[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)  
[![Flask](https://img.shields.io/badge/Flask-Framework-black.svg)](https://flask.palletsprojects.com/)  
[![Render](https://img.shields.io/badge/Deployed%20on-Render-purple.svg)](https://password-checker-nrzg.onrender.com/)  

---

## 📖 About the Project  
This is a **cybersecurity-focused web application** that evaluates the **strength and safety of passwords**.  
It combines **entropy analysis**, **rule-based validation**, and **real-world breach verification** via the [Have I Been Pwned (HIBP)](https://haveibeenpwned.com/API/v3#PwnedPasswords) API.  

To protect user privacy, the app features a **Privacy Mode** (default ON), where password hashing and breach checks happen entirely in the browser. Only a partial hash prefix is shared with HIBP (k-anonymity model). A **server-side fallback** ensures functionality in all environments.  

---

## ✨ Features  
- 🔑 **Entropy Analysis** – estimates password strength in bits  
- ⚖️ **Rule-Based Feedback** – highlights weaknesses and suggests fixes  
- 🛡️ **HIBP Breach Verification** – checks if a password appears in public leaks  
- 🔒 **Privacy Mode** – password never leaves your device (client-side SHA-1 hashing)  
- 🌗 **Light/Dark Theme** toggle with preference saving  
- 🧩 **Password Generator** – creates strong random passwords  
- 📋 **Copy-to-Clipboard** and 👁️ **Visibility Toggle**  

---

## 🌐 Live Demo  
👉 [Password Strength & Breach Checker (Render)](https://password-checker-nrzg.onrender.com/)  

---

## 📌 Learning Outcomes  
This project demonstrates:  
- Secure password handling with **privacy-by-design**  
- Integration of real-world cybersecurity datasets and APIs  
- Application of **cryptographic concepts** (entropy, k-anonymity)  
- Full-stack implementation using **Flask + JavaScript/HTML/CSS**  
- Designing a **user-friendly, security-conscious UI**  

---

## 📜 License  
This project is licensed under the [MIT License](LICENSE).  
