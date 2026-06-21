/* ==========================================================================
   99%가 착각한 '소통' — script.js
   역할: 오직 "동적 기능과 상호작용"만 담당한다.
   - HTML(구조)이나 CSS(생김새)를 대신하지 않는다.
   - 매트릭스 숫자비 캔버스는 이번 리디자인에서 제거되었다.
   - 이 파일이 하는 일: 픽토그램 주입, 스크롤 리빌, 숫자 카운트업,
     네비 활성 표시, 맨 위로 가기, 그리고 가로 스크롤(feed) 진행 표시.
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------
     1. 픽토그램 라이브러리
     첨부 시안의 굵은 단색 라인 모티프(사람을 감싸는 손, 인스타 포스트
     프레임, 하트가 담긴 컵 등)를 계승한 자체 제작 SVG 세트.
     색은 CSS의 currentColor를 따른다.
     ------------------------------------------------------------ */
  const PICTOGRAMS = {
    // 사람 한 명
    person: '<svg viewBox="0 0 100 100"><circle cx="50" cy="28" r="16"/><path d="M20 88c0-18 13-32 30-32s30 14 30 32"/></svg>',

    // 두 손이 사람을 감싸 안는 형태 (시안의 핵심 모티프 재해석)
    handsHold: '<svg viewBox="0 0 100 100"><circle cx="50" cy="22" r="13"/><path d="M32 50c0-10 8-15 18-15s18 5 18 15v8"/><path d="M22 78c6-8 10-12 10-20 0-6 4-9 8-9h20c4 0 8 3 8 9 0 8 4 12 10 20"/><path d="M22 78l-10 8M78 78l10 8"/></svg>',

    // 인스타그램 포스트 프레임 (카메라 단순화)
    frame: '<svg viewBox="0 0 100 100"><rect x="14" y="22" width="72" height="60" rx="14"/><circle cx="50" cy="52" r="16"/><circle cx="68" cy="36" r="2.4" fill="currentColor" stroke="none"/></svg>',

    // 하트 (좋아요)
    heart: '<svg viewBox="0 0 100 100"><path d="M50 84C26 68 12 54 12 36c0-13 10-22 21-22 8 0 14 4 17 10 3-6 9-10 17-10 11 0 21 9 21 22 0 18-14 32-38 48z"/></svg>',

    // 말풍선 (댓글)
    chat: '<svg viewBox="0 0 100 100"><path d="M14 30c0-9 7-16 16-16h40c9 0 16 7 16 16v24c0 9-7 16-16 16H42L22 86V70h-8c-9 0-16-7-16-16z"/></svg>',

    // 종이비행기 (DM / 전송)
    send: '<svg viewBox="0 0 100 100"><path d="M86 14L14 46l28 12 8 28 36-72z"/><path d="M42 58l44-44"/></svg>',

    // 북마크 (저장)
    bookmark: '<svg viewBox="0 0 100 100"><path d="M26 12h48a6 6 0 0 1 6 6v70l-30-20-30 20V18a6 6 0 0 1 6-6z"/></svg>',

    // 잠금 풀린 자물쇠 (자발적 노출)
    unlock: '<svg viewBox="0 0 100 100"><rect x="22" y="46" width="48" height="38" rx="8"/><path d="M34 46V32c0-9 7-16 16-16s16 7 16 16"/><circle cx="46" cy="64" r="3" fill="currentColor" stroke="none"/></svg>',

    // 위로 향하는 그래프
    chart: '<svg viewBox="0 0 100 100"><path d="M16 84h68"/><path d="M16 64l18-18 14 12 22-28 14 10"/><circle cx="84" cy="40" r="3" fill="currentColor" stroke="none"/></svg>',

    // 가면 (정체성의 외주화)
    mask: '<svg viewBox="0 0 100 100"><path d="M50 14c-20 0-34 14-34 34 0 24 16 40 34 40s34-16 34-40c0-20-14-34-34-34z"/><path d="M38 48c2-4 6-6 10-6M52 48c2-4 6-6 10-6"/><path d="M40 64c4 4 16 4 20 0"/></svg>',

    // 지구 (공공재가 된 사생활)
    globe: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="36"/><ellipse cx="50" cy="50" rx="16" ry="36"/><line x1="14" y1="50" x2="86" y2="50"/><path d="M19 32h62M19 68h62"/></svg>',

    // 안테나 신호 (실시간 송출)
    signal: '<svg viewBox="0 0 100 100"><circle cx="50" cy="62" r="7"/><path d="M50 55V20"/><path d="M34 36c6-7 9-9 16-9s10 2 16 9M22 24c10-12 16-15 28-15s18 3 28 15"/></svg>',

    // 위치 핀
    pin: '<svg viewBox="0 0 100 100"><path d="M50 12c-16 0-28 12-28 28 0 20 28 48 28 48s28-28 28-48c0-16-12-28-28-28z"/><circle cx="50" cy="40" r="10"/></svg>',

    // 별
    star: '<svg viewBox="0 0 100 100"><path d="M50 10l13 28 30 4-22 21 6 30-27-15-27 15 6-30-22-21 30-4z"/></svg>',

    // 톱니바퀴 (알고리즘)
    gear: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="16"/><path d="M50 16v10M50 74v10M16 50h10M74 50h10M27 27l7 7M73 27l-7 7M27 73l7-7M73 73l-7-7"/></svg>',

    // 사람 추가 (팔로우 / 네트워크)
    personAdd: '<svg viewBox="0 0 100 100"><circle cx="40" cy="32" r="16"/><path d="M14 86c0-16 12-28 26-28s26 12 26 28"/><path d="M76 28v20M66 38h20"/></svg>',

    // 화살표 — 오른쪽 (가로 스크롤 힌트)
    arrowRight: '<svg viewBox="0 0 100 100"><path d="M16 50h68M58 24l28 26-28 26"/></svg>',

    // 화살표 — 아래
    arrowDown: '<svg viewBox="0 0 100 100"><path d="M50 16v60M28 56l22 22 22-22"/></svg>',

    // 화살표 — 위
    arrowUp: '<svg viewBox="0 0 100 100"><path d="M50 84V24M28 44l22-22 22 22"/></svg>',

    // 동그라미 화살표 (다시 보기)
    refresh: '<svg viewBox="0 0 100 100"><path d="M82 50a32 32 0 11-9-22"/><path d="M82 22v18H64"/></svg>',

    // 돋보기 (검색)
    search: '<svg viewBox="0 0 100 100"><circle cx="44" cy="44" r="28"/><line x1="65" y1="65" x2="86" y2="86"/></svg>'
  };

  function injectPictograms() {
    document.querySelectorAll('[data-pictogram]').forEach((el) => {
      const key = el.getAttribute('data-pictogram');
      if (PICTOGRAMS[key]) {
        el.innerHTML = PICTOGRAMS[key];
        el.classList.add('pictogram');
      }
    });
  }

  /* ------------------------------------------------------------
     2. 스크롤 리빌
     ------------------------------------------------------------ */
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    reveals.forEach((el) => observer.observe(el));
  }

  /* ------------------------------------------------------------
     3. 숫자 카운트업
     ------------------------------------------------------------ */
  function animateCount(el) {
    const targetText = el.getAttribute('data-count-to');
    const suffix = el.getAttribute('data-suffix') || '';
    const target = parseFloat(targetText);
    if (Number.isNaN(target)) return;

    const duration = 1300;
    const start = performance.now();
    el.classList.add('is-counting');

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      const display = target % 1 === 0 ? Math.round(current) : current.toFixed(1);
      el.textContent = display + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.classList.remove('is-counting');
      }
    }
    requestAnimationFrame(tick);
  }

  function initCounters() {
    const counters = document.querySelectorAll('.stat-number[data-count-to]');
    if (!counters.length) return;
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((el) => observer.observe(el));
  }

  /* ------------------------------------------------------------
     4. NAV 배경 토글 + 현재 섹션 하이라이트 + 맨 위로 가기
     ------------------------------------------------------------ */
  function initNavAndScrollState() {
    const nav = document.querySelector('nav');
    const toTopBtn = document.querySelector('.to-top');
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section[id]');

    function onScroll() {
      const y = window.scrollY;
      if (nav) nav.classList.toggle('is-scrolled', y > 80);
      if (toTopBtn) toTopBtn.classList.toggle('is-visible', y > 600);

      let currentId = '';
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 120 && rect.bottom > 120) currentId = section.id;
      });
      navLinks.forEach((link) => {
        link.classList.toggle('is-active', link.getAttribute('href') === '#' + currentId);
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (toTopBtn) {
      toTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  /* ------------------------------------------------------------
     5. 가로 스크롤 갤러리 (레퍼런스의 "살짝 밀어 둘러보기" 재해석)
     - 마우스 드래그로도 밀 수 있게 하고, 끝까지 다 봤으면 화살표 힌트를 숨긴다.
     ------------------------------------------------------------ */
  function initFeedScroll() {
    const track = document.querySelector('.feed-scroll');
    const hint = document.querySelector('.feed-scroll-hint');
    if (!track) return;

    // 끝까지 스크롤했는지 확인해서 힌트를 자연스럽게 숨김
    function updateHint() {
      if (!hint) return;
      const reachedEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
      hint.style.opacity = reachedEnd ? '0' : '1';
    }
    track.addEventListener('scroll', updateHint, { passive: true });
    updateHint();

    // 마우스 드래그로 가로 스크롤 (트랙패드/모바일은 기본 스크롤 사용)
    let isDown = false, startX = 0, startScroll = 0;
    track.addEventListener('mousedown', (e) => {
      isDown = true;
      startX = e.pageX;
      startScroll = track.scrollLeft;
      track.style.cursor = 'grabbing';
    });
    window.addEventListener('mouseup', () => {
      isDown = false;
      track.style.cursor = 'grab';
    });
    window.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      track.scrollLeft = startScroll - (e.pageX - startX);
    });
    track.style.cursor = 'grab';
  }

  /* ------------------------------------------------------------
     초기화
     ------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', () => {
    injectPictograms();
    initScrollReveal();
    initCounters();
    initNavAndScrollState();
    initFeedScroll();
  });
})();
