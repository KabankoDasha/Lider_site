// main.js

// --- Данные карточек курсов ---
const coursesData = {
  a: { // Мотоцикл
    title: 'Обучение на мотоцикл',
    categoryText: 'Категория "A"',
    imgSmall: '../images/moto.svg',
    imgBig: '../images/gray2.svg',
    link: 'course-a.html',
    collapsedImg: '../images/gray2.svg',
    collapsedClass: 'card--collapsed2'
  },
  b: { // МКПП
    title: 'Обучение на автомобиль с МКПП',
    categoryText: 'Категория "B"',
    imgSmall: '../images/car1.svg',
    imgBig: '../images/gray1.svg',
    link: 'course-b.html',
    collapsedImg: '../images/gray1.svg',
    collapsedClass: 'card--collapsed1'
  },
  akpp: { // АКПП 
    title: 'Обучение на автомобиль с АКПП',
    categoryText: 'Категория "B" автомат',
    imgSmall: '../images/car2.svg',
    imgBig: '../images/gray3.svg',
    link: 'course-akpp.html',
    collapsedImg: '../images/gray3.svg',
    collapsedClass: 'card--collapsed1'
  },
  d: {
    title: 'Обучение на трактор',
    categoryText: 'Категория "D"',
    imgSmall: '../images/truck.svg',
    imgBig: '../images/gray4.svg',
    link: 'course-d.html',
    collapsedImg: '../images/gray4.svg',
    collapsedClass: 'card--collapsed2'
  },
  e: {
    title: 'Обучение на квадроцикл',
    categoryText: 'Категория "АI" с 16 лет',
    imgSmall: '../images/kvadro.svg',
    imgBig: '../images/gray5.svg',
    link: 'course-e.html',
    collapsedImg: '../images/gray5.svg',
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

// --- Переключение карточек курсов ---
const cardsContainer = document.querySelector('.cards');
if (cardsContainer) {
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

// --- Галерея филиалов ---
document.addEventListener('DOMContentLoaded', function() {
  const galleryOverlay = document.getElementById('gallery-overlay');
  const gallerySlides = document.getElementById('gallery-slides');
  const galleryDots = document.getElementById('gallery-dots');
  const areaLeft = document.getElementById('gallery-area-left');
  const areaRight = document.getElementById('gallery-area-right');
  let currentSlide = 0;
  let images = [];

// Открытие галереи при клике на обёртку с картинкой
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

  // Закрытие галереи при клике на фон (оверлей)
  galleryOverlay.addEventListener('click', (e) => {
    if (e.target === galleryOverlay) {
      galleryOverlay.classList.remove('active');
    }
  });

  // Переключение слайдов по клику на левую / правую половину
  function goToSlide(index) {
    currentSlide = index;
    gallerySlides.style.transform = `translateX(-${index * 100}%)`;
    updateDots();
  }
  areaLeft.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentSlide > 0) goToSlide(currentSlide - 1);
  });
  areaRight.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentSlide < images.length - 1) goToSlide(currentSlide + 1);
  });

  // Отрисовка галереи
  function renderGallery() {
    gallerySlides.innerHTML = images.map(src => `<img src="${src}" alt="">`).join('');
    // Точки
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
});