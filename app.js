/* SS PLAY public website
   Loads only published content from the SS PLAY Supabase project.
   Publish only videos/posters that SS PLAY owns or is authorized to distribute. */
(() => {
  'use strict';

  const cfg = window.SSPLAY_CONFIG || {};
  const $ = (id) => document.getElementById(id);
  let client = null;
  let publishedItems = [];

  const fallbackMovies = [
    { title: 'Your First Original', meta: 'Original • Coming Soon' },
    { title: 'Bihar Stories', meta: 'Regional • Coming Soon' },
    { title: 'Independent Film', meta: 'Licensed • Coming Soon' },
    { title: 'SS PLAY Premiere', meta: 'Exclusive • Coming Soon' }
  ];
  const fallbackSeries = [
    { title: 'City Stories', meta: 'Series • Coming Soon' },
    { title: 'The Field', meta: 'Drama • Coming Soon' },
    { title: 'Bihar Diaries', meta: 'Documentary • Coming Soon' },
    { title: 'New Voices', meta: 'Original • Coming Soon' }
  ];

  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[m]));

  function makeClient() {
    if (!window.supabase || !cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) return null;
    try { return window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY); }
    catch (e) { console.error('SS PLAY Supabase initialization failed:', e); return null; }
  }

  function renderCards(items, elementId, fallback, sectionType) {
    const el = $(elementId);
    if (!el) return;
    if (!items.length) {
      el.innerHTML = fallback.map((x) => `
        <article class="card placeholder-card" aria-label="${esc(x.title)}">
          <div class="poster"><span>SS</span> PLAY</div>
          <div class="card-body"><b>${esc(x.title)}</b><span class="muted">${esc(x.meta)}</span></div>
        </article>`).join('');
      return;
    }
    el.innerHTML = items.map((x, i) => {
      const poster = x.poster_url
        ? `<img class="content-poster" src="${esc(x.poster_url)}" alt="${esc(x.title)} poster" loading="lazy" onerror="this.style.display='none'">`
        : `<div class="poster"><span>SS</span> PLAY</div>`;
      const meta = [x.genre || (x.content_type === 'series' ? 'Web Series' : x.content_type), x.is_premium ? 'Premium' : 'Free'].filter(Boolean).join(' • ');
      return `<article class="card" tabindex="0" role="button" data-content-index="${i}" data-section="${sectionType}">
        ${poster}
        <div class="card-body"><b>${esc(x.title)}</b><span class="muted">${esc(meta)}</span></div>
      </article>`;
    }).join('');
    el.querySelectorAll('[data-content-index]').forEach((card) => {
      const open = () => {
        const item = items[Number(card.dataset.contentIndex)];
        if (item) openPlayer(item);
      };
      card.addEventListener('click', open);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
      });
    });
  }

  function renderPublished() {
    const movies = publishedItems.filter((x) => ['movie', 'short', 'live'].includes(x.content_type));
    const series = publishedItems.filter((x) => x.content_type === 'series');
    renderCards(movies, 'movieCards', fallbackMovies, 'movies');
    renderCards(series, 'seriesCards', fallbackSeries, 'series');
  }

  function openPlayer(item) {
    const modal = $('playerModal');
    if (!modal) return;
    $('modalTitle').textContent = item.title || 'SS PLAY';
    $('modalDescription').textContent = item.description || '';
    const stage = $('videoStage');
    stage.innerHTML = '';

    if (item.is_premium) {
      stage.innerHTML = '<div><div class="big-play">🔒</div><p>This title is marked Premium.</p><p class="muted">Premium payments and subscription verification are not enabled yet.</p></div>';
      $('modalNotice').textContent = 'Premium playback will become available after subscription and payment verification are implemented.';
    } else if (item.video_url && /^https?:\/\//i.test(item.video_url)) {
      const video = document.createElement('video');
      video.controls = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.maxHeight = '70vh';
      video.style.background = '#000';
      video.src = item.video_url;
      stage.appendChild(video);
      $('modalNotice').textContent = 'Playback depends on the video host and supported format. Use only authorized video URLs.';
    } else {
      stage.innerHTML = '<div><div class="big-play">▶</div><p>Video is not available yet.</p><p class="muted">The administrator has not added a valid video URL.</p></div>';
      $('modalNotice').textContent = 'This title is published, but no playable video URL is configured.';
    }
    modal.classList.remove('hidden');
  }

  function closeModals() {
    document.querySelectorAll('.modal').forEach((m) => m.classList.add('hidden'));
    const stage = $('videoStage');
    if (stage) {
      const video = stage.querySelector('video');
      if (video) { video.pause(); video.removeAttribute('src'); video.load(); }
    }
  }

  async function loadPublishedContent() {
    if (!client) {
      renderCards([], 'movieCards', fallbackMovies, 'movies');
      renderCards([], 'seriesCards', fallbackSeries, 'series');
      console.warn('Supabase client is not configured; showing placeholder cards.');
      return;
    }
    const { data, error } = await client
      .from('content')
      .select('id,title,content_type,genre,description,poster_url,video_url,is_premium,status,created_at')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Could not load published SS PLAY content:', error.message);
      renderCards([], 'movieCards', fallbackMovies, 'movies');
      renderCards([], 'seriesCards', fallbackSeries, 'series');
      return;
    }
    publishedItems = data || [];
    renderPublished();
  }

  async function handleSignIn(event) {
    event.preventDefault();
    const message = $('loginMessage');
    const button = $('loginSubmit');
    if (!client) {
      message.textContent = 'Sign-in service is unavailable. Please try again later.';
      return;
    }
    const email = $('loginEmail').value.trim();
    const password = $('loginPassword').value;
    message.textContent = 'Signing in...';
    button.disabled = true;
    const { error } = await client.auth.signInWithPassword({ email, password });
    button.disabled = false;
    if (error) {
      message.textContent = error.message;
      return;
    }
    message.textContent = 'Signed in successfully.';
    setTimeout(closeModals, 900);
  }

  function init() {
    client = makeClient();
    renderCards([], 'movieCards', fallbackMovies, 'movies');
    renderCards([], 'seriesCards', fallbackSeries, 'series');

    $('loginBtn')?.addEventListener('click', () => $('loginModal')?.classList.remove('hidden'));
    $('loginForm')?.addEventListener('submit', handleSignIn);
    $('premiumBtn')?.addEventListener('click', () => alert('SS PLAY Premium subscriptions are not active yet. Payments and access verification must be connected before charging users.'));
    document.querySelectorAll('[data-play]').forEach((b) => b.addEventListener('click', () => {
      const firstFree = publishedItems.find((x) => !x.is_premium);
      if (firstFree) openPlayer(firstFree);
      else openPlayer({ title: 'SS PLAY Featured Content', description: 'No published free video is available yet.', video_url: null, is_premium: false });
    }));
    document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', closeModals));
    document.querySelectorAll('.modal').forEach((m) => m.addEventListener('click', (e) => { if (e.target === m) closeModals(); }));
    if ($('year')) $('year').textContent = new Date().getFullYear();
    loadPublishedContent();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
