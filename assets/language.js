(() => {
  'use strict';
  const root = document.documentElement;
  const supported = ['en', 'es-MX'];
  const read = key => { try { return sessionStorage.getItem(key); } catch { return null; } };
  const write = (key, value) => { try { sessionStorage.setItem(key, value); } catch { /* Explicit language URLs still work. */ } };
  const requested = new URLSearchParams(location.search).get('lang');
  const explicit = supported.includes(requested) ? requested : null;
  const saved = read('fitxfat.site.language');
  const browserLanguage = (navigator.languages || [navigator.language]).map(value => String(value).toLowerCase().split('-')[0]).find(value => value === 'en' || value === 'es');
  const current = root.lang === 'es-MX' ? 'es-MX' : 'en';
  // Direct Spanish links are intentional; unselected English entry points detect the browser language.
  const preferred = explicit || (current === 'es-MX' ? current : supported.includes(saved) ? saved : browserLanguage === 'es' ? 'es-MX' : 'en');
  if (explicit) write('fitxfat.site.language', explicit);
  if (preferred !== current) {
    root.dataset.redirecting = 'true';
    const page = root.dataset.page === 'privacy' ? 'privacy/' : '';
    location.replace((preferred === 'es-MX' ? '/es/' : '/') + page + (preferred === 'en' ? '?lang=en' : '') + location.hash);
    return;
  }
  document.addEventListener('DOMContentLoaded', () => {
    const menus = [...document.querySelectorAll('.language-menu')];
    document.addEventListener('click', event => {
      menus.forEach(menu => { if (menu.open && !menu.contains(event.target)) menu.open = false; });
    });
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      menus.forEach(menu => {
        if (menu.open) {
          menu.open = false;
          menu.querySelector('summary').focus();
          event.preventDefault();
        }
      });
    });
    document.querySelectorAll('[data-language-link]').forEach(link => {
      link.addEventListener('click', () => {
        const language = link.dataset.languageLink;
        if (supported.includes(language)) {
          write('fitxfat.site.language', language);
          write('fitxfat.site.keepTheme', '1');
        }
      });
    });
  });
})();
