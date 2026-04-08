(() => {
  const dailyPromoCount = 10;
  const dayDurationMs = 24 * 60 * 60 * 1000;
  const rotateEveryMs = dayDurationMs / dailyPromoCount;
  const langs = new Set(['ru', 'en', 'es']);
  const densityModes = new Set(['default', 'compact', 'tight']);
  const root = document.documentElement;
  const dataNode = document.getElementById('i18n-data');
  const translations = dataNode ? JSON.parse(dataNode.textContent) : null;
  const get = (obj, path) => path.split('.').reduce((acc, keyName) => (acc && acc[keyName] !== undefined ? acc[keyName] : undefined), obj);

  const promoPoolFallback = [
    { code: 'HUNTER10', hint: { ru: 'Стартовый дроп для быстрого входа в NameHunter.', en: 'Starter drop for a quick entry into NameHunter.', es: 'Drop inicial para entrar rapido en NameHunter.' } },
    { code: 'AURUMSTART', hint: { ru: 'Промо из премиум-подборки AURUM.', en: 'Promo from the premium AURUM selection.', es: 'Promo de la seleccion premium AURUM.' } },
    { code: 'NICKDROP', hint: { ru: 'Промокод из подборки на ники и бонусные сценарии.', en: 'Promo from the username and bonus flows set.', es: 'Promocode de la seleccion para usernames y bonus.' } },
    { code: 'MARKETVIP', hint: { ru: 'Витринный код для маркета и safe deal.', en: 'Showcase code for the market and safe deal.', es: 'Codigo de vitrina para mercado y safe deal.' } },
    { code: 'BONUS24', hint: { ru: 'Один из бонусных кодов ежедневной ленты.', en: 'One of the daily bonus showcase codes.', es: 'Uno de los codigos de bonus de la vitrina diaria.' } },
    { code: 'REFBOOST', hint: { ru: 'Код из блока активности и реферальных механик.', en: 'Code from the activity and referral mechanics block.', es: 'Codigo del bloque de actividad y referidos.' } },
    { code: 'SAFEDEAL', hint: { ru: 'Промо из подборки по безопасным сделкам.', en: 'Promo from the safe deal collection.', es: 'Promo de la coleccion de operaciones seguras.' } },
    { code: 'DAILYDROP', hint: { ru: 'Дневной код из живой ротации сайта.', en: 'Daily code from the live site rotation.', es: 'Codigo diario de la rotacion viva del sitio.' } },
    { code: 'NICKWAVE', hint: { ru: 'Код из волны промо для поиска красивых ников.', en: 'Code from the promo wave for clean usernames.', es: 'Codigo de la ola promo para usernames bonitos.' } },
    { code: 'FASTAURUM', hint: { ru: 'Промо из быстрой AURUM-подборки.', en: 'Promo from the fast AURUM set.', es: 'Promo de la seleccion rapida de AURUM.' } },
    { code: 'MARKETFIRE', hint: { ru: 'Один из кодов витрины для маркета.', en: 'One of the showcase codes for the market.', es: 'Uno de los codigos de vitrina del mercado.' } },
    { code: 'GLOWNICK', hint: { ru: 'Промокод из яркой линейки NameHunter.', en: 'Promo code from the bright NameHunter line.', es: 'Promocode de la linea brillante de NameHunter.' } },
    { code: 'HUNTBOOST', hint: { ru: 'Код на усиленную дневную подборку.', en: 'Code for an enhanced daily selection.', es: 'Codigo para una seleccion diaria reforzada.' } },
    { code: 'AURUMNOW', hint: { ru: 'Промо из активной AURUM-ротации.', en: 'Promo from the active AURUM rotation.', es: 'Promo de la rotacion activa de AURUM.' } },
    { code: 'RARENICK', hint: { ru: 'Код из подборки под редкие и чистые ники.', en: 'Code from the rare and clean username collection.', es: 'Codigo de la seleccion de usernames raros y limpios.' } },
    { code: 'VIOLETDROP', hint: { ru: 'Фирменный фиолетовый дроп сайта NameHunter.', en: 'Signature violet website drop for NameHunter.', es: 'Drop violeta de la web de NameHunter.' } },
    { code: 'NAMEJET', hint: { ru: 'Быстрый промокод из легкой ротации дня.', en: 'Fast promo code from the light daily rotation.', es: 'Codigo rapido de la rotacion diaria.' } },
    { code: 'DEALLIVE', hint: { ru: 'Код из подборки safe deal и доверия.', en: 'Code from the safe deal and trust selection.', es: 'Codigo de la seleccion de safe deal y confianza.' } },
    { code: 'BONUSFLOW', hint: { ru: 'Промокод из бонусного потока сервиса.', en: 'Promo code from the service bonus flow.', es: 'Promocode del flujo de bonus del servicio.' } },
    { code: 'PROMOEDGE', hint: { ru: 'Острый код из ежедневной десятки.', en: 'Sharp code from the daily top ten.', es: 'Codigo potente de la decena diaria.' } },
    { code: 'HUNTERMAX', hint: { ru: 'Промо из усиленной линейки NameHunter.', en: 'Promo from the enhanced NameHunter line.', es: 'Promo de la linea reforzada de NameHunter.' } },
    { code: 'NICKLINE', hint: { ru: 'Код из подборки на чистые ники и пакеты.', en: 'Code from the clean usernames and package set.', es: 'Codigo de la seleccion de usernames limpios y paquetes.' } },
    { code: 'MARKETX', hint: { ru: 'Промо из маркета с акцентом на сделки.', en: 'Promo from the market side with deal focus.', es: 'Promo del mercado con enfoque en operaciones.' } },
    { code: 'AURUMPLUS', hint: { ru: 'Один из кодов премиальной линии AURUM.', en: 'One of the codes from the premium AURUM line.', es: 'Uno de los codigos de la linea premium AURUM.' } },
    { code: 'DROPZONE', hint: { ru: 'Код из зоны ежедневных дропов.', en: 'Code from the daily drop zone.', es: 'Codigo de la zona de drops diarios.' } },
    { code: 'NAMEPULSE', hint: { ru: 'Пульсирующий код из сайта и витрины.', en: 'Pulse code from the site showcase.', es: 'Codigo de pulso de la vitrina del sitio.' } },
    { code: 'SAFEHUNT', hint: { ru: 'Промокод на стыке поиска и safe deal.', en: 'Promo code where search meets safe deal.', es: 'Promocode entre busqueda y safe deal.' } },
    { code: 'GIFTNICK', hint: { ru: 'Код из подарочной линии NameHunter.', en: 'Code from the NameHunter gift line.', es: 'Codigo de la linea de regalos de NameHunter.' } },
    { code: 'HYPERNAME', hint: { ru: 'Промо из динамичной подборки сайта.', en: 'Promo from the dynamic site selection.', es: 'Promo de la seleccion dinamica del sitio.' } },
    { code: 'HUNTERNOVA', hint: { ru: 'Финальный код из расширенного пула витрины.', en: 'Final code from the expanded showcase pool.', es: 'Codigo final del pool ampliado de la vitrina.' } }
  ];

  let promoPool = promoPoolFallback.slice();

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

  const rareCodes = new Set(['MARKETVIP', 'FASTAURUM', 'RARENICK', 'MARKETX', 'AURUMPLUS', 'SAFEHUNT']);
  const epicCodes = new Set(['PROMOEDGE', 'HUNTERMAX', 'GIFTNICK', 'HYPERNAME']);
  const legendaryCodes = new Set(['HUNTERNOVA']);
  const rarityWeights = { common: 16, rare: 7, epic: 3, legendary: 1 };

  const langLabels = { ru: 'Русский', en: 'English', es: 'Español' };
  const densityLabels = { default: '100%', compact: '92%', tight: '86%' };
  let currentLang = 'ru';
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
    if (hour < 5) {
      dayStart -= 24 * 60 * 60 * 1000;
    }
    const nextReset = dayStart + 24 * 60 * 60 * 1000;
    return { moscowNowMs: toMoscowMs(new Date()), dayStart, nextReset };
  };

  const getPromoTier = (code) => {
    const promo = promoPool.find((item) => item.code === code);
    const explicitTier = String((promo && promo.rarity) || '').toLowerCase();
    if (explicitTier === 'legendary' || legendaryCodes.has(code)) return 'legendary';
    if (explicitTier === 'epic' || epicCodes.has(code)) return 'epic';
    if (explicitTier === 'rare' || rareCodes.has(code)) return 'rare';
    return 'common';
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
          rewards: Array.isArray(item.rewards) ? item.rewards : [],
          hint: item.hint && typeof item.hint === 'object' ? item.hint : {},
        }))
        .filter((item) => item.code);
      refreshPromoFrame();
    } catch (error) {
      console.warn('Promo pool fallback is used', error);
    }
  };

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
    const source = items.map((item) => ({ ...item, tier: getPromoTier(item.code) }));
    const result = [];
    while (source.length && result.length < count) {
      const totalWeight = source.reduce((sum, item) => sum + (rarityWeights[item.tier] || 1), 0);
      let roll = randomFn() * totalWeight;
      let index = 0;
      for (; index < source.length; index += 1) {
        roll -= rarityWeights[source[index].tier] || 1;
        if (roll <= 0) break;
      }
      const pickedIndex = Math.min(index, source.length - 1);
      result.push(source.splice(pickedIndex, 1)[0]);
    }
    return result;
  };

  const getDailyPromos = () => {
    const { dayStart } = getDailyWindow();
    const dayIndex = Math.floor(dayStart / (24 * 60 * 60 * 1000));
    const randomFn = mulberry32(dayIndex + 913);
    const selected = pickWeightedUnique(promoPool, 10, randomFn);

    if (dayIndex % 4 === 0 && !selected.some((item) => item.tier === 'epic' || item.tier === 'legendary')) {
      const epicPool = promoPool.filter((item) => ['epic', 'legendary'].includes(getPromoTier(item.code)));
      const forced = epicPool[Math.floor(randomFn() * epicPool.length)];
      if (forced) selected[selected.length - 1] = { ...forced, tier: getPromoTier(forced.code) };
    }
    if (dayIndex % 9 === 0 && !selected.some((item) => item.tier === 'legendary')) {
      const legendPool = promoPool.filter((item) => getPromoTier(item.code) === 'legendary');
      const forced = legendPool[Math.floor(randomFn() * legendPool.length)];
      if (forced) selected[selected.length - 1] = { ...forced, tier: getPromoTier(forced.code) };
    }
    return selected;
  };

  const formatCountdown = (ms) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const applyDensity = (mode) => {
    const current = densityModes.has(mode) ? mode : 'default';
    if (current === 'default') root.removeAttribute('data-density');
    else root.setAttribute('data-density', current);
    localStorage.setItem('nh_density', current);
    densityButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.densityMode === current));
    if (viewTrigger) viewTrigger.textContent = densityLabels[current] || '100%';
  };

  const refreshPromoFrame = () => {
    if (!codeEl || !noteEl || !timerEl || !wrapEl || !dayResetEl || !dayCountEl) return;

    const { moscowNowMs, dayStart, nextReset } = getDailyWindow();
    const elapsed = Math.max(0, moscowNowMs - dayStart);
    const dayPromos = getDailyPromos();
    const nextRotate = rotateEveryMs;
    const promoIndex = Math.floor(elapsed / nextRotate) % Math.min(dayPromos.length, dailyPromoCount);
    const secondsLeft = Math.max(1, Math.ceil((nextRotate - (elapsed % nextRotate)) / 1000));

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
    noteEl.textContent = currentPromo.hint[currentLang] || currentPromo.hint.ru;
    timerEl.textContent = formatCountdown(secondsLeft * 1000);
    dayResetEl.textContent = formatCountdown(nextReset - moscowNowMs);
    dayCountEl.textContent = `${promoIndex + 1} / ${dayPromos.length}`;
  };

  const applyLanguage = (lang) => {
    const current = langs.has(lang) ? lang : 'ru';
    currentLang = current;
    root.lang = current;
    localStorage.setItem('nh_lang', current);
    langButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.lang === current));
    if (langTrigger) langTrigger.textContent = langLabels[current];
    if (!translations || !translations[current]) {
      refreshPromoFrame();
      return;
    }

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

    refreshPromoFrame();
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

  refreshPromoFrame();
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









