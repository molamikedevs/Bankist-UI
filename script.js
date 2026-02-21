'use strict';

///////////////////////////////////////
// Modal window

// Cache DOM elements once (performance + readability)
const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const btnCloseModal = document.querySelector('.btn--close-modal');
const btnsOpenModal = document.querySelectorAll('.btn--show-modal');
const btnScrollTo = document.querySelector('.btn--scroll-to');
const section1 = document.querySelector('#section--1');
const nav = document.querySelector('.nav');
const tabs = document.querySelectorAll('.operations__tab');
const tabsContainer = document.querySelector('.operations__tab-container');
const tabsContent = document.querySelectorAll('.operations__content');
const header = document.querySelector('.header');
const allSections = document.querySelectorAll('.section');
const imgTargets = document.querySelectorAll('img[data-src]');

// Open modal (prevent default because buttons are links)
const openModal = function (e) {
  e.preventDefault();
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
};

// Close modal (single source of truth)
const closeModal = function () {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
};

// Attach modal open to multiple buttons
btnsOpenModal.forEach(btn => btn.addEventListener('click', openModal));

btnCloseModal.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

// Close modal with ESC key (UX improvement)
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});

// Smooth scroll to section
btnScrollTo.addEventListener('click', () => {
  section1.scrollIntoView({ behavior: 'smooth' });
});

// Navigation event delegation (single listener for all links)
document.querySelector('.nav__links').addEventListener('click', e => {
  e.preventDefault();

  if (e.target.classList.contains('nav__link')) {
    const id = e.target.getAttribute('href');
    document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
  }
});

// Tabs component using event delegation
tabsContainer.addEventListener('click', e => {
  e.preventDefault();

  const clicked = e.target.closest('.operations__tab');
  if (!clicked) return; // Guard clause

  // Activate tab
  tabs.forEach(tab => tab.classList.remove('operations__tab--active'));
  clicked.classList.add('operations__tab--active');

  // Activate corresponding content
  tabsContent.forEach(con =>
    con.classList.remove('operations__content--active'),
  );

  document
    .querySelector(`.operations__content--${clicked.dataset.tab}`)
    .classList.add('operations__content--active');
});

// Menu fade animation using bind to pass opacity via `this`
const handleHover = function (e) {
  const clickedLink = e.target;
  const siblings = clickedLink.closest('.nav').querySelectorAll('.nav__link');

  siblings.forEach(el => {
    if (el !== clickedLink) el.style.opacity = this;
  });
};

// Bind controls opacity value via `this`
nav.addEventListener('mouseover', handleHover.bind(0.5));
nav.addEventListener('mouseout', handleHover.bind(1));

///////////////////////////////////////
// Sticky navigation using Intersection Observer

// Pre-calculate nav height for offset
const navHeight = nav.getBoundingClientRect().height;

const stickyNav = function (entries) {
  const [entry] = entries;
  if (!entry.isIntersecting) nav.classList.add('sticky');
  else nav.classList.remove('sticky');
};

const headerObserver = new IntersectionObserver(stickyNav, {
  root: null, // viewport
  threshold: 0,
  rootMargin: `${navHeight}px`, // trigger before header fully disappears
});

headerObserver.observe(header);

///////////////////////////////////////
// Reveal sections on scroll

const revealSection = (entries, observer) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    entry.target.classList.remove('section--hidden');
    observer.unobserve(entry.target); // stop observing once revealed
  });
};

const sectionObserver = new IntersectionObserver(revealSection, {
  root: null,
  threshold: 0.15,
});

// Hide sections initially and observe them
allSections.forEach(section => {
  sectionObserver.observe(section);
  section.classList.add('section--hidden');
});

///////////////////////////////////////
// Lazy loading images

const loadImg = (entries, observer) => {
  const [entry] = entries;
  if (!entry.isIntersecting) return;

  // Replace low-res src with high-res version
  entry.target.src = entry.target.dataset.src;

  // Remove blur class only after image fully loads
  entry.target.addEventListener('load', () => {
    entry.target.classList.remove('lazy-img');
  });

  observer.unobserve(entry.target);
};

const imgObserver = new IntersectionObserver(loadImg, {
  root: null,
  threshold: 0,
  rootMargin: '200px', // preload before image enters viewport
});

imgTargets.forEach(img => imgObserver.observe(img));

///////////////////////////////////////
// Slider component (fully self-contained module)

const slider = () => {
  const slides = document.querySelectorAll('.slide');
  const btnLeft = document.querySelector('.slider__btn--left');
  const btnRight = document.querySelector('.slider__btn--right');
  const containerDots = document.querySelector('.dots');

  let curSlide = 0;
  const maxSlide = slides.length;

  // Generate navigation dots dynamically
  const createDots = () => {
    slides.forEach((_, i) => {
      containerDots.insertAdjacentHTML(
        'beforeend',
        `<button class="dots__dot" data-slide="${i}"></button>`,
      );
    });
  };

  // Activate the current slide dot
  const activeSlideDot = slide => {
    document
      .querySelectorAll('.dots__dot')
      .forEach(dot => dot.classList.remove('dots__dot--active'));

    document
      .querySelector(`.dots__dot[data-slide="${slide}"]`)
      .classList.add('dots__dot--active');
  };

  // Position slides relative to current slide
  const goToSlide = slide => {
    slides.forEach(
      (s, i) => (s.style.transform = `translateX(${100 * (i - slide)}%)`),
    );
  };

  const nextSlide = () => {
    curSlide = curSlide === maxSlide - 1 ? 0 : curSlide + 1;
    goToSlide(curSlide);
    activeSlideDot(curSlide);
  };

  const prevSlide = () => {
    curSlide = curSlide === 0 ? maxSlide - 1 : curSlide - 1;
    goToSlide(curSlide);
    activeSlideDot(curSlide);
  };

  const init = () => {
    createDots();
    goToSlide(0);
    activeSlideDot(0);
  };

  init();

  // Controls
  btnRight.addEventListener('click', nextSlide);
  btnLeft.addEventListener('click', prevSlide);

  document.addEventListener('keydown', e => {
    e.key === 'ArrowLeft' && prevSlide();
    e.key === 'ArrowRight' && nextSlide();
  });

  // Dot navigation (event delegation)
  containerDots.addEventListener('click', e => {
    if (e.target.classList.contains('dots__dot')) {
      curSlide = Number(e.target.dataset.slide);
      goToSlide(curSlide);
      activeSlideDot(curSlide);
    }
  });
};

slider();
