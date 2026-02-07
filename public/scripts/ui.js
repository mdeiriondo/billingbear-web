// --- STICKY HEADER & TOP BAR ---
const nav = document.getElementById('main-nav');
const topBar = document.getElementById('top-bar');
const navLogo = document.querySelector('.nav-logo');
const navStatus = document.querySelector('.nav-status');
const navLinks = document.querySelector('.nav-links');
const navShuffle = document.querySelector('.nav-shuffle');

const handleScroll = () => {
  if (window.innerWidth < 768) {
    topBar?.classList.remove('-translate-y-full');
    nav?.classList.remove(
      'bg-brand-green',
      'shadow-2xl',
      'py-3',
      'translate-y-0',
      'translate-y-8',
      'py-10',
      'md:py-12'
    );
    nav?.classList.add('nav-mobile');
    navLogo?.classList.remove('scale-75');
    navLinks?.classList.remove('opacity-0', 'pointer-events-none', 'hidden');
    navStatus?.classList.add('hidden', 'opacity-0');
    navStatus?.classList.remove('flex', 'opacity-100');
    navShuffle?.classList.add('hidden', 'opacity-0', 'translate-x-4');
    navShuffle?.classList.remove('inline-block', 'opacity-100', 'translate-x-0');
    nav?.classList.toggle('nav-mobile-scrolled', window.scrollY > 30);
    return;
  }

  nav?.classList.remove('nav-mobile', 'nav-mobile-scrolled');

  if (window.scrollY > 40) {
    topBar?.classList.add('-translate-y-full');
    nav?.classList.add('bg-brand-green', 'shadow-2xl', 'py-3', 'translate-y-0');
    nav?.classList.remove('py-10', 'md:py-12', 'translate-y-8');

    navLogo?.classList.add('scale-75');
    navLinks?.classList.add('opacity-0', 'pointer-events-none', 'hidden');

    navStatus?.classList.remove('hidden', 'opacity-0');
    navStatus?.classList.add('flex', 'opacity-100');

    navShuffle?.classList.remove('hidden', 'opacity-0', 'translate-x-4');
    navShuffle?.classList.add('inline-block', 'opacity-100', 'translate-x-0');
  } else {
    topBar?.classList.remove('-translate-y-full');
    nav?.classList.remove('bg-brand-green', 'shadow-2xl', 'py-3', 'translate-y-0');
    nav?.classList.add('py-10', 'md:py-12', 'translate-y-8');

    navLogo?.classList.remove('scale-75');
    navLinks?.classList.remove('opacity-0', 'pointer-events-none', 'hidden');

    navStatus?.classList.add('hidden', 'opacity-0');
    navStatus?.classList.remove('flex', 'opacity-100');

    navShuffle?.classList.add('hidden', 'opacity-0', 'translate-x-4');
    navShuffle?.classList.remove('inline-block', 'opacity-100', 'translate-x-0');
  }
};

// Use passive scroll to avoid blocking main thread
window.addEventListener('scroll', handleScroll, { passive: true });
window.addEventListener('resize', handleScroll, { passive: true });

// --- MODAL SYSTEM ---
function initModal(modalId, triggerClass) {
  const modal = document.getElementById(modalId);
  const triggers = document.querySelectorAll(triggerClass);
  const closeBtns = modal?.querySelectorAll('.close-modal');

  if (!modal) return;
  const modalEl = modal;

  function openModal() {
    document.body.style.overflow = 'hidden';
    modalEl.classList.remove('hidden');
    modalEl.classList.add('flex');
    // Carga diferida del iframe SimplyBook: solo cuando se abre el modal (mejora Core Web Vitals)
    if (modalId === 'shuffleboard-modal') {
      const iframe = modalEl.querySelector('.shuffleboard-iframe');
      if (iframe?.dataset.src && !iframe.src.includes('simplybook')) {
        iframe.src = iframe.dataset.src;
      }
    }
    requestAnimationFrame(() => {
      modalEl.classList.add('modal-visible');
    });
  }

  function closeModal() {
    modalEl.classList.add('modal-closing');
    modalEl.classList.remove('modal-visible');

    setTimeout(() => {
      modalEl.classList.remove('flex');
      modalEl.classList.add('hidden');
      modalEl.classList.remove('modal-closing');
      document.body.style.overflow = '';
    }, 400);
  }

  triggers.forEach((t) =>
    t.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    })
  );

  closeBtns?.forEach((b) => b.addEventListener('click', closeModal));

  modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl) closeModal();
  });
}

initModal('booking-modal', '.booking-trigger');
initModal('shuffleboard-modal', '.shuffle-trigger');

// --- SCROLL REVEAL ---
document.addEventListener('DOMContentLoaded', () => {
  handleScroll();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('active');
      });
    },
    { threshold: 0.1 }
  );
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
});