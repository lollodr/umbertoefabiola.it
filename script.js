/* ═══════════════════════════════════════════════════════
   wedding/script.js
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CONFIGURAZIONE — modifica questi valori:
   ─────────────────────────────────────── */

const CONFIG = {
  // Data del matrimonio — formato: 'YYYY-MM-DD HH:MM:SS'
  // ↓ Cambia con la tua data reale ↓
  weddingDate: '2026-09-26 11:00:00',

  // Nomi degli sposi
  groomName:  'Umberto',
  brideName:  'Fabiola',

  // Etichetta data visibile nella pagina (es. "Sabato · 14 Giugno 2026")
  weddingDateLabel: 'Sabato · 26 Settembre 2026',
};

/* ═══════════════════════════════════════════════════════
   COUNTDOWN TIMER
════════════════════════════════════════════════════════ */
(function initCountdown() {
  const target = new Date(CONFIG.weddingDate).getTime();

  const elDays    = document.getElementById('cd-days');
  const elHours   = document.getElementById('cd-hours');
  const elMinutes = document.getElementById('cd-minutes');
  const elSeconds = document.getElementById('cd-seconds');
  const elCountdown = document.getElementById('countdown');
  const elPast    = document.getElementById('countdown-past');

  if (!elDays || !elHours || !elMinutes || !elSeconds) return;

  // Pad number to two digits
  function pad(n) {
    return String(Math.max(0, n)).padStart(2, '0');
  }

  // Animate number change with a brief scale pulse
  function setNum(el, val) {
    const padded = pad(val);
    if (el.textContent !== padded) {
      el.textContent = padded;
      //el.classList.remove('tick');
      // Trigger reflow so the class re-adds cleanly
      //void el.offsetWidth;
      //el.classList.add('tick');
      //setTimeout(() => el.classList.remove('tick'), 200);
    }
  }

  function tick() {
    const now  = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      // Wedding day has arrived!
      setNum(elDays,    0);
      setNum(elHours,   0);
      setNum(elMinutes, 0);
      setNum(elSeconds, 0);

      if (elCountdown) elCountdown.setAttribute('aria-hidden', 'true');
      if (elPast)      elPast.removeAttribute('hidden');
      return; // stop ticking
    }

    const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    setNum(elDays,    days);
    setNum(elHours,   hours);
    setNum(elMinutes, minutes);
    setNum(elSeconds, seconds);

    setTimeout(tick, 1000);
  }

  tick();
})();


/* ═══════════════════════════════════════════════════════
   POPULATE LABELS FROM CONFIG
════════════════════════════════════════════════════════ */
(function populateLabels() {
  // Wedding date label in header eyebrow
  const elDateLabel = document.getElementById('wedding-date-label');
  if (elDateLabel && CONFIG.weddingDateLabel) {
    elDateLabel.textContent = CONFIG.weddingDateLabel;
  }

  // Footer year
  const elFooterDate = document.getElementById('footer-date');
  if (elFooterDate) {
    const year = new Date(CONFIG.weddingDate).getFullYear();
    elFooterDate.textContent = year;
  }
})();


/* ═══════════════════════════════════════════════════════
   STICKY NAV — add shadow on scroll
════════════════════════════════════════════════════════ */
(function stickyNav() {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      nav.style.boxShadow = entry.isIntersecting
        ? 'none'
        : '0 2px 16px rgba(42, 30, 20, 0.08)';
    },
    { rootMargin: '-1px 0px 0px 0px', threshold: [1] }
  );

  // Observe a sentinel element just above the nav
  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'height:1px;pointer-events:none;';
  nav.parentNode.insertBefore(sentinel, nav);
  observer.observe(sentinel);
})();

(function stickyCountdown() {
  const cd = document.querySelector('.countdown-section');
  if (!cd) return;

  const observer = new IntersectionObserver(
    ([entry]) => cd.classList.toggle('is-sticky', !entry.isIntersecting),
    { rootMargin: '-44px 0px 0px 0px', threshold: 0 }
  );

  // Sentinel: un div invisibile appena sopra il countdown
  const sentinel = document.createElement('div');
  cd.parentNode.insertBefore(sentinel, cd);
  observer.observe(sentinel);
})();


(function scrollSpy() {
  const sections = document.querySelectorAll('section[id], header[id]');
  const links    = document.querySelectorAll('.nav-link');
  const offset   = 140; // distanza in pixel dal top per attivare la sezione

  function activate() {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - offset) {
        current = sec.id;
      }
    });
    links.forEach(link => {
      const isActive = link.getAttribute('href') === '#' + current;
      link.classList.toggle('active', isActive);
      if (isActive) link.setAttribute('aria-current', 'page');
      else          link.removeAttribute('aria-current');
    });
  }

  window.addEventListener('scroll', activate, { passive: true });
  activate(); // esegui subito al caricamento
})();


(function backToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  // mostra il pulsante dopo 300px di scroll
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 300);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

