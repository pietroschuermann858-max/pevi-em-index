/* =============================================
   PEVI - JavaScript Principal
   Roteamento, Acessibilidade, TTS, Animações
   ============================================= */

// ---- STATE ----
const state = {
  currentPage: 'home',
  a11y: {
    contrast: 'normal',    // normal | high
    theme: 'light',        // light | dark
    fontSize: 'normal',    // small | normal | large | xlarge
    dyslexia: false,
    motion: false,
    tts: false,
    links: false,
    cursor: false,
  },
  ttsActive: false,
  ttsUtterance: null,
};

// ---- ROUTER ----
function navigate(pageId, pushState = true) {
  const currentEl = document.querySelector('.page.active');
  const nextEl = document.getElementById('page-' + pageId);
  if (!nextEl || pageId === state.currentPage) return;

  // Exit animation
  if (currentEl) {
    if (!state.a11y.motion) {
      currentEl.classList.add('page-exit');
      setTimeout(() => {
        currentEl.classList.remove('page-exit', 'active');
        currentEl.style.display = 'none';
      }, 240);
    } else {
      currentEl.classList.remove('active');
      currentEl.style.display = 'none';
    }
  }

  // Enter animation
  setTimeout(() => {
    nextEl.style.display = 'block';
    // Force reflow
    nextEl.offsetHeight;
    nextEl.classList.add('active');
    state.currentPage = pageId;
    window.scrollTo({ top: 0, behavior: state.a11y.motion ? 'auto' : 'smooth' });
    updateNavActive(pageId);
    observeAnimations();
    if (pushState) history.pushState({ page: pageId }, '', '#' + pageId);
  }, state.a11y.motion ? 0 : 250);
}

function updateNavActive(pageId) {
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.classList.toggle('active', el.dataset.nav === pageId);
  });
}

// Handle browser back/forward
window.addEventListener('popstate', e => {
  const page = e.state?.page || 'home';
  navigate(page, false);
});

// ---- ACCESSIBILITY ENGINE ----
const a11yPanel = document.getElementById('a11y-panel');
const a11yOverlay = document.getElementById('a11y-overlay');

function openA11yPanel() {
  a11yPanel.classList.add('open');
  a11yOverlay.classList.add('open');
  a11yPanel.querySelector('.a11y-close').focus();
  document.body.style.overflow = 'hidden';
  announceToSR('Painel de acessibilidade aberto');
}

function closeA11yPanel() {
  a11yPanel.classList.remove('open');
  a11yOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

// Font Size
function setFontSize(size) {
  state.a11y.fontSize = size;
  document.documentElement.dataset.fontSize = size;
  document.querySelectorAll('.font-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.size === size);
  });
  saveA11yPrefs();
  announceToSR('Tamanho de fonte: ' + size);
}

// Contrast
function toggleContrast() {
  const isHigh = state.a11y.contrast === 'high';
  state.a11y.contrast = isHigh ? 'normal' : 'high';
  document.documentElement.dataset.contrast = isHigh ? '' : 'high';
  const btn = document.getElementById('btn-contrast');
  btn?.classList.toggle('active', !isHigh);
  saveA11yPrefs();
  announceToSR(isHigh ? 'Contraste normal ativado' : 'Alto contraste ativado');
}

// Dark Mode
function toggleDarkMode() {
  const isDark = state.a11y.theme === 'dark';
  state.a11y.theme = isDark ? 'light' : 'dark';
  document.documentElement.dataset.theme = isDark ? '' : 'dark';
  const btn = document.getElementById('btn-dark');
  btn?.classList.toggle('active', !isDark);
  saveA11yPrefs();
  announceToSR(isDark ? 'Modo claro ativado' : 'Modo escuro ativado');
}

// Dyslexia
function toggleDyslexia() {
  state.a11y.dyslexia = !state.a11y.dyslexia;
  document.documentElement.dataset.dyslexia = state.a11y.dyslexia ? 'on' : '';
  const btn = document.getElementById('btn-dyslexia');
  btn?.classList.toggle('active', state.a11y.dyslexia);
  saveA11yPrefs();
  announceToSR(state.a11y.dyslexia ? 'Fonte para dislexia ativada' : 'Fonte para dislexia desativada');
}

// Reduced Motion
function toggleMotion() {
  state.a11y.motion = !state.a11y.motion;
  document.documentElement.dataset.motion = state.a11y.motion ? 'reduced' : '';
  const btn = document.getElementById('btn-motion');
  btn?.classList.toggle('active', state.a11y.motion);
  saveA11yPrefs();
  announceToSR(state.a11y.motion ? 'Movimento reduzido ativado' : 'Movimento reduzido desativado');
}

