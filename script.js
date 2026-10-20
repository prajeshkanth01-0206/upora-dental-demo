(() => {
  const header = document.getElementById('siteHeader');
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');
  const mobileBook = document.getElementById('mobileBook');
  const navLinks = [...document.querySelectorAll('.nav-link')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let previousScroll = window.scrollY;
  let scrollTicking = false;

  document.getElementById('year').textContent = new Date().getFullYear();
  const dateInput = document.getElementById('preferredDate');
  if (dateInput) {
    const today = new Date();
    dateInput.min = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  }

  const closeMenu = () => {
    mainNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
    document.body.classList.remove('menu-open');
  };
  menuToggle.addEventListener('click', () => {
    const opening = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(opening));
    menuToggle.setAttribute('aria-label', opening ? 'Close navigation' : 'Open navigation');
    mainNav.classList.toggle('open', opening);
    document.body.classList.toggle('menu-open', opening);
  });
  navLinks.concat([...document.querySelectorAll('a[href^="#"]')]).forEach(link => {
    link.addEventListener('click', event => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      event.preventDefault();
      closeMenu();
      const offset = header.getBoundingClientRect().height + 8;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
      if (history.replaceState) history.replaceState(null, '', targetId);
    });
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 12);
    if (window.innerWidth > 820 && y > 260 && y > previousScroll + 5) header.classList.add('header-hidden');
    if (y < previousScroll - 5 || y < 100) header.classList.remove('header-hidden');
    mobileBook.classList.toggle('visible', y > 700 && window.innerWidth <= 520);
    previousScroll = y;
    scrollTicking = false;
  };
  window.addEventListener('scroll', () => {
    if (!scrollTicking) { window.requestAnimationFrame(onScroll); scrollTicking = true; }
  }, { passive: true });
  window.addEventListener('resize', () => { if (window.innerWidth > 820) closeMenu(); onScroll(); });

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    revealItems.forEach(el => revealObserver.observe(el));
  } else revealItems.forEach(el => el.classList.add('is-visible'));

  const sections = [...document.querySelectorAll('main section[id]')];
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { rootMargin: '-28% 0px -62% 0px', threshold: 0 });
    sections.forEach(section => sectionObserver.observe(section));
  }

  const form = document.getElementById('appointmentForm');
  const feedback = document.getElementById('formFeedback');
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const phone = String(data.get('phone') || '').trim();
    const service = String(data.get('service') || 'Not specified');
    const date = String(data.get('date') || 'Flexible');
    const message = String(data.get('message') || '').trim();
    const body = [
      'Hello Upora Dental Clinic,', '',
      'I would like to enquire about an appointment.',
      `Name: ${name}`, `Phone: ${phone}`, `Treatment: ${service}`,
      `Preferred day: ${date}`, message ? `Additional details: ${message}` : '', '',
      'Please confirm availability and consultation details. Thank you.'
    ].filter(Boolean).join('\n');
    feedback.textContent = 'Your request is ready. This demo uses your device email app and does not submit data to a server.';
    const subject = encodeURIComponent('Appointment enquiry — Upora Dental Clinic');
    const encodedBody = encodeURIComponent(body);
    const mailto = `mailto:?subject=${subject}&body=${encodedBody}`;
    const openDraft = document.createElement('a');
    openDraft.href = mailto;
    openDraft.textContent = 'Open appointment message';
    openDraft.className = 'text-link';
    openDraft.style.marginTop = '8px';
    openDraft.style.display = 'inline-flex';
    feedback.appendChild(document.createElement('br'));
    feedback.appendChild(openDraft);
  });
})();
