🔐 Password Strength & Breach Checker

📖 About the Project

This project is a cybersecurity-focused web application that evaluates the strength and safety of passwords. It combines entropy-based analysis and rule-based validation with real-world breach verification using the Have I Been Pwned (HIBP) API.

To protect user privacy, the application implements a Privacy Mode, where password hashing and breach checks are performed entirely on the client side. Only a partial hash prefix is shared with HIBP, ensuring that the password itself never leaves the user’s device. A server-side fallback is also available if client-side checks are disabled.

The project was built with Python (Flask) for backend logic and JavaScript/HTML/CSS for frontend design, and includes usability features such as a password generator, copy-to-clipboard support, visibility toggle, and a light/dark theme.