// Link Underline
function toggleLinks() {
  state.a11y.links = !state.a11y.links;
  document.documentElement.dataset.links = state.a11y.links ? 'underline' : '';
  const btn = document.getElementById('btn-links');
  btn?.classList.toggle('active', state.a11y.links);
  saveA11yPrefs();
  announceToSR(state.a11y.links ? 'Sublinhado de links ativado' : 'Sublinhado de links desativado');
}

// Big Cursor
function toggleCursor() {
  state.a11y.cursor = !state.a11y.cursor;
  document.body.style.cursor = state.a11y.cursor ? 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 32 32\'%3E%3Cpath d=\'M0 0 L0 28 L8 20 L14 32 L18 30 L12 18 L24 18 Z\' fill=\'%232563EB\' stroke=\'white\' stroke-width=\'2\'/%3E%3C/svg%3E") 0 0, auto' : '';
  const btn = document.getElementById('btn-cursor');
  btn?.classList.toggle('active', state.a11y.cursor);
  saveA11yPrefs();
  announceToSR(state.a11y.cursor ? 'Cursor grande ativado' : 'Cursor grande desativado');
}

// Reset all
function resetA11y() {
  state.a11y = { contrast:'normal', theme:'light', fontSize:'normal', dyslexia:false, motion:false, tts:false, links:false, cursor:false };
  document.documentElement.removeAttribute('data-contrast');
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('data-dyslexia');
  document.documentElement.removeAttribute('data-motion');
  document.documentElement.removeAttribute('data-links');
  document.documentElement.dataset.fontSize = 'normal';
  document.body.style.cursor = '';
  stopTTS();
  document.querySelectorAll('.a11y-toggle, .font-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.font-btn[data-size="normal"]').forEach(b => b.classList.add('active'));
  localStorage.removeItem('pevi-a11y');
  showToast('✅ Configurações de acessibilidade redefinidas', 'success');
  announceToSR('Todas as configurações de acessibilidade foram redefinidas');
}

// Save/Load prefs
function saveA11yPrefs() {
  try { localStorage.setItem('pevi-a11y', JSON.stringify(state.a11y)); } catch(e) {}
}

function loadA11yPrefs() {
  try {
    const saved = localStorage.getItem('pevi-a11y');
    if (!saved) return;
    const prefs = JSON.parse(saved);
    Object.assign(state.a11y, prefs);
    if (prefs.contrast === 'high') document.documentElement.dataset.contrast = 'high';
    if (prefs.theme === 'dark') document.documentElement.dataset.theme = 'dark';
    if (prefs.dyslexia) document.documentElement.dataset.dyslexia = 'on';
    if (prefs.motion) document.documentElement.dataset.motion = 'reduced';
    if (prefs.links) document.documentElement.dataset.links = 'underline';
    document.documentElement.dataset.fontSize = prefs.fontSize || 'normal';
    document.querySelectorAll('.a11y-toggle').forEach(btn => {
      const id = btn.id?.replace('btn-', '');
      if (id && prefs[id]) btn.classList.add('active');
    });
    document.querySelectorAll('.font-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.size === prefs.fontSize);
    });
  } catch(e) {}
}

// ---- TEXT-TO-SPEECH ----
function toggleTTS() {
  state.a11y.tts = !state.a11y.tts;
  const btn = document.getElementById('btn-tts');
  btn?.classList.toggle('active', state.a11y.tts);

  if (state.a11y.tts) {
    announceToSR('Leitura de tela ativada. Passe o mouse sobre o texto para ouvir.');
    showToast('🔊 Leitura de tela ativada — passe o mouse sobre textos', 'info');
    addTTSListeners();
  } else {
    stopTTS();
    removeTTSListeners();
    announceToSR('Leitura de tela desativada');
    showToast('🔇 Leitura de tela desativada', 'info');
  }
  saveA11yPrefs();
}

function speakText(text) {
  if (!state.a11y.tts || !text.trim()) return;
  stopTTS();
  const utterance = new SpeechSynthesisUtterance(text.trim().substring(0, 300));
  utterance.lang = 'pt-BR';
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;
  // Try to use a Portuguese voice
  const voices = speechSynthesis.getVoices();
  const ptVoice = voices.find(v => v.lang.includes('pt'));
  if (ptVoice) utterance.voice = ptVoice;
  state.ttsUtterance = utterance;
  speechSynthesis.speak(utterance);
}

function stopTTS() {
  speechSynthesis.cancel();
  state.ttsUtterance = null;
}

let ttsHandler;
function addTTSListeners() {
  ttsHandler = e => {
    const el = e.target.closest('p,h1,h2,h3,h4,h5,h6,li,button,a,label,td,th,.card,.job-card-name,.job-card-desc');
    if (el) speakText(el.textContent);
  };
  document.addEventListener('mouseover', ttsHandler);
}
function removeTTSListeners() {
  if (ttsHandler) document.removeEventListener('mouseover', ttsHandler);
}

// ---- SR LIVE REGION ----
function announceToSR(message) {
  const region = document.getElementById('sr-announce');
  if (!region) return;
  region.textContent = '';
  setTimeout(() => { region.textContent = message; }, 50);
}

// ---- TOAST ----
function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const icons = { success:'✅', error:'❌', info:'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type]||'ℹ️'}</span><span>${message}</span>`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastIn 0.3s ease reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ---- INTERSECTION OBSERVER (scroll animations) ----
function observeAnimations() {
  const els = document.querySelectorAll('.animate-in:not(.visible)');
  if (!els.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => observer.observe(el));
}

// ---- MOBILE NAV ----
function toggleMobileNav() {
  const nav = document.getElementById('mobile-nav');
  const btn = document.getElementById('hamburger');
  nav?.classList.toggle('open');
  btn?.classList.toggle('open');
}

// ---- MODAL ----
function openModal(id) {
  const m = document.getElementById('modal-' + id);
  if (m) {
    m.classList.add('open');
    document.body.style.overflow = 'hidden';
    m.querySelector('[data-modal-close]')?.focus();
  }
}
function closeModal(id) {
  const m = document.getElementById('modal-' + id);
  if (m) {
    m.classList.remove('open');
    document.body.style.overflow = '';
  }
}
// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
});

// ---- TABS ----
function switchTab(tabGroup, tabId) {
  document.querySelectorAll(`[data-tab-group="${tabGroup}"]`).forEach(el => {
    el.classList.toggle('active', el.dataset.tab === tabId);
  });
  document.querySelectorAll(`[data-panel-group="${tabGroup}"]`).forEach(el => {
    el.style.display = el.dataset.panel === tabId ? 'block' : 'none';
  });
}

// ---- KEYBOARD NAVIGATION ----
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeA11yPanel();
    document.querySelectorAll('.modal-overlay.open').forEach(m => {
      m.classList.remove('open');
      document.body.style.overflow = '';
    });
  }
});

// ---- COUNTER ANIMATION ----
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1500;
  const start = performance.now();
  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(ease * target) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function observeCounters() {
  const counters = document.querySelectorAll('[data-target]:not(.counted)');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('counted');
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
}

// ---- SEARCH / FILTER (Vagas) ----
function filterJobs() {
  const query = document.getElementById('search-jobs')?.value.toLowerCase() || '';
  const activeFilter = document.querySelector('.filter-chip.active')?.dataset.filter || 'all';
  const cards = document.querySelectorAll('.job-card[data-categories]');
  let shown = 0;

  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    const cats = card.dataset.categories || '';
    const matchQuery = !query || text.includes(query);
    const matchFilter = activeFilter === 'all' || cats.includes(activeFilter);
    const show = matchQuery && matchFilter;
    card.style.display = show ? '' : 'none';
    if (show) shown++;
  });

  const count = document.getElementById('jobs-count');
  if (count) count.textContent = shown + ' vaga' + (shown !== 1 ? 's' : '') + ' encontrada' + (shown !== 1 ? 's' : '');
}

// ---- FORM VALIDATION ----
function validateField(input) {
  const value = input.value.trim();
  const type = input.type;
  let valid = true;
  let msg = '';

  if (input.required && !value) { valid = false; msg = 'Este campo é obrigatório'; }
  else if (type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    valid = false; msg = 'E-mail inválido';
  }
  else if (type === 'tel' && value && !/^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/.test(value.replace(/\D/g, '').replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3'))) {
    // relaxed phone validation
  }

  const hint = input.closest('.form-group')?.querySelector('.form-hint');
  if (hint) hint.style.color = valid ? '' : '#EF4444';
  if (!valid && hint) hint.textContent = msg;
  input.style.borderColor = !valid ? '#EF4444' : '';
  return valid;
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  loadA11yPrefs();
  observeAnimations();
  observeCounters();

  // Initial page from URL hash
  const hash = window.location.hash.replace('#', '');
  if (hash && document.getElementById('page-' + hash)) {
    navigate(hash, false);
  } else {
    document.getElementById('page-home')?.classList.add('active');
  }

  // Close mobile nav when clicking a link
  document.querySelectorAll('#mobile-nav .nav-link').forEach(link => {
    link.addEventListener('click', () => toggleMobileNav());
  });

  // Voices load async in some browsers
  speechSynthesis.addEventListener('voiceschanged', () => {});
});
