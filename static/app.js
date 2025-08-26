// ===== Helpers =====
const $ = (sel) => document.querySelector(sel);

// Theme toggle (persist)
(function initTheme(){
  const saved = localStorage.getItem('theme');
  if (saved === 'light') document.body.setAttribute('data-theme','light');
  const btn = $('#themeToggle');
  const setIcon = () => { btn.textContent = document.body.getAttribute('data-theme') === 'light' ? '🌞' : '🌙'; };
  setIcon();
  btn?.addEventListener('click', () => {
    const isLight = document.body.getAttribute('data-theme') === 'light';
    if (isLight){ document.body.removeAttribute('data-theme'); localStorage.setItem('theme','dark'); }
    else { document.body.setAttribute('data-theme','light'); localStorage.setItem('theme','light'); }
    setIcon();
  });
})();

// Web Crypto SHA-1
async function sha1Hex(str){
  const enc = new TextEncoder().encode(str);
  const buf = await (crypto.subtle || window.msCrypto?.subtle).digest('SHA-1', enc);
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('').toUpperCase();
}

// HIBP range API (client-side)
async function hibpClientCheck(password){
  const sha1 = await sha1Hex(password);
  const prefix = sha1.slice(0,5);
  const suffix = sha1.slice(5);
  const resp = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
    headers: { "Add-Padding": "true" }
  });
  if(!resp.ok) return -1;
  const text = await resp.text();
  const line = text.split('\n').find(l => l.startsWith(suffix));
  if(!line) return 0;
  const count = parseInt(line.split(':')[1]?.trim() || '0', 10);
  return isNaN(count) ? 0 : count;
}

// Entropy & rules (client-side)
function charsetSize(pw){
  const specials = "!@#$%^&*()_+-=[]{};':\",.<>/?|`~";
  let size = 0;
  if (/[a-z]/.test(pw)) size += 26;
  if (/[A-Z]/.test(pw)) size += 26;
  if (/\d/.test(pw)) size += 10;
  if (new RegExp(`[${specials.replace(/[-[\]/{}()*+?.\\^$|]/g,'\\$&')}]`).test(pw)) size += specials.length;
  return size || 1;
}
function entropyBits(pw){
  return +(pw.length * Math.log2(charsetSize(pw))).toFixed(1);
}
function ruleFeedback(pw){
  const fb = [];
  if (pw.length < 12) fb.push("Use at least 12 characters.");
  if (!/[a-z]/.test(pw)) fb.push("Add lowercase letters.");
  if (!/[A-Z]/.test(pw)) fb.push("Add uppercase letters.");
  if (!/\d/.test(pw)) fb.push("Add digits.");
  const specials = "!@#$%^&*()_+-=[]{};':\",.<>/?|`~";
  if (!new RegExp(`[${specials.replace(/[-[\]/{}()*+?.\\^$|]/g,'\\$&')}]`).test(pw)) fb.push("Add special characters.");
  if (/(.)\1{2,}/.test(pw)) fb.push("Avoid repeating the same character 3+ times.");
  const seqs = ['abcdefghijklmnopqrstuvwxyz','qwertyuiop','asdfghjkl','zxcvbnm','0123456789','0987654321'];
  const lower = pw.toLowerCase();
  const hasSeq = seqs.some(s => {
    for (let i=0;i<s.length-2;i++){
      const chunk = s.slice(i,i+3);
      if (lower.includes(chunk) || lower.includes(chunk.split('').reverse().join(''))) return true;
    }
    return false;
  });
  if (hasSeq) fb.push("Avoid common sequences or keyboard runs (e.g., 'abc', 'qwerty').");
  return fb;
}
function bucket(entropy, issues){
  if (entropy >= 80 && issues <= 1) return 'Strong';
  if (entropy >= 60 && issues <= 2) return 'Good';
  if (entropy >= 40) return 'Fair';
  return 'Weak';
}

