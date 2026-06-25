// Данные карточек курсов 
const coursesData = {
  a: {
    title: 'Обучение на мотоцикл',
    categoryText: 'Категория "A"',
    imgSmall: '/images/moto.png',
    imgBig: '/images/gray2.png',
    link: '/courses-data?id=3',
    collapsedImg: '/images/gray2.png',
    collapsedClass: 'card--collapsed2'
  },
  b: {
    title: 'Обучение на автомобиль с МКПП',
    categoryText: 'Категория "B"',
    imgSmall: '/images/car1.png',
    imgBig: '/images/gray1.png',
    link: '/courses-data?id=1',
    collapsedImg: '/images/gray1.png',
    collapsedClass: 'card--collapsed1'
  },
  akpp: {
    title: 'Обучение на автомобиль с АКПП',
    categoryText: 'Категория "B" автомат',
    imgSmall: '/images/car2.png',
    imgBig: '/images/gray3.png',
    link: '/courses-data?id=2',
    collapsedImg: '/images/gray3.png',
    collapsedClass: 'card--collapsed1'
  },
  d: {
    title: 'Обучение на трактор',
    categoryText: 'Категория "D"',
    imgSmall: '/images/truck.png',
    imgBig: '/images/gray4.png',
    link: '/courses-data?id=6',
    collapsedImg: '/images/gray4.png',
    collapsedClass: 'card--collapsed2'
  },
  e: {
    title: 'Обучение на квадроцикл',
    categoryText: 'Категория "АI" с 16 лет',
    imgSmall: '/images/kvadro.png',
    imgBig: '/images/gray5.png',
    link: '/courses-data?id=12',
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
                    // Восстанавливаем исходное состояние 
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
function initCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    const acceptBtns = document.querySelectorAll('#cookie-accept'); 
    if (!banner || !acceptBtns.length) return;

    if (localStorage.getItem('cookie_consent') === 'accepted') {
        banner.style.display = 'none';
        return;
    }

    acceptBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            localStorage.setItem('cookie_consent', 'accepted');
            banner.style.display = 'none';
        });
    });
}

// Анимация появления карточек "Как получить права?"
function initStepsAnimation() {
    const stepCards = document.querySelectorAll('.step-card--animate');
    if (!stepCards.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.2,
        once: true  
    });

    stepCards.forEach(card => {
        observer.observe(card);
    });
}

// Слайдер филиалов с прогресс-баром
function initBranchesSlider() {
    const slider = document.getElementById('branches-slider');
    const progressBar = document.getElementById('branches-progress');
    if (!slider || !progressBar) return;

    function updateProgress() {
        const scrollLeft = slider.scrollLeft;
        const scrollWidth = slider.scrollWidth - slider.clientWidth;
        if (scrollWidth <= 0) return;
        const progress = scrollLeft / scrollWidth;
        const trackWidth = progressBar.parentElement.clientWidth;
        const barWidth = progressBar.offsetWidth || 80; // fallback если 0
        const maxOffset = trackWidth - barWidth;
        progressBar.style.transform = `translateX(${progress * maxOffset}px)`;
    }

    slider.addEventListener('scroll', function() {
        requestAnimationFrame(updateProgress);
    });
    
    window.addEventListener('resize', function() {
        requestAnimationFrame(updateProgress);
    });
    
    setTimeout(updateProgress, 100);
    setTimeout(updateProgress, 300);
    setTimeout(updateProgress, 500);
}

// Галерея филиалов 
function initBranchGallery() {
    const slides = document.querySelectorAll('.branch-card-slide');
    
    slides.forEach(slide => {
        const imagesData = slide.dataset.images;
        if (!imagesData) return;
        
        let images;
        try {
            images = JSON.parse(imagesData);
        } catch (e) {
            console.error('Ошибка парсинга data-images:', e);
            return;
        }
        
        if (images.length === 0) return;
        
        const imgElement = slide.querySelector('.branch-card-slide__img');
        const dots = slide.querySelectorAll('.branch-card-slide__dot');
        const leftArrow = slide.querySelector('.branch-card-slide__arrow--left');
        const rightArrow = slide.querySelector('.branch-card-slide__arrow--right');
        
        let currentIndex = 0;
        let isAnimating = false;
        
        function updateGallery(index) {
            if (isAnimating) return;
            isAnimating = true;
            
            currentIndex = index;
            
            // Плавная смена картинки
            imgElement.style.opacity = '0';
            
            setTimeout(() => {
                imgElement.src = images[currentIndex];
                imgElement.style.opacity = '1';
                isAnimating = false;
            }, 300);
            
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
            });
        }
        
        function nextImage(e) {
            if (e) e.stopPropagation();
            const newIndex = (currentIndex + 1) % images.length;
            updateGallery(newIndex);
        }
        
        function prevImage(e) {
            if (e) e.stopPropagation();
            const newIndex = (currentIndex - 1 + images.length) % images.length;
            updateGallery(newIndex);
        }
        
        // Обработчики для стрелок
        if (leftArrow) {
            leftArrow.addEventListener('click', prevImage);
        }
        if (rightArrow) {
            rightArrow.addEventListener('click', nextImage);
        }
        
        // Обработчики для точек
        dots.forEach((dot, i) => {
            dot.addEventListener('click', function(e) {
                e.stopPropagation();
                if (i !== currentIndex) {
                    updateGallery(i);
                }
            });
        });
        
        // Свайп на мобильных
        let touchStartX = 0;
        let touchEndX = 0;
        
        const wrapper = slide.querySelector('.branch-card-slide__image-wrapper');
        if (wrapper) {
            wrapper.addEventListener('touchstart', function(e) {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });
            
            wrapper.addEventListener('touchend', function(e) {
                touchEndX = e.changedTouches[0].screenX;
                const diff = touchStartX - touchEndX;
                
                if (Math.abs(diff) > 30) {
                    if (diff > 0) {
                        nextImage(e);
                    } else {
                        prevImage(e);
                    }
                }
            }, { passive: true });
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initCards();
    initGallery();
    initMobileMenu();
    initCookieBanner();
    initStepsAnimation();    
    initBranchesSlider();  
    initBranchGallery();   
});