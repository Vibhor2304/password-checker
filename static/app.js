// UI: toggle visibility, generate password, copy
const $ = (sel) => document.querySelector(sel);

document.addEventListener('DOMContentLoaded', () => {
  const pw = $('#password');
  const toggle = $('#togglePw');
  const genBtn = $('#genBtn');
  const copyBtn = $('#copyBtn');

  toggle?.addEventListener('click', () => {
    pw.type = pw.type === 'password' ? 'text' : 'password';
  });

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

    for (let i = picks.length; i < len; i++) {
      picks.push(all[bytes[i] % all.length]);
    }
    for (let i = picks.length - 1; i > 0; i--) {
      const j = bytes[i] % (i + 1);
      [picks[i], picks[j]] = [picks[j], picks[i]];
    }
    pw.value = picks.join('');
  });

  copyBtn?.addEventListener('click', async () => {
    if (!pw.value) return;
    try {
      await navigator.clipboard.writeText(pw.value);
      copyBtn.textContent = 'Copied!';
      setTimeout(() => (copyBtn.textContent = 'Copy'), 1200);
    } catch (e) {
      console.log('Copy failed', e);
    }
  });
});
