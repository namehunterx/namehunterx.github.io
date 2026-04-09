(() => {
  if (window.matchMedia('(max-width: 980px)').matches) {
    document.body.innerHTML = `
      <div class="mobile-404-screen">
        <div class="mobile-404-box">
          <div class="mobile-404-code">404</div>
          <div class="mobile-404-title">Сайт для телефона пока не готов</div>
          <div class="mobile-404-text">Полная версия NameHunter сейчас доступна только на ПК. Открой сайт позже с компьютера или перейди сразу в Telegram-бота.</div>
          <a class="mobile-404-btn" href="https://t.me/NameHunterRobot" target="_blank" rel="noopener noreferrer">Открыть бота</a>
        </div>
      </div>
    `;
    return;
  }

  const dailyPromoCount = 10;
  const dayDurationMs = 24 * 60 * 60 * 1000;
  const rotateEveryMs = dayDurationMs / dailyPromoCount;
  const langs = new Set(['ru', 'en', 'es']);
  const densityModes = new Set(['default', 'compact', 'tight']);
  const root = document.documentElement;
  const dataNode = document.getElementById('i18n-data');
  const translations = dataNode ? JSON.parse(dataNode.textContent) : null;
  const get = (obj, path) => path.split('.').reduce((acc, keyName) => (acc && acc[keyName] !== undefined ? acc[keyName] : undefined), obj);

  const langButtons = Array.from(document.querySelectorAll('[data-lang]'));
  const densityButtons = Array.from(document.querySelectorAll('[data-density-mode]'));
  const langTrigger = document.getElementById('lang-trigger');
  const langMenu = document.getElementById('lang-menu');
  const viewTrigger = document.getElementById('view-trigger');
  const viewMenu = document.getElementById('view-menu');
  const codeEl = document.getElementById('promo-code');
  const noteEl = document.getElementById('promo-note');
  const timerEl = document.getElementById('promo-timer');
  const dayResetEl = document.getElementById('promo-day-reset');
  const dayCountEl = document.getElementById('promo-day-count');
  const wrapEl = document.getElementById('promo-rotator');
  const copyEl = document.getElementById('promo-copy');
  const toastEl = document.getElementById('promo-toast');
  const wheelSpinEl = document.getElementById('wheel-spin');
  const wheelCodeEl = document.getElementById('wheel-code');
  const wheelNoteEl = document.getElementById('wheel-note');
  const wheelCopyEl = document.getElementById('wheel-copy');
  const wheelStatusEl = document.getElementById('wheel-status');

  const langLabels = { ru: 'Русский', en: 'English', es: 'Español' };
  const densityLabels = { default: '100%', compact: '92%', tight: '86%' };
  const rarityWeights = { common: 22, rare: 7, epic: 3, legendary: 1 };
  let currentLang = 'ru';
  let promoPool = [];
  let currentDailyPromos = [];
  let currentDailyIndex = 0;

  const closeLangMenu = () => {
    if (langMenu) langMenu.classList.remove('is-open');
    if (langTrigger) langTrigger.classList.remove('is-open');
  };

  const closeViewMenu = () => {
    if (viewMenu) viewMenu.classList.remove('is-open');
    if (viewTrigger) viewTrigger.classList.remove('is-open');
  };

  const closeAllMenus = () => {
    closeLangMenu();
    closeViewMenu();
  };

  const getMoscowNow = () => new Date(Date.now() + 3 * 60 * 60 * 1000);
  const toMoscowMs = (date) => date.getTime() + 3 * 60 * 60 * 1000;

  const getDailyWindow = () => {
    const moscowNow = getMoscowNow();
    const year = moscowNow.getUTCFullYear();
    const month = moscowNow.getUTCMonth();
    const date = moscowNow.getUTCDate();
    const hour = moscowNow.getUTCHours();
    let dayStart = Date.UTC(year, month, date, 5, 0, 0);
    if (hour < 5) dayStart -= dayDurationMs;
    return { moscowNowMs: toMoscowMs(new Date()), dayStart, nextReset: dayStart + dayDurationMs };
  };

  const formatCountdown = (ms) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const getPromoTier = (item) => String(item.rarity || 'common').toLowerCase();
  const getDailyPromoPool = () => promoPool.filter((item) => String(item.group || 'daily') !== 'wheel');
  const getWheelPromoPool = () => promoPool.filter((item) => String(item.group || 'daily') === 'wheel');

  const mulberry32 = (seed) => {
    let current = seed >>> 0;
    return () => {
      current += 0x6D2B79F5;
      let t = current;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  const pickWeightedUnique = (items, count, randomFn) => {
    const source = items.map((item) => ({ ...item }));
    const result = [];
    while (source.length && result.length < count) {
      const totalWeight = source.reduce((sum, item) => sum + (rarityWeights[getPromoTier(item)] || 1), 0);
      let roll = randomFn() * totalWeight;
      let index = 0;
      for (; index < source.length; index += 1) {
        roll -= rarityWeights[getPromoTier(source[index])] || 1;
        if (roll <= 0) break;
      }
      result.push(source.splice(Math.min(index, source.length - 1), 1)[0]);
    }
    return result;
  };

  const getDailyPromos = () => {
    const pool = getDailyPromoPool();
    if (!pool.length) return [];
    const { dayStart } = getDailyWindow();
    const dayIndex = Math.floor(dayStart / dayDurationMs);
    return pickWeightedUnique(pool, dailyPromoCount, mulberry32(dayIndex + 913));
  };

  const wheelStorageKey = () => {
    const { dayStart } = getDailyWindow();
    return `nh_wheel_${Math.floor(dayStart / dayDurationMs)}`;
  };

  const renderWheelPromo = (promo) => {
    if (!wheelCodeEl || !wheelNoteEl || !wheelStatusEl || !promo) return;
    wheelCodeEl.textContent = promo.code;
    wheelNoteEl.textContent = (promo.hint && (promo.hint[currentLang] || promo.hint.ru)) || 'Одноразовый код из рулетки сайта.';
    wheelStatusEl.textContent = 'Подарок на сегодня уже выбран';
  };

  const restoreWheelPromo = () => {
    const saved = localStorage.getItem(wheelStorageKey());
    if (!saved) return;
    const promo = promoPool.find((item) => item.code === saved);
    if (promo) renderWheelPromo(promo);
  };

  const pickWheelPromo = () => {
    const pool = getWheelPromoPool();
    if (!pool.length) return null;
    const totalWeight = pool.reduce((sum, item) => sum + (rarityWeights[getPromoTier(item)] || 1), 0);
    let roll = Math.random() * totalWeight;
    for (const item of pool) {
      roll -= rarityWeights[getPromoTier(item)] || 1;
      if (roll <= 0) return item;
    }
    return pool[0];
  };

  const refreshPromoFrame = () => {
    if (!codeEl || !noteEl || !timerEl || !wrapEl || !dayResetEl || !dayCountEl || !promoPool.length) return;
    const { moscowNowMs, dayStart, nextReset } = getDailyWindow();
    const dayPromos = getDailyPromos();
    if (!dayPromos.length) return;
    const elapsed = Math.max(0, moscowNowMs - dayStart);
    const promoIndex = Math.floor(elapsed / rotateEveryMs) % Math.min(dayPromos.length, dailyPromoCount);
    const secondsLeft = Math.max(1, Math.ceil((rotateEveryMs - (elapsed % rotateEveryMs)) / 1000));
    const changedDay = currentDailyPromos.map((item) => item.code).join('|') !== dayPromos.map((item) => item.code).join('|');
    const changedPromo = currentDailyIndex !== promoIndex || changedDay;
    currentDailyPromos = dayPromos;
    currentDailyIndex = promoIndex;
    if (changedPromo) {
      wrapEl.classList.remove('promo-swap');
      void wrapEl.offsetWidth;
      wrapEl.classList.add('promo-swap');
    }
    const currentPromo = dayPromos[promoIndex];
    codeEl.textContent = currentPromo.code;
    noteEl.textContent = (currentPromo.hint && (currentPromo.hint[currentLang] || currentPromo.hint.ru)) || '';
    timerEl.textContent = formatCountdown(secondsLeft * 1000);
    dayResetEl.textContent = formatCountdown(nextReset - moscowNowMs);
    dayCountEl.textContent = `${promoIndex + 1} / ${dayPromos.length}`;
  };

  const applyDensity = (mode) => {
    const current = densityModes.has(mode) ? mode : 'default';
    if (current === 'default') root.removeAttribute('data-density');
    else root.setAttribute('data-density', current);
    localStorage.setItem('nh_density', current);
    densityButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.densityMode === current));
    if (viewTrigger) viewTrigger.textContent = densityLabels[current] || '100%';
  };

  const applyLanguage = (lang) => {
    const current = langs.has(lang) ? lang : 'ru';
    currentLang = current;
    root.lang = current;
    localStorage.setItem('nh_lang', current);
    langButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.lang === current));
    if (langTrigger) langTrigger.textContent = langLabels[current];
    if (translations && translations[current]) {
      document.querySelectorAll('[data-i18n]').forEach((node) => {
        const value = get(translations[current], node.dataset.i18n);
        if (typeof value === 'string') node.textContent = value;
      });
      document.querySelectorAll('[data-i18n-html]').forEach((node) => {
        const value = get(translations[current], node.dataset.i18nHtml);
        if (typeof value === 'string') node.innerHTML = value;
      });
      document.querySelectorAll('[data-i18n-content]').forEach((node) => {
        const value = get(translations[current], node.dataset.i18nContent);
        if (typeof value === 'string') node.setAttribute('content', value);
      });
      const titleNode = document.querySelector('title[data-i18n]');
      if (titleNode) {
        const titleValue = get(translations[current], titleNode.dataset.i18n);
        if (typeof titleValue === 'string') document.title = titleValue;
      }
    }
    refreshPromoFrame();
    restoreWheelPromo();
  };

  const loadPromoPool = async () => {
    try {
      const response = await fetch('./assets/promo-codes.json', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      if (!Array.isArray(data) || !data.length) return;
      promoPool = data
        .map((item) => ({
          code: String(item.code || '').trim().toUpperCase(),
          rarity: String(item.rarity || 'common').toLowerCase(),
          group: String(item.group || 'daily').toLowerCase(),
          rewards: Array.isArray(item.rewards) ? item.rewards : [],
          hint: item.hint && typeof item.hint === 'object' ? item.hint : {},
        }))
        .filter((item) => item.code);
      refreshPromoFrame();
      restoreWheelPromo();
    } catch (error) {
      console.warn('Promo pool fallback is used', error);
    }
  };

  const savedLang = localStorage.getItem('nh_lang') || 'ru';
  const savedDensity = localStorage.getItem('nh_density') || 'default';
  applyDensity(savedDensity);
  applyLanguage(savedLang);
  loadPromoPool();

  langButtons.forEach((button) => button.addEventListener('click', () => {
    applyLanguage(button.dataset.lang);
    closeLangMenu();
  }));

  densityButtons.forEach((button) => button.addEventListener('click', () => {
    applyDensity(button.dataset.densityMode);
    closeViewMenu();
  }));

  if (langTrigger && langMenu) {
    langTrigger.addEventListener('click', (event) => {
      event.stopPropagation();
      closeViewMenu();
      langMenu.classList.toggle('is-open');
      langTrigger.classList.toggle('is-open');
    });
  }

  if (viewTrigger && viewMenu) {
    viewTrigger.addEventListener('click', (event) => {
      event.stopPropagation();
      closeLangMenu();
      viewMenu.classList.toggle('is-open');
      viewTrigger.classList.toggle('is-open');
    });
  }

  document.addEventListener('click', (event) => {
    const insideLang = langMenu && langTrigger && (langMenu.contains(event.target) || langTrigger.contains(event.target));
    const insideView = viewMenu && viewTrigger && (viewMenu.contains(event.target) || viewTrigger.contains(event.target));
    if (!insideLang && !insideView) closeAllMenus();
  });

  window.addEventListener('storage', (event) => {
    if (event.key === 'nh_lang') applyLanguage(event.newValue || 'ru');
    if (event.key === 'nh_density') applyDensity(event.newValue || 'default');
  });

  setInterval(refreshPromoFrame, 1000);

  if (copyEl && codeEl) {
    copyEl.addEventListener('click', async () => {
      const lang = localStorage.getItem('nh_lang') || 'ru';
      const text = translations && translations[lang] ? translations[lang] : translations.ru;
      try {
        await navigator.clipboard.writeText(codeEl.textContent.trim());
        copyEl.classList.add('copied');
        copyEl.textContent = text.common.copied_btn;
        if (toastEl) {
          toastEl.textContent = text.common.copied;
          toastEl.classList.add('show');
          setTimeout(() => toastEl.classList.remove('show'), 1600);
        }
        setTimeout(() => {
          copyEl.classList.remove('copied');
          copyEl.textContent = text.common.copy;
        }, 1600);
      } catch (error) {
        copyEl.textContent = text.common.error_btn;
        setTimeout(() => { copyEl.textContent = text.common.copy; }, 1400);
      }
    });
  }

  if (wheelSpinEl) {
    wheelSpinEl.addEventListener('click', () => {
      const saved = localStorage.getItem(wheelStorageKey());
      if (saved) {
        const existingPromo = promoPool.find((item) => item.code === saved);
        if (existingPromo) {
          renderWheelPromo(existingPromo);
          return;
        }
      }
      const promo = pickWheelPromo();
      if (!promo) return;
      localStorage.setItem(wheelStorageKey(), promo.code);
      renderWheelPromo(promo);
    });
  }

  if (wheelCopyEl && wheelCodeEl) {
    wheelCopyEl.addEventListener('click', async () => {
      if (!wheelCodeEl.textContent.trim()) return;
      try {
        await navigator.clipboard.writeText(wheelCodeEl.textContent.trim());
        wheelCopyEl.textContent = 'Скопировано';
        setTimeout(() => { wheelCopyEl.textContent = 'Скопировать код'; }, 1600);
      } catch (error) {
        wheelCopyEl.textContent = 'Ошибка';
        setTimeout(() => { wheelCopyEl.textContent = 'Скопировать код'; }, 1600);
      }
    });
  }

  document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }, true);

  const blockShortcut = (event) => {
    const keyName = event.key.toLowerCase();
    const blocked = event.key === 'F12' || ((event.ctrlKey || event.metaKey) && ['u', 's'].includes(keyName)) || ((event.ctrlKey || event.metaKey) && event.shiftKey && ['i', 'j', 'c', 's'].includes(keyName));
    if (blocked) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      return false;
    }
    return true;
  };

  document.addEventListener('keydown', blockShortcut, true);
  document.addEventListener('keyup', blockShortcut, true);
})();
