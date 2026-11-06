(() => {
  'use strict';
  const root = document.documentElement;
  if (root.dataset.redirecting === 'true') return;
  const spanish = root.lang === 'es-MX';
  const systemMode = window.matchMedia('(prefers-color-scheme: dark)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const iconAnimations = new WeakMap();
  const read = (key) => { try { return sessionStorage.getItem(key); } catch { return null; } };
  const write = (key, value) => { try { sessionStorage.setItem(key, value); } catch { /* The page also works without storage. */ } };
  const savedTheme = fitxFatThemes.findIndex(theme => theme.id === read('fitxfat.site.theme'));
  const keepTheme = read('fitxfat.site.keepTheme') === '1';
  write('fitxfat.site.keepTheme', '');
  let themeIndex = (root.dataset.page === 'landing' && !keepTheme) || savedTheme < 0
    ? Math.floor(Math.random() * fitxFatThemes.length) : savedTheme;
  const savedMode = read('fitxfat.site.appearance');
  let explicitMode = ['light', 'dark'].includes(savedMode) ? savedMode : null;
  const appearance = () => explicitMode || (systemMode.matches ? 'dark' : 'light');

  function apply(animateTheme = false) {
    const theme = fitxFatThemes[themeIndex];
    const mode = appearance();
    const colors = theme[mode];
    root.dataset.theme = theme.id;
    root.dataset.appearance = mode;
    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--cta', colors.cta);
    root.style.setProperty('--cta-text', colors.foreground);
    root.style.setProperty('--theme-surface', colors.surface);
    write('fitxfat.site.theme', theme.id);
    document.querySelectorAll('[data-app-icon]').forEach(image => {
      const source = `/assets/icons/${theme.id}-${mode}.png`;
      if (image.getAttribute('src') !== source) {
        iconAnimations.get(image)?.cancel();
        image.onload = animateTheme && !reducedMotion.matches && typeof image.animate === 'function' ? () => {
          iconAnimations.set(image, image.animate([{ opacity: .5 }, { opacity: 1 }], { duration: 260, easing: 'ease-out' }));
        } : null;
        image.src = source;
      }
    });
    document.querySelectorAll('[data-theme-name]').forEach(label => { label.textContent = spanish ? theme.nameEsMX : theme.name; });
    const favicon = document.getElementById('site-icon');
    if (favicon) favicon.href = `/assets/icons/${theme.id}-${mode}.png`;
    const browserColor = document.querySelector('meta[name="theme-color"]');
    if (browserColor) browserColor.content = colors.cta;
    document.querySelectorAll('[data-toggle-mode]').forEach(button => {
      const next = mode === 'dark' ? 'light' : 'dark';
      button.setAttribute('aria-label', spanish ? 'Modo oscuro' : 'Dark mode');
      button.setAttribute('aria-checked', String(mode === 'dark'));
      button.title = spanish ? `Cambiar al modo ${next === 'dark' ? 'oscuro' : 'claro'}` : `Switch to ${next} mode`;
      button.hidden = false;
    });
  }

  // Apply colors before the body is painted; bind controls once it exists.
  apply();
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-cycle-theme]').forEach(button => {
      button.addEventListener('click', () => {
        themeIndex = (themeIndex + 1) % fitxFatThemes.length;
        apply(true);
      });
    });
    document.querySelectorAll('[data-toggle-mode]').forEach(button => {
      button.addEventListener('click', () => {
        explicitMode = appearance() === 'dark' ? 'light' : 'dark';
        write('fitxfat.site.appearance', explicitMode);
        apply();
      });
    });
    apply();
  });
  systemMode.addEventListener('change', () => { if (!explicitMode) apply(); });
})();