document.addEventListener('DOMContentLoaded', () => {
  const pw = $('#password');
  const toggle = $('#togglePw');
  const genBtn = $('#genBtn');
  const copyBtn = $('#copyBtn');
  const privacy = $('#privacyMode');
  const form = document.querySelector('form');
  const liveInfo = $('#liveInfo');
  const clientResult = $('#clientResult');

  // Toggle visibility
  toggle?.addEventListener('click', () => {
    pw.type = pw.type === 'password' ? 'text' : 'password';
  });

  // Generate strong password
  genBtn?.addEventListener('click', () => {
    const len = 16;
    const lowers = 'abcdefghijklmnopqrstuvwxyz';
    const uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{};:,.<>/?|`~';
    const all = lowers + uppers + digits + symbols;
    const bytes = new Uint8Array(len);
    (window.crypto || window.msCrypto).getRandomValues(bytes);
    const picks = [
      lowers[Math.floor(Math.random()*lowers.length)],
      uppers[Math.floor(Math.random()*uppers.length)],
      digits[Math.floor(Math.random()*digits.length)],
      symbols[Math.floor(Math.random()*symbols.length)],
    ];
    for (let i=picks.length; i<len; i++) picks.push(all[bytes[i] % all.length]);
    for (let i=picks.length-1; i>0; i--){ const j = bytes[i] % (i+1); [picks[i],picks[j]] = [picks[j],picks[i]]; }
    pw.value = picks.join('');
    pw.dispatchEvent(new Event('input'));
  });

  // Copy
  copyBtn?.addEventListener('click', async () => {
    if (!pw.value) return;
    try { await navigator.clipboard.writeText(pw.value); copyBtn.textContent='Copied!'; setTimeout(()=>copyBtn.textContent='Copy',1200); }
    catch(e){ console.log('Copy failed', e); }
  });

  // Live info (entropy + quick tips) below the input (no overlap with eye)
  pw?.addEventListener('input', () => {
    const val = pw.value || '';
    if (!val){ liveInfo.textContent = ''; return; }
    const ent = entropyBits(val);
    const tips = ruleFeedback(val);
    liveInfo.textContent = `Entropy: ${ent} bits${tips.length ? ' • Tips: ' + tips.slice(0,2).join(' | ') + (tips.length>2?' …':'') : ''}`;
  });

  // Client-side submit (privacy ON)
  form?.addEventListener('submit', async (e) => {
    if (!privacy?.checked) return; // let server handle fallback
    e.preventDefault();
    const val = pw.value || '';
    clientResult.innerHTML = '';

    const ent = entropyBits(val);
    const tips = ruleFeedback(val);
    const issues = tips.length;
    const buck = bucket(ent, issues);
    const pct = buck === 'Strong' ? 100 : buck === 'Good' ? 75 : buck === 'Fair' ? 50 : 25;

    // Breach check
    let breaches = -1;
    try { breaches = await hibpClientCheck(val); } catch {}

    clientResult.innerHTML = `
      <section class="result" style="margin-top:12px;">
        <div class="meter"><div class="meter-bar ${buck.toLowerCase()}" style="width:${pct}%"></div></div>
        <div class="stats">
          <div><strong>Strength:</strong> ${buck}</div>
          <div><strong>Entropy:</strong> ${ent} bits</div>
          <div><strong>Length:</strong> ${val.length}</div>
          ${breaches > 0
            ? `<div class="bad"><strong>Breached:</strong> Found ${breaches} times (choose a new password).</div>`
            : breaches === 0
              ? `<div class="good"><strong>Breached:</strong> Not found.</div>`
              : `<div><strong>Breached:</strong> Could not check (API error).</div>`}
        </div>
        ${tips.length ? `<h3>How to improve</h3><ul class="feedback">${tips.map(t=>`<li>• ${t}</li>`).join('')}</ul>` : ''}
      </section>
    `;
  });
});