(function rsvpForm() {
  emailjs.init('jtAjiXpWP4nk132E5');

  const form    = document.getElementById('rsvp-form');
  const success = document.getElementById('rsvp-success');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // ── VALIDAZIONI ──────────────────────────────────
    const nome      = form.querySelector('[name="nome"]')?.value.trim();
    const email     = form.querySelector('[name="email"]')?.value.trim();
    const partecipa = form.querySelector('[name="partecipa"]:checked')?.value;
    const persone   = parseInt(form.querySelector('[name="persone"]')?.value) || 0;

    let errMsg = '';

    if (!nome) {
      errMsg = 'Per favore inserisci il tuo nome.';
    } else if (!partecipa) {
      errMsg = 'Per favore indica se partecipi o no.';
    } else if (partecipa === 'Sì, ci sarò!' && persone < 1) {
      errMsg = 'Non sono ammessi bambini non accompagnati!';
    } else if (!email) {
      errMsg = 'Per favore inserisci un indirizzo email valido.';
    }

    if (errMsg) {
      // Mostra o aggiorna il messaggio di errore
      let err = document.getElementById('form-error');
      if (!err) {
        err = document.createElement('p');
        err.id = 'form-error';
        err.style.cssText = 'color:#a13544; font-size:0.875rem; text-align:center; font-style:italic;';
        form.querySelector('.rsvp-submit').insertAdjacentElement('beforebegin', err);
      }
      err.textContent = errMsg;
      return; // blocca l'invio
    }

    // Rimuovi eventuale errore precedente
    document.getElementById('form-error')?.remove();

    const btn = form.querySelector('.rsvp-submit');
    btn.textContent = 'Invio in corso…';
    btn.disabled = true;

    emailjs.sendForm('service_c4nufsx', 'template_e0k58df', form)
      .then(() => {
        const partecipa = document.querySelector('[name="partecipa"]:checked')?.value;
        const nome      = document.querySelector('[name="nome"]')?.value.trim();

        const msgSi  = `✦ Non vediamo l'ora di festeggiare con te, ${nome}! ✦`;
        const msgNo  = `Grazie ${nome}, ci mancherai! Saremo con te nel pensiero. ✦`;

        form.style.display = 'none';

        if (success) {
          success.textContent = partecipa === 'Sì, ci sarò!' ? msgSi : msgNo;
          success.removeAttribute('hidden');
        }
        // Scrolla alla sezione RSVP
        document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      })
      .catch(() => {
        btn.textContent = 'Errore, riprova';  
        btn.disabled = false;
      });
  });
})();

(function rsvpToggleFields() {
  const radios      = document.querySelectorAll('[name="partecipa"]');
  const toToggle    = [
    document.getElementById('rsvp-persone'),
    document.getElementById('rsvp-bambini'),
    document.getElementById('rsvp-intolleranze'),
  ];

  function update() {
    const selected = document.querySelector('[name="partecipa"]:checked')?.value;

    toToggle.forEach(el => {
      if (!el) return;
      if (selected === 'Sì, ci sarò!') {
        el.disabled = false;
        el.closest('.field')?.classList.remove('field--disabled');
      } else {
        el.disabled = true;
        el.closest('.field')?.classList.add('field--disabled');
      }
    });
  }

  radios.forEach(r => r.addEventListener('change', update));
})();

(function validateEmail() {
  const emailEl = document.getElementById('rsvp-email');
  if (!emailEl) return;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function showError() {
    if (emailEl.disabled) return; // non validare se disabilitato
    const val = emailEl.value.trim();
    let err = document.getElementById('email-error');

    if (!emailRegex.test(val) && val !== '') {
      emailEl.style.borderColor = '#a13544';
      if (!err) {
        err = document.createElement('p');
        err.id = 'email-error';
        err.style.cssText = 'color:#a13544; font-size:0.75rem; margin-top:4px;';
        emailEl.parentNode.appendChild(err);
      }
      err.textContent = 'Inserisci un indirizzo email valido.';
    } else {
      emailEl.style.borderColor = '';
      err?.remove();
    }
  }

  // Valida quando esce dal campo
  emailEl.addEventListener('blur', showError);

  // Rimuovi errore mentre sta scrivendo (se era già comparso)
  emailEl.addEventListener('input', () => {
    const err = document.getElementById('email-error');
    if (err) showError();
  });
})();

(function revealSections() {
  const sections = document.querySelectorAll('.page-section');
  if (!sections.length) return;

  function check() {
    const windowBottom = window.scrollY + window.innerHeight;

    sections.forEach(section => {
      // if (section.classList.contains('visible')) return; // già visibile, salta

      const sectionTop = section.getBoundingClientRect().top + window.scrollY;

      // Diventa visibile quando il top della sezione entra nel viewport
      if (windowBottom > sectionTop + 400) { // 400px = margine di anticipo
        section.classList.add('visible');
      } else {
        section.classList.remove('visible');
      }
    });
  }

  window.addEventListener('scroll', check, { passive: true });
  check(); // controlla subito al caricamento
})();