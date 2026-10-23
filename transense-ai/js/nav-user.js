(() => {
  const page = location.pathname.split('/').pop() || 'index.html';
  const wrap = document.querySelector('.nav-user-wrap');
  const trigger = wrap?.querySelector('.nav-user-trigger');
  const dropdown = wrap?.querySelector('.user-dropdown');
  const navbar = document.querySelector('.navbar');
  const nav = document.querySelector('.nav-links');
  const logged = localStorage.getItem('isLoggedIn') === 'true';
  const storedUserName = localStorage.getItem('userName') || 'Người dùng';

  const savedTheme = localStorage.getItem('transenseTheme');
  const systemTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const theme = (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : systemTheme;

  const themeIcons = {
    light: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.5 1.5m11.2 11.2 1.5 1.5M2 12h2m16 0h2M4.9 19.1l1.5-1.5M17.6 6.4l1.5-1.5"/></svg>`,
    dark: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 14.2A8.7 8.7 0 0 1 9.8 3.5a9 9 0 1 0 10.7 10.7Z"/></svg>`
  };
  const applyTheme = (value) => {
    document.documentElement.dataset.theme = value;
    document.querySelectorAll('.menu-theme-icon').forEach(icon => {
      icon.innerHTML = themeIcons[value] || themeIcons.light;
    });
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.setAttribute('aria-checked', String(value === 'light'));
      btn.setAttribute('aria-label', value === 'light'
        ? 'Đang bật chế độ sáng. Nhấn để chuyển sang tối'
        : 'Đang bật chế độ tối. Nhấn để chuyển sang sáng');
    });
    document.querySelectorAll('.theme-mode-name').forEach(el => {
      el.textContent = value === 'light' ? 'Sáng' : 'Tối';
    });
  };
  applyTheme(theme);

  document.querySelectorAll('.nav-page').forEach(a => {
    const navTarget = a.dataset.nav;
    const current = page || 'index.html';
    a.classList.toggle('active', navTarget === current || (!page && navTarget === 'index.html'));
  });

  document.querySelectorAll('.demo-badge').forEach(el => {
    el.style.display = 'none';
  });

  if (navbar) navbar.classList.toggle('guest-mode', !logged);
  if (document.body) document.body.classList.toggle('guest-mode', !logged);

  const historyLink = document.querySelector('.nav-page[data-nav="history.html"]');
  const profileLinks = document.querySelectorAll('a[href="profile.html"]');

  if (!logged) {
    if (page === 'history.html' || page === 'profile.html') {
      window.location.href = 'login.html';
      return;
    }

    if (historyLink) historyLink.style.display = 'none';
    profileLinks.forEach(link => {
      if (!link.closest('.nav-user-wrap')) return;
      link.setAttribute('href', 'login.html');
    });

    if (wrap && trigger) {
      wrap.classList.add('guest-login-wrap');
      dropdown?.remove();
      trigger.classList.add('login-button');
      trigger.setAttribute('href', 'login.html');
      trigger.removeAttribute('aria-haspopup');
      trigger.removeAttribute('aria-expanded');
      trigger.setAttribute('aria-label', 'Đăng nhập');
      trigger.innerHTML = '<span class="login-button-text">Đăng nhập</span>';
    }

    if (page === 'index.html') {
      const lockTargets = [
        document.querySelector('.translation-app'),
        document.querySelector('.context-pro')
      ].filter(Boolean);

      lockTargets.forEach((section, index) => {
        section.classList.add('guest-locked');
        if (index === 0) {
          const overlay = document.createElement('div');
          overlay.className = 'guest-lock-overlay';
          overlay.innerHTML = `
            <div class="guest-lock-card">
              <div class="guest-lock-title">Đăng nhập để mở khóa</div>
              <p>Đăng nhập để sử dụng đầy đủ tính năng dịch, phân tích ngữ cảnh và lịch sử bản dịch của Transense AI.</p>
              <a href="login.html" class="guest-lock-button">Đăng nhập</a>
            </div>
          `;
          section.appendChild(overlay);
        }
      });
    }

    return;
  }

  const nameEl = wrap?.querySelector('#accountName, #navAccountName');
  if (nameEl) nameEl.textContent = storedUserName;
  wrap?.querySelectorAll('.account-dropdown-name').forEach(el => el.textContent = storedUserName);
  wrap?.querySelectorAll('.account-dropdown-avatar').forEach(el => el.textContent = (storedUserName.trim()[0] || 'T').toUpperCase());

  if (trigger) {
    trigger.setAttribute('href', '#');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-label', 'Mở menu tài khoản');
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const open = !wrap.classList.contains('menu-open');
      wrap.classList.toggle('menu-open', open);
      trigger.setAttribute('aria-expanded', String(open));
    });
  }

  wrap?.querySelector('.theme-toggle')?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('transenseTheme', next);
    applyTheme(next);
  });

  wrap?.querySelector('.menu-logout')?.addEventListener('click', () => {
    if (confirm('Bạn có muốn đăng xuất khỏi Transense AI?')) {
      localStorage.setItem('isLoggedIn', 'false');
      window.location.href = 'login.html';
    }
  });

  document.addEventListener('click', (e) => {
    if (wrap && !wrap.contains(e.target)) {
      wrap.classList.remove('menu-open');
      trigger?.setAttribute('aria-expanded', 'false');
    }
  });

  trigger?.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      wrap?.classList.add('menu-open');
      wrap?.querySelector('.user-dropdown a')?.focus();
    }
    if (e.key === 'Escape') {
      wrap?.classList.remove('menu-open');
      trigger?.setAttribute('aria-expanded', 'false');
    }
  });
})();
