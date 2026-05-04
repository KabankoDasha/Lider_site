document.addEventListener('DOMContentLoaded', function() {
    const slider = document.getElementById('promo-slider');
    if (!slider) return;

    const track = slider.querySelector('.promo-slider__track');
    const cards = track.querySelectorAll('.promo-card');
    if (cards.length <= 3) return;   // если карточек мало, слайдер не нужен

    const section = slider.closest('.promo-section');
    const leftBtn = section.querySelector('.promo-arrow--left');
    const rightBtn = section.querySelector('.promo-arrow--right');

    // Устанавливаем начальное состояние: левая неактивна
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
});