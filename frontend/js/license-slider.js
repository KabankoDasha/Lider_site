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
    
    function updateSliderParams() {
        const trackEl = track;
        if (!trackEl) return;
        const firstSlide = trackEl.querySelector('.license-slide');
        if (!firstSlide) return;
        
        const slideWidth = firstSlide.offsetWidth;
        const gap = parseInt(getComputedStyle(trackEl).gap) || 20;
        step = slideWidth + gap;
        
        const containerWidth = trackEl.parentElement?.parentElement?.clientWidth || window.innerWidth;
        // Определяем, сколько слайдов помещается в видимую область
        visibleCount = Math.max(1, Math.floor(containerWidth / (slideWidth + gap)));
        maxOffset = Math.max(0, (slides.length - visibleCount) * step);
        
        // Если текущее смещение стало больше нового максимума — корректируем
        if (currentOffset > maxOffset) {
            currentOffset = maxOffset;
        }
        updateTransform();
        updateArrows();
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
            updateTransform();
            updateArrows();
        }
    }
    
    function slidePrev() {
        if (currentOffset > 0) {
            currentOffset = Math.max(currentOffset - step, 0);
            updateTransform();
            updateArrows();
        }
    }
    
    function initSlider() {
        buildSlides();
        slides = Array.from(track.querySelectorAll('.license-slide'));
        if (slides.length === 0) return;
        
        // Дождёмся загрузки хотя бы одного изображения, чтобы получить точные размеры
        const firstImg = slides[0].querySelector('img');
        if (firstImg && firstImg.complete) {
            updateSliderParams();
        } else if (firstImg) {
            firstImg.addEventListener('load', () => updateSliderParams());
        } else {
            updateSliderParams();
        }
        
        window.addEventListener('resize', () => {
            updateSliderParams();
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