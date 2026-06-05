function initPromoSlider() {
    const slider = document.getElementById('promo-slider');
    if (!slider) return;

    const track = slider.querySelector('.promo-slider__track');
    const cards = track.querySelectorAll('.promo-card');
    if (cards.length === 0) return;

    const isMobile = window.innerWidth <= 768;

    // Удаляем старые точки
    const oldDots = document.querySelector('.promo-dots');
    if (oldDots) oldDots.remove();

    // Скрываем стрелки на мобильных
    const controls = document.querySelector('.promo-section__controls');
    if (controls) {
        controls.style.display = isMobile ? 'none' : 'flex';
    }

    if (isMobile) {
        // Мобильная версия
        let currentIndex = 0;         
        let startX = 0;
        let isDragging = false;

        function getStep() {
            const cardWidth = cards[0].offsetWidth;
            const gap = parseInt(window.getComputedStyle(track).gap) || 20;
            return cardWidth + gap;
        }

        function getMaxOffset() {
            const step = getStep();
            const maxIndex = cards.length - 1;
            return maxIndex * step;
        }

        function updateSlider() {
            const offset = currentIndex * getStep();
            track.style.transform = `translateX(-${offset}px)`;
            updateMobileDots();
        }

        function nextSlide() {
            const step = getStep();
            if (currentIndex < cards.length - 1) {
                currentIndex++;
                updateSlider();
            }
        }

        function prevSlide() {
            const step = getStep();
            if (currentIndex > 0) {
                currentIndex--;
                updateSlider();
            }
        }

        // Переход к первому слайду в группе 
        function slideToGroup(groupIndex) {
            const groupSize = Math.ceil(cards.length / 3);
            let targetIndex = groupIndex * groupSize;
            if (targetIndex >= cards.length) targetIndex = cards.length - 1;
            currentIndex = targetIndex;
            updateSlider();
        }

        // Обновление активной точки в зависимости от текущей группы
        function updateMobileDots() {
            const dots = document.querySelectorAll('.promo-dot');
            if (dots.length === 0) return;
            const groupIndex = Math.floor((currentIndex / cards.length) * 3);
            const activeGroup = Math.min(2, Math.max(0, groupIndex));
            dots.forEach((dot, idx) => {
                if (idx === activeGroup) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }

        // Создаём 3 точки
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'promo-dots';
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.classList.add('promo-dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                slideToGroup(i);
            });
            dotsContainer.appendChild(dot);
        }
        slider.parentNode.insertBefore(dotsContainer, slider.nextSibling);

        window.addEventListener('resize', () => {
            setTimeout(() => {
                // Пересчитываем текущую позицию и обновляем слайдер
                const step = getStep();
                const newOffset = currentIndex * step;
                track.style.transform = `translateX(-${newOffset}px)`;
                // Обновляем точки (если нужно)
                updateMobileDots();
            }, 100);
        });

        // Обработка свайпа
        track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        });

        track.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const diffX = e.touches[0].clientX - startX;
            if (Math.abs(diffX) > 50) {
                if (diffX > 0) prevSlide();
                else nextSlide();
                isDragging = false;
            }
        });

        track.addEventListener('touchend', () => {
            isDragging = false;
        });

        // Инициализация
        updateSlider();
    } else {
        // Десктопная версия со стрелками
        const section = slider.closest('.promo-section');
        const leftBtn = section.querySelector('.promo-arrow--left');
        const rightBtn = section.querySelector('.promo-arrow--right');
        if (!leftBtn || !rightBtn) return;

        if (cards.length <= 3) {
            leftBtn.classList.add('disabled');
            rightBtn.classList.add('disabled');
            return;
        }

        leftBtn.classList.add('disabled');
        rightBtn.classList.remove('disabled');

        function getStep() {
            const cardWidth = cards[0].offsetWidth;
            const gap = parseInt(window.getComputedStyle(track).gap) || 40;
            return cardWidth + gap;
        }

        let currentOffset = 0;

        function updateButtons() {
            const maxOffset = (cards.length - 3) * getStep();
            if (currentOffset <= 0) leftBtn.classList.add('disabled');
            else leftBtn.classList.remove('disabled');
            if (currentOffset >= maxOffset) rightBtn.classList.add('disabled');
            else rightBtn.classList.remove('disabled');
        }

        function scrollTo(offset) {
            track.style.transition = 'transform 0.3s ease';
            track.style.transform = `translateX(-${offset}px)`;
            currentOffset = offset;
            updateButtons();
        }

        leftBtn.addEventListener('click', () => {
            if (!leftBtn.classList.contains('disabled')) {
                scrollTo(Math.max(currentOffset - getStep(), 0));
            }
        });
        rightBtn.addEventListener('click', () => {
            const maxOffset = (cards.length - 3) * getStep();
            if (!rightBtn.classList.contains('disabled')) {
                scrollTo(Math.min(currentOffset + getStep(), maxOffset));
            }
        });

        window.addEventListener('resize', () => {
            track.style.transition = 'none';
            track.style.transform = `translateX(-${currentOffset}px)`;
            setTimeout(() => track.style.transition = '', 0);
            updateButtons();
        });

        updateButtons();
    }
}

// Переинициализация при изменении размера окна
window.addEventListener('resize', () => {
    setTimeout(initPromoSlider, 100);
});

// Запуск после загрузки DOM 
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('sales-container')?.children.length > 0) {
        initPromoSlider();
    }
});