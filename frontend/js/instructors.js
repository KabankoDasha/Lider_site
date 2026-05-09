function updateStars(card) {
  const ratingElement = card.querySelector('.rating-value');
  if (!ratingElement) return;
  const ratingText = ratingElement.textContent.replace(',', '.');
  const rating = parseFloat(ratingText);
  if (isNaN(rating)) return;

  const fullStars = Math.floor(rating);
  const fraction = rating - fullStars;
  const fillPercent = fraction * 100;

  const starsContainer = card.querySelector('.stars');
  if (!starsContainer) return;

  let starsHtml = '';
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      starsHtml += '<span class="star star--active"></span>';
    } else if (i === fullStars && fraction > 0) {
      starsHtml += `<span class="star star--partial" style="--star-fill: ${fillPercent}%;"></span>`;
    } else {
      starsHtml += '<span class="star"></span>';
    }
  }
  starsContainer.innerHTML = starsHtml;
}

function initSliders() {
  const sliders = document.querySelectorAll('.instructor-slider');
  sliders.forEach(slider => {
    const track = slider.querySelector('.instructor-slider__track');
    const section = slider.closest('.instructor-section');
    const leftBtn = section.querySelector('.section-arrow--left');
    const rightBtn = section.querySelector('.section-arrow--right');
    const cards = track.querySelectorAll('.instructor-card');

    cards.forEach(card => updateStars(card));

    if (cards.length <= 2) {
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
      const maxOffset = (cards.length - 2) * getStep();
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
      const maxOffset = (cards.length - 2) * getStep();
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
}

// Если контент уже в DOM, инициализируем сразу (на случай, если скрипт подключается после загрузки)
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  if (document.querySelector('.instructor-card')) {
    initSliders();
  }
} else {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.instructor-card')) {
      initSliders();
    }
  });
}