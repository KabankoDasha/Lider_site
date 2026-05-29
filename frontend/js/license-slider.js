(function() {
    // КОНФИГУРАЦИЯ 
    const TOTAL_IMAGES = 21;              
    const IMAGE_BASE_PATH = '../images/license/';   
    const IMAGE_EXT = '.jpg';              
    
    // Элементы DOM
    const track = document.getElementById('licenseTrack');
    const leftBtn = document.getElementById('licenseArrowLeft');
    const rightBtn = document.getElementById('licenseArrowRight');
    
    if (!track) return;
    
    // ГЕНЕРАЦИЯ СЛАЙДОВ 
    function buildSlides() {
        track.innerHTML = '';
        for (let i = 1; i <= TOTAL_IMAGES; i++) {
            const slide = document.createElement('div');
            slide.className = 'license-slide';
            const img = document.createElement('img');
            img.src = `${IMAGE_BASE_PATH}license${i}${IMAGE_EXT}`;
            img.alt = `Лицензия или свидетельство №${i}`;
            img.className = 'license-slide__img';
            img.loading = 'lazy';
            // клик для открытия в полном размере
            img.addEventListener('click', (e) => {
                e.stopPropagation();
                window.open(img.src, '_blank');
            });
            slide.appendChild(img);
            track.appendChild(slide);
        }
    }
    
    // СЛАЙДЕР 
    let slides = [];
    let currentOffset = 0;
    let step = 0;
    let maxOffset = 0;
    let visibleCount = 1;
    let currentIndex = 0;      // индекс текущего первого видимого слайда (0-based)
    
    function updateSliderParams() {
        const trackEl = track;
        if (!trackEl) return;
        const firstSlide = trackEl.querySelector('.license-slide');
        if (!firstSlide) return;
        
        const slideWidth = firstSlide.offsetWidth;
        const gap = parseInt(getComputedStyle(trackEl).gap) || 20;
        step = slideWidth + gap;
        
        const containerWidth = trackEl.parentElement?.parentElement?.clientWidth || window.innerWidth;
        visibleCount = Math.max(1, Math.floor(containerWidth / (slideWidth + gap)));
        maxOffset = Math.max(0, (slides.length - visibleCount) * step);
        
        // Пересчитываем currentIndex из currentOffset
        if (step > 0) {
            currentIndex = Math.round(currentOffset / step);
        }
        if (currentOffset > maxOffset) {
            currentOffset = maxOffset;
            currentIndex = slides.length - visibleCount;
        }
        updateTransform();
        updateArrows();
        updateMobileDots(); // обновляем активную точку
    }
    
    function updateTransform() {
        if (!track) return;
        track.style.transform = `translateX(-${currentOffset}px)`;
    }
    
    function updateArrows() {
        if (!leftBtn || !rightBtn) return;
        if (currentOffset <= 0) {
            leftBtn.classList.add('disabled');
        } else {
            leftBtn.classList.remove('disabled');
        }
        if (currentOffset >= maxOffset) {
            rightBtn.classList.add('disabled');
        } else {
            rightBtn.classList.remove('disabled');
        }
    }
    
    function slideNext() {
        if (currentOffset < maxOffset) {
            currentOffset = Math.min(currentOffset + step, maxOffset);
            currentIndex = Math.round(currentOffset / step);
            updateTransform();
            updateArrows();
            updateMobileDots();
        }
    }
    
    function slidePrev() {
        if (currentOffset > 0) {
            currentOffset = Math.max(currentOffset - step, 0);
            currentIndex = Math.round(currentOffset / step);
            updateTransform();
            updateArrows();
            updateMobileDots();
        }
    }
    
    // Переход к конкретному слайду по индексу (0-based)
    function slideToIndex(index) {
        if (index < 0) index = 0;
        if (index > slides.length - visibleCount) index = slides.length - visibleCount;
        currentIndex = index;
        currentOffset = currentIndex * step;
        updateTransform();
        updateArrows();
        updateMobileDots();
    }
    
    // ========== МОБИЛЬНЫЕ ТОЧКИ (3 штуки, навигация по группам) ==========
    let dotsContainer = null;
    let mobileDots = [];
    
    function initMobileDots() {
        // Удаляем старый контейнер, если есть
        const oldContainer = document.querySelector('.license-dots');
        if (oldContainer) oldContainer.remove();
        
        dotsContainer = document.createElement('div');
        dotsContainer.className = 'license-dots';
        // Создаём ровно 3 точки
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.classList.add('license-dot');
            dot.dataset.group = i;
            dot.addEventListener('click', () => {
                // Определяем, к какому слайду перейти при клике на точку
                const groupSize = Math.ceil(slides.length / 3);
                let targetIndex = i * groupSize;
                if (targetIndex >= slides.length) targetIndex = slides.length - 1;
                slideToIndex(targetIndex);
            });
            dotsContainer.appendChild(dot);
            mobileDots.push(dot);
        }
        // Вставляем после обёртки слайдера
        const sliderSection = document.querySelector('.license-slider-section');
        if (sliderSection) {
            sliderSection.appendChild(dotsContainer);
        } else {
            track.parentElement.parentElement.parentElement.appendChild(dotsContainer);
        }
        updateMobileDots();
    }
    
    function updateMobileDots() {
        if (!mobileDots.length) return;
        // Определяем группу текущего слайда: всего 3 группы
        const groupIndex = Math.floor((currentIndex / slides.length) * 3);
        // Ограничиваем от 0 до 2
        const activeGroup = Math.min(2, Math.max(0, groupIndex));
        mobileDots.forEach((dot, idx) => {
            if (idx === activeGroup) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    // ========== МОБИЛЬНЫЙ СВАЙП ==========
    let touchStartX = 0;
    let touchEndX = 0;
    let isSwiping = false;
    
    function initSwipe() {
        const sliderContainer = track.parentElement; // .license-slider-clip
        if (!sliderContainer) return;
        
        sliderContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            isSwiping = true;
        });
        
        sliderContainer.addEventListener('touchmove', (e) => {
            if (!isSwiping) return;
            const deltaX = e.changedTouches[0].screenX - touchStartX;
            if (Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    slidePrev(); // свайп вправо -> предыдущий
                } else {
                    slideNext(); // свайп влево -> следующий
                }
                isSwiping = false;
            }
        });
        
        sliderContainer.addEventListener('touchend', () => {
            isSwiping = false;
        });
    }
    
    // ========== ИНИЦИАЛИЗАЦИЯ ==========
    function initSlider() {
        buildSlides();
        slides = Array.from(track.querySelectorAll('.license-slide'));
        if (slides.length === 0) return;
        
        const firstImg = slides[0].querySelector('img');
        const doResize = () => {
            updateSliderParams();
            // На мобильных инициализируем точки и свайп
            if (window.innerWidth <= 768) {
                if (!dotsContainer) initMobileDots();
                initSwipe();
            } else {
                // На десктопе удаляем точки, если были
                if (dotsContainer) {
                    dotsContainer.remove();
                    dotsContainer = null;
                    mobileDots = [];
                }
            }
        };
        
        if (firstImg && firstImg.complete) {
            doResize();
        } else if (firstImg) {
            firstImg.addEventListener('load', doResize);
        } else {
            doResize();
        }
        
        window.addEventListener('resize', () => {
            doResize();
        });
        
        if (leftBtn) leftBtn.addEventListener('click', slidePrev);
        if (rightBtn) rightBtn.addEventListener('click', slideNext);
    }
    
    // Запуск после полной загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSlider);
    } else {
        initSlider();
    }
})();