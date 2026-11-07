(() => {
  'use strict';
  const navigation = performance.getEntriesByType('navigation')[0];
  const isReload = navigation?.type === 'reload';
  // A reload always replays the entrance, including after an in-page location link.
  if (isReload && location.hash) {
    history.replaceState(history.state, '', location.pathname + location.search);
  }
  const startsAtOpening = isReload || !location.hash;
  if (startsAtOpening && 'scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  function resetScroll() {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }
  if (startsAtOpening) resetScroll();
  document.documentElement.classList.add('js');
  const gate = document.querySelector('#gate');
  const enter = document.querySelector('#enter');
  const invitation = document.querySelector('#invitation');
  const main = document.querySelector('#main');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let opening = false;
  let revealsStarted = false;
  let statusTimer;
  function announce(message) {
    clearTimeout(statusTimer);
    document.querySelector('#status').textContent = message;
    statusTimer = setTimeout(() => { document.querySelector('#status').textContent = ''; }, 6500);
  }
  function finishOpening() {
    gate.hidden = true;
    invitation.inert = false;
    document.body.classList.remove('gate-active');

  }
  function openInvitation() {
    if (opening) return;
    opening = true;
    enter.disabled = true;
    gate.classList.add('opening');
    // Populate visible text as the doors move, rather than waiting for dismissal.
    startReveals();
    // Preserve the full hinge movement before removing the overlay.
    setTimeout(finishOpening, reducedMotion.matches ? 0 : 2000);
  }
  // Fresh direct event links still work; reloads always show the entrance.
  if (startsAtOpening) {
    gate.hidden = false;
    invitation.inert = true;
    document.body.classList.add('gate-active');

  }
  // Run after the browser's load/history restoration step as well.
  window.addEventListener('pageshow', () => {
    if (startsAtOpening && !opening) {
      resetScroll();
      gate.scrollTop = 0;
    }
  });
  enter.addEventListener('click', openInvitation);
  gate.addEventListener('keydown', event => {
    if (event.key === 'Escape') openInvitation();
    if (event.key === 'Tab' && !opening) { event.preventDefault(); enter.focus(); }
  });
  // Each text block reveals once as it enters the viewport.
  function startReveals() {
    if (revealsStarted) return;
    revealsStarted = true;
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        let visibleIndex = 0;
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // A short stagger separates adjacent sentences without delaying scrolling.
            entry.target.style.transitionDelay = reducedMotion.matches ? '0ms' : `${Math.min(visibleIndex++, 4) * 60}ms`;
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -4% 0px' });
      document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
    } else {
      document.querySelectorAll('.reveal').forEach(element => element.classList.add('visible'));
    }
  }
  if (!startsAtOpening) startReveals();
  const music = document.querySelector('#music');
  const audio = document.querySelector('#nasheed');
  function updateAudio() {
    const playing = !audio.paused;
    music.setAttribute('aria-pressed', String(playing));
    music.setAttribute('aria-label', playing ? 'Pause vocals-only nasheed' : 'Play vocals-only nasheed');
    music.title = playing ? 'Pause nasheed' : 'Play nasheed';
  }
  let audioPending = false;
  music.addEventListener('click', async () => {
    if (audioPending) return;
    if (!audio.paused) { audio.pause(); return; }
    audioPending = true;
    music.setAttribute('aria-busy', 'true');
    try {
      // The HTML src is relative to this invitation, on localhost or any host.
      // Reload only after a prior error; leave normal playback/resume untouched.
      if (audio.error) audio.load();
      await audio.play();
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        announce('Your browser blocked audio. Please allow sound for this page and tap the speaker again.');
      } else if (error.name !== 'AbortError') {
        announceAudioError();
      }
      updateAudio();
    } finally {
      audioPending = false;
      music.removeAttribute('aria-busy');
    }
  });
  audio.addEventListener('play', updateAudio);
  audio.addEventListener('pause', updateAudio);
  function announceAudioError() {
    const messages = {
      2: 'The nasheed could not load. Check your connection and tap the speaker to retry.',
      3: 'Your browser could not decode the nasheed. Please try another browser.',
      4: 'The nasheed file could not be found or played. Please refresh this page and try again.'
    };
    announce(messages[audio.error?.code] || 'Audio could not start. Please tap the speaker to retry.');
  }
  audio.addEventListener('error', () => {
    updateAudio();
    announceAudioError();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) audio.pause(); });
  const rsvpForm = document.querySelector('#rsvp-form');
  const rsvpStatus = document.querySelector('#rsvp-status');
  rsvpForm.addEventListener('submit', event => {
    event.preventDefault();
    rsvpStatus.textContent = 'Portfolio preview only. Responses are not sent.';
  });
  rsvpForm.elements.namedItem('guest-name').addEventListener('input', event => {
    event.target.setCustomValidity('');
  });
})();
