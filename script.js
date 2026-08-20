/* ============================================================
   SCRIPT.JS — Perilaku situs (starfield, navigasi, animasi scroll)
   dan fungsi galeri (renderGaleri + lightbox).
   Dipakai bersama oleh index.html dan semua halaman galeri-*.html.

   File ini TIDAK perlu diedit untuk menambah foto/video baru.
   Untuk menambah karya baru, buka halaman galeri-*.html yang
   sesuai dan edit bagian "DATA GALERI" di bagian bawah file itu.
   ============================================================ */

function initSite() {
  // --- Starfield latar belakang ---
  const starsContainer = document.getElementById('stars');
  if (starsContainer && !starsContainer.childElementCount) {
    const starCount = window.innerWidth < 640 ? 36 : 65;
    for (let i = 0; i < starCount; i++) {
      const s = document.createElement('div');
      s.className = 'star';
      const size = Math.random() * 2 + 1;
      s.style.width = size + 'px';
      s.style.height = size + 'px';
      s.style.top = Math.random() * 100 + '%';
      s.style.left = Math.random() * 100 + '%';
      s.style.setProperty('--dur', (Math.random() * 3 + 2.5) + 's');
      s.style.setProperty('--delay', (Math.random() * 4) + 's');
      starsContainer.appendChild(s);
    }
  }

  // --- Latar header saat discroll ---
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // --- Menu navigasi mobile ---
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navBackdrop = document.querySelector('.nav-backdrop');
  if (navToggle && navLinks && navBackdrop) {
    const closeNav = () => {
      navLinks.classList.remove('open');
      navBackdrop.classList.remove('open');
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
    };
    const toggleNav = () => {
      const isOpen = navLinks.classList.toggle('open');
      navBackdrop.classList.toggle('open', isOpen);
      navToggle.classList.toggle('active', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    };
    navToggle.addEventListener('click', toggleNav);
    navBackdrop.addEventListener('click', closeNav);
    navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNav));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeNav(); });
  }

  // --- Animasi muncul saat scroll ---
  const revealEls = document.querySelectorAll('.reveal');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    revealEls.forEach(el => el.classList.add('in-view'));
  } else if (revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => observer.observe(el));
  }
}

document.addEventListener('DOMContentLoaded', initSite);


/* ============================================================
   GALERI — dipakai oleh halaman galeri-*.html

   Setiap item galeri berbentuk objek dengan properti berikut:
     gambar    (wajib)  nama file gambar/thumbnail, contoh: "foto-1.jpg"
     judul     (wajib)  judul singkat karya
     deskripsi (opsional) keterangan singkat
     video     (opsional) nama file video lokal, contoh: "klip-1.mp4"
                          — jika diisi, item akan membuka video saat diklik
     link      (opsional) URL eksternal (YouTube, Instagram, GitHub, dll)
                          — jika diisi, item akan membuka tautan di tab baru
   ============================================================ */

function renderGaleri(items) {
  const grid = document.querySelector('.gallery-grid');
  const emptyState = document.querySelector('.empty-state');
  if (!grid) return;

  if (!items || items.length === 0) {
    grid.hidden = true;
    if (emptyState) emptyState.hidden = false;
    return;
  }

  grid.hidden = false;
  if (emptyState) emptyState.hidden = true;
  grid.innerHTML = '';

  items.forEach((item) => {
    const isLink = !!item.link;
    const el = document.createElement(isLink ? 'a' : 'button');
    el.className = 'gallery-item';
    if (isLink) {
      el.href = item.link;
      el.target = '_blank';
      el.rel = 'noopener noreferrer';
    } else {
      el.type = 'button';
    }

    const thumb = document.createElement('div');
    thumb.className = 'gallery-thumb';
    const img = document.createElement('img');
    img.src = item.gambar;
    img.alt = item.judul || '';
    img.loading = 'lazy';
    thumb.appendChild(img);

    if (item.video) {
      thumb.insertAdjacentHTML('beforeend', '<span class="play-badge"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>');
    } else if (isLink) {
      thumb.insertAdjacentHTML('beforeend', '<span class="external-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M9 7h8v8"/></svg></span>');
    }
    el.appendChild(thumb);

    const body = document.createElement('div');
    body.className = 'gallery-body';
    const h3 = document.createElement('h3');
    h3.textContent = item.judul || '';
    body.appendChild(h3);
    if (item.deskripsi) {
      const p = document.createElement('p');
      p.textContent = item.deskripsi;
      body.appendChild(p);
    }
    el.appendChild(body);

    if (!isLink) {
      el.addEventListener('click', () => openLightbox(item));
    }

    grid.appendChild(el);
  });
}

function openLightbox(item) {
  let lb = document.getElementById('lightbox');
  if (!lb) {
    lb = document.createElement('div');
    lb.id = 'lightbox';
    lb.className = 'lightbox';
    lb.innerHTML =
      '<div class="lightbox-backdrop"></div>' +
      '<div class="lightbox-content">' +
        '<button class="lightbox-close" aria-label="Tutup">&times;</button>' +
        '<div class="lightbox-media"></div>' +
        '<p class="lightbox-caption"></p>' +
      '</div>';
    document.body.appendChild(lb);
    lb.querySelector('.lightbox-backdrop').addEventListener('click', closeLightbox);
    lb.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
  }

  const media = lb.querySelector('.lightbox-media');
  media.innerHTML = '';
  if (item.video) {
    const v = document.createElement('video');
    v.src = item.video;
    v.controls = true;
    v.autoplay = true;
    v.playsInline = true;
    media.appendChild(v);
  } else {
    const img = document.createElement('img');
    img.src = item.gambar;
    img.alt = item.judul || '';
    media.appendChild(img);
  }

  lb.querySelector('.lightbox-caption').textContent = [item.judul, item.deskripsi].filter(Boolean).join(' — ');
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  lb.classList.remove('open');
  document.body.style.overflow = '';
  const video = lb.querySelector('video');
  if (video) video.pause();
}
