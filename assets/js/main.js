(function () {
  'use strict';

  initVideoSlider();
  initVideoCards();
  initTabsHighlight();
  initMobileMenu();

  function initMobileMenu() {
    var menu = document.getElementById('menu');
    var openButton = document.querySelector('[data-menu-open]');
    if (!menu || !openButton) {
      return;
    }

    function setOpen(isOpen) {
      menu.hidden = !isOpen;
      document.body.classList.toggle('is-menu-open', isOpen);
      openButton.setAttribute('aria-expanded', String(isOpen));
    }

    openButton.addEventListener('click', function () { setOpen(true); });
    menu.querySelectorAll('[data-menu-close], .menu__link').forEach(function (el) {
      el.addEventListener('click', function () { setOpen(false); });
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !menu.hidden) {
        setOpen(false);
      }
    });
  }

  function pauseVideos(except) {
    document.querySelectorAll('.video-card__video').forEach(function (video) {
      if (video === except || video.paused) {
        return;
      }
      video.pause();
      video.closest('.video-card').classList.remove('video-card--playing');
    });
  }

  function initVideoCards() {
    document.querySelectorAll('.video-card').forEach(function (card) {
      var video = card.querySelector('.video-card__video');
      var play = card.querySelector('.video-card__play');
      if (!video || !play) {
        return;
      }

      play.addEventListener('click', function () {
        pauseVideos(video);
        card.classList.add('video-card--playing');
        video.controls = true;
        video.play();
      });
    });
  }

  function initVideoSlider() {
    var root = document.getElementById('videos-slider');
    if (!root || typeof KeenSlider === 'undefined') {
      return;
    }

    var prev = document.querySelector('[data-slider-prev]');
    var next = document.querySelector('[data-slider-next]');
    var progress = document.querySelector('[data-slider-progress]');
    var progressBar = progress && progress.querySelector('.videos__progress-bar');
    var total = root.children.length;

    var slider = new KeenSlider(root, {
      loop: false,
      slides: { perView: 1.15, spacing: 16 },
      breakpoints: {
        '(min-width: 600px)': { slides: { perView: 1.6, spacing: 24 } },
        '(min-width: 1024px)': { slides: { perView: 2.2, spacing: 32 } }
      },
      created: syncControls,
      slideChanged: syncControls
    });

    if (prev) {
      prev.addEventListener('click', function () { slider.prev(); });
    }
    if (next) {
      next.addEventListener('click', function () { slider.next(); });
    }

    function syncControls(instance) {
      var details = instance.track.details;
      var current = details.rel;
      var atEnd = current >= details.maxIdx;

      pauseVideos(null);

      if (progressBar) {
        var inView = details.slides.reduce(function (sum, slide) {
          return sum + slide.portion;
        }, 0);
        var seen = atEnd ? total : current + inView;
        var percent = Math.round(Math.min(seen / total, 1) * 100);

        progressBar.style.width = percent + '%';
        progress.setAttribute('aria-valuenow', percent);
      }
      if (prev) {
        prev.disabled = current === 0;
      }
      if (next) {
        next.disabled = atEnd;
      }
    }
  }

  function initTabsHighlight() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.tabs__link'));
    if (!links.length) {
      return;
    }

    var sections = links
      .map(function (link) { return document.querySelector(link.getAttribute('href')); })
      .filter(Boolean);

    if (!sections.length) {
      return;
    }

    var offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--ms-tabs-h'), 10);

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    function onScroll() {
      var active = sections[0];
      sections.forEach(function (section) {
        if (section.getBoundingClientRect().top - offset <= 1) {
          active = section;
        }
      });

      links.forEach(function (link) {
        link.classList.toggle('tabs__link--active', link.getAttribute('href') === '#' + active.id);
      });
    }
  }
})();
