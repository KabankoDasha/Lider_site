(function() {
    // Функция обновления звёзд в карточке с учётом дробного рейтинга
    function updateStars(card) {
        const ratingElement = card.querySelector('.rating-value');
        if (!ratingElement) return;

        const ratingText = ratingElement.textContent.replace(',', '.');
        const rating = parseFloat(ratingText);
        if (isNaN(rating)) return;

        const fullStars = Math.floor(rating);          // количество полностью закрашенных звёзд
        const fraction = rating - fullStars;           // дробная часть (0..1)
        const fillPercent = fraction * 100;            // процент заполнения последней звезды

        const starsContainer = card.querySelector('.instructor-card__rating .stars');
        if (!starsContainer) return;

        let starsHtml = '';
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                // Полностью активная звезда
                starsHtml += '<span class="star star--active"></span>';
            } else if (i === fullStars && fraction > 0) {
                // Частично заполненная звезда с дробной частью
                starsHtml += `<span class="star star--partial" style="--star-fill: ${fillPercent}%;"></span>`;
            } else {
                // Пустая звезда (неактивная)
                starsHtml += '<span class="star"></span>';
            }
        }
        starsContainer.innerHTML = starsHtml;
    }

    // Инициализация слайдера
    const sliders = document.querySelectorAll('.instructor-slider');

    sliders.forEach(slider => {
        const track = slider.querySelector('.instructor-slider__track');
        const section = slider.closest('.instructor-section');
        const leftBtn = section.querySelector('.section-arrow--left');
        const rightBtn = section.querySelector('.section-arrow--right');
        const cards = track.querySelectorAll('.instructor-card');

        // Обновляем звёзды для всех карточек в этом слайдере
        cards.forEach(card => updateStars(card));

        // Если карточек не больше 2 – обе кнопки неактивны
        if (cards.length <= 2) {
            leftBtn.classList.add('disabled');
            rightBtn.classList.add('disabled');
            return;
        }

        // Убираем disabled, которые могли быть проставлены в HTML, и задаём начальное состояние
        leftBtn.classList.add('disabled');    // левая изначально неактивна (нет заливки)
        rightBtn.classList.remove('disabled'); // правая активна (красная)

        function getStep() {
            const cardWidth = cards[0].offsetWidth;
            const gap = parseInt(window.getComputedStyle(track).gap) || 40;
            return cardWidth + gap;
        }

        let currentOffset = 0;

        function updateButtons() {
            const maxOffset = (cards.length - 2) * getStep();
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
            const maxOffset = (cards.length - 2) * getStep();
            if (!rightBtn.classList.contains('disabled')) {
                scrollTo(Math.min(currentOffset + getStep(), maxOffset));
            }
        });

        // При ресайзе пересчитываем и обновляем кнопки
        window.addEventListener('resize', () => {
            track.style.transition = 'none';
            track.style.transform = `translateX(-${currentOffset}px)`;
            setTimeout(() => track.style.transition = '', 0);
            updateButtons();
        });

        // Вызываем при загрузке, чтобы обновить кнопки в соответствии с начальным оффсетом (0)
        updateButtons();
    });
})();