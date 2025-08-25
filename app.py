from flask import Flask, render_template, request
import math, re, hashlib, requests

app = Flask(__name__)

SPECIALS = r"!@#$%^&*()_+\-=[]{};':\",.<>/?\\|`~"
SEQUENCES = ["abcdefghijklmnopqrstuvwxyz", "qwertyuiop", "asdfghjkl", "zxcvbnm",
             "0123456789", "0987654321"]

def charset_size(pw: str) -> int:
    size = 0
    checks = [
        (re.search(r"[a-z]", pw), 26),
        (re.search(r"[A-Z]", pw), 26),
        (re.search(r"\d", pw), 10),
        (re.search(f"[{{re.escape(SPECIALS)}}]", pw), len(SPECIALS)),
    ]
    for cond, inc in checks:
        if cond:
            size += inc
    return size if size else 1

def estimate_entropy_bits(pw: str) -> float:
    return len(pw) * math.log2(charset_size(pw))

def has_sequence(pw: str) -> bool:
    # Check substrings of length >= 3 against known sequences and their reverses
    for seq in SEQUENCES:
        for i in range(len(seq)-2):
            chunk = seq[i:i+3]
            if chunk in pw:
                return True
        rseq = seq[::-1]
        for i in range(len(rseq)-2):
            chunk = rseq[i:i+3]
            if chunk in pw:
                return True
    return False

def rule_feedback(pw: str):
    fb = []
    if len(pw) < 12:
        fb.append("Use at least 12 characters.")
    if not re.search(r"[a-z]", pw):
        fb.append("Add lowercase letters.")
    if not re.search(r"[A-Z]", pw):
        fb.append("Add uppercase letters.")
    if not re.search(r"\d", pw):
        fb.append("Add digits.")
    if not re.search(f"[{{re.escape(SPECIALS)}}]", pw):
        fb.append("Add special characters.")
    if re.search(r"(.)\1{2,}", pw):
        fb.append("Avoid repeating the same character 3+ times.")
    if has_sequence(pw.lower()):
        fb.append("Avoid common sequences or keyboard runs (e.g., 'abc', 'qwerty').")
    return fb

def strength_bucket(entropy_bits: float, fb_count: int):
    # Heuristic: combine entropy and number of issues
    if entropy_bits >= 80 and fb_count <= 1:
        return "Strong"
    if entropy_bits >= 60 and fb_count <= 2:
        return "Good"
    if entropy_bits >= 40:
        return "Fair"
    return "Weak"

def hibp_breach_count(pw: str) -> int:
    # HIBP k-anonymity: send only first 5 chars of SHA1
    sha1 = hashlib.sha1(pw.encode("utf-8")).hexdigest().upper()
    prefix, suffix = sha1[:5], sha1[5:]
    url = f"https://api.pwnedpasswords.com/range/{prefix}"
    headers = {"User-Agent": "Vibhor-PasswordChecker/1.0"}
    try:
        resp = requests.get(url, headers=headers, timeout=8)
        if resp.status_code != 200:
            return -1  # error condition
        for line in resp.text.splitlines():
            hash_suffix, count = line.split(":")
            if hash_suffix.strip() == suffix:
                return int(count.strip())
        return 0
    except Exception:
        return -1

@app.route("/", methods=["GET", "POST"])
def index():
    result = None
    if request.method == "POST":
        pw = request.form.get("password", "")
        if not pw:
            result = {"error": "Please enter a password."}
        else:
            fb = rule_feedback(pw)
            entropy = round(estimate_entropy_bits(pw), 1)
            bucket = strength_bucket(entropy, len(fb))
            breaches = hibp_breach_count(pw)
            result = {
                "entropy": entropy,
                "bucket": bucket,
                "feedback": fb,
                "breaches": breaches,
                "length": len(pw)
            }
    return render_template("index.html", result=result)

if __name__ == "__main__":
    # Dev server settings
    app.run(host="127.0.0.1", port=5000, debug=True)
