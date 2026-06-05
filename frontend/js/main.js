// Данные карточек курсов 
const coursesData = {
  a: {
    title: 'Обучение на мотоцикл',
    categoryText: 'Категория "A"',
    imgSmall: '/images/moto.png',
    imgBig: '/images/gray2.png',
    link: '/courses-data.html?course=motorcycle',
    collapsedImg: '/images/gray2.png',
    collapsedClass: 'card--collapsed2'
  },
  b: {
    title: 'Обучение на автомобиль с МКПП',
    categoryText: 'Категория "B"',
    imgSmall: '/images/car1.png',
    imgBig: '/images/gray1.png',
    link: '/courses-data.html?course=auto',
    collapsedImg: '/images/gray1.png',
    collapsedClass: 'card--collapsed1'
  },
  akpp: {
    title: 'Обучение на автомобиль с АКПП',
    categoryText: 'Категория "B" автомат',
    imgSmall: '/images/car2.png',
    imgBig: '/images/gray3.png',
    link: '/courses-data.html?course=auto2',
    collapsedImg: '/images/gray3.png',
    collapsedClass: 'card--collapsed1'
  },
  d: {
    title: 'Обучение на трактор',
    categoryText: 'Категория "D"',
    imgSmall: '/images/truck.png',
    imgBig: '/images/gray4.png',
    link: '/courses-data.html?course=truck',
    collapsedImg: '/images/gray4.png',
    collapsedClass: 'card--collapsed2'
  },
  e: {
    title: 'Обучение на квадроцикл',
    categoryText: 'Категория "АI" с 16 лет',
    imgSmall: '/images/kvadro.png',
    imgBig: '/images/gray5.png',
    link: '/courses-data.html?course=kvadro',
    collapsedImg: '/images/gray5.png',
    collapsedClass: 'card--collapsed1'
  }
};

function generateCollapsedCard(category, data) {
  return `<div class="card ${data.collapsedClass}" data-category="${category}">
            <div class="card__collapsed-content">
              <img src="${data.collapsedImg}" alt="" class="card__icon">
            </div>
          </div>`;
}

function generateExpandedCard(category, data) {
  return `<div class="card card--expanded" data-category="${category}">
            <div class="card__content">
              <img src="${data.imgSmall}" alt="" class="card__img-small">
              <div class="card__info">
                <h3 class="card__title">${data.title}</h3>
                <p class="card__category">${data.categoryText}</p>
              </div>
              <div class="card__visual">
                <img src="${data.imgBig}" alt="" class="card__img-big">
              </div>
            </div>
            <a href="${data.link}" class="btn btn--detail">Узнать подробнее <span class="arrow"></span></a>
          </div>`;
}

// --- Десктопное переключение карточек ---
function initDesktopCards() {
  const cardsContainer = document.querySelector('.cards');
  if (!cardsContainer) return;
  cardsContainer.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (!card || card.classList.contains('card--expanded')) return;

    const newCat = card.dataset.category;
    const expanded = cardsContainer.querySelector('.card--expanded');
    
    if (expanded) {
      const oldCat = expanded.dataset.category;
      const oldData = coursesData[oldCat];
      const collapsedHtml = generateCollapsedCard(oldCat, oldData);
      expanded.outerHTML = collapsedHtml;
    }
    
    const newData = coursesData[newCat];
    const expandedHtml = generateExpandedCard(newCat, newData);
    card.outerHTML = expandedHtml;
  });
}

// --- Мобильный слайдер карточек ---
function initMobileCardsSlider() {
  const cards = document.querySelector('.cards');
  if (!cards) return;

  // Формируем карточки из данных
  const categories = ['b', 'a', 'akpp', 'd', 'e'];
  cards.innerHTML = categories.map(cat => generateExpandedCard(cat, coursesData[cat])).join('');

  const cardElements = cards.querySelectorAll('.card');
  let currentIndex = 0;
  const dotsContainer = document.getElementById('cards-dots');
  dotsContainer.innerHTML = '';

  cardElements.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.className = 'card-dot';
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  });

  function goToSlide(index) {
    currentIndex = index;
    cards.style.transform = `translateX(-${index * 100}%)`;
    document.querySelectorAll('.card-dot').forEach((d, i) => d.classList.toggle('active', i === index));
  }

  // Поддержка свайпа пальцем
  let startPos = 0;
  cards.addEventListener('touchstart', e => {
    startPos = e.touches[0].clientX;
  });
  cards.addEventListener('touchend', e => {
    const diff = startPos - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < cardElements.length - 1) {
        goToSlide(currentIndex + 1);
      } else if (diff < 0 && currentIndex > 0) {
        goToSlide(currentIndex - 1);
      }
    }
  });
}

// --- Галерея филиалов ---
function initGallery() {
  const galleryOverlay = document.getElementById('gallery-overlay');
  const gallerySlides = document.getElementById('gallery-slides');
  const galleryDots = document.getElementById('gallery-dots');
  const areaLeft = document.getElementById('gallery-area-left');
  const areaRight = document.getElementById('gallery-area-right');
  if (!galleryOverlay || !gallerySlides) return;

  let currentSlide = 0;
  let images = [];

  document.querySelectorAll('.branch-card__img-wrap').forEach(wrap => {
    wrap.addEventListener('click', () => {
      const json = wrap.dataset.images;
      if (json) {
        try {
          images = JSON.parse(json);
        } catch (e) {
          console.error('Ошибка в data-images:', e);
          return;
        }
        currentSlide = 0;
        renderGallery();
        galleryOverlay.classList.add('active');
      }
    });
  });

  galleryOverlay.addEventListener('click', (e) => {
    if (e.target === galleryOverlay) {
      galleryOverlay.classList.remove('active');
    }
  });

  function goToSlide(index) {
    currentSlide = index;
    gallerySlides.style.transform = `translateX(-${index * 100}%)`;
    updateDots();
  }

  areaLeft?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentSlide > 0) goToSlide(currentSlide - 1);
  });
  areaRight?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentSlide < images.length - 1) goToSlide(currentSlide + 1);
  });

  function renderGallery() {
    gallerySlides.innerHTML = images.map(src => `<img src="${src}" alt="">`).join('');
    galleryDots.innerHTML = '';
    images.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.className = 'gallery-dot';
      dot.addEventListener('click', () => goToSlide(i));
      galleryDots.appendChild(dot);
    });
    gallerySlides.style.transform = 'translateX(0)';
    updateDots();
  }

  function updateDots() {
    document.querySelectorAll('.gallery-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
  }
}

// --- Мобильное меню ---
function initMobileMenu() {
    const burger = document.getElementById('burger-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const scrollBtn = document.querySelector('.scroll-to-top');

    if (burger && mobileMenu) {
        function updateScrollButtonVisibility() {
            if (scrollBtn) {
                if (mobileMenu.classList.contains('active')) {
                    scrollBtn.style.opacity = '0';
                    scrollBtn.style.visibility = 'hidden';
                } else {
                    scrollBtn.style.opacity = '';
                    scrollBtn.style.visibility = '';
                    // Восстанавливаем исходное состояние (видимость по скроллу)
                    const isVisible = window.scrollY > 300;
                    if (isVisible) {
                        scrollBtn.classList.add('scroll-to-top--visible');
                    } else {
                        scrollBtn.classList.remove('scroll-to-top--visible');
                    }
                }
            }
        }

        burger.addEventListener('click', () => {
            burger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            updateScrollButtonVisibility();
        });

        document.querySelectorAll('.mobile-menu__link').forEach(link => {
            link.addEventListener('click', () => {
                burger.classList.remove('active');
                mobileMenu.classList.remove('active');
                updateScrollButtonVisibility();
            });
        });
    }
}

// --- Инициализация в зависимости от экрана ---
function initCards() {
  if (window.innerWidth <= 768) {
    initMobileCardsSlider();
  } else {
    initDesktopCards();
  }
}

// --- Запуск всего после загрузки DOM ---
document.addEventListener('DOMContentLoaded', () => {
  initCards();
  initGallery();
  initMobileMenu();

  (function initCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('cookie-accept');
    if (!banner || !acceptBtn) return;

    // Если уже давали согласие – скрываем баннер
    if (localStorage.getItem('cookie_consent') === 'accepted') {
        banner.style.display = 'none';
        return;
    }

    acceptBtn.addEventListener('click', () => {
        localStorage.setItem('cookie_consent', 'accepted');
        banner.style.display = 'none';
    });
})();

  // При ресайзе перезагружаем страницу, если пересечена граница 768px
  // window.addEventListener('resize', () => {
  //   if (
  //     (window.innerWidth <= 768 && !document.getElementById('cards-dots')?.children.length) ||
  //     (window.innerWidth > 768 && document.getElementById('cards-dots')?.children.length)
  //   ) {
  //     location.reload();
  //   }
  // });
});