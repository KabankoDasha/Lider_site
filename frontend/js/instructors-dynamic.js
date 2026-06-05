(async function() {
  const theoryTrack = document.getElementById('theory-track');
  const drivingTrack = document.getElementById('driving-track');
  if (!theoryTrack && !drivingTrack) return;

  const token = localStorage.getItem('token');

  try {
    const response = await fetch('/api/instructors');
    if (!response.ok) throw new Error('Ошибка загрузки инструкторов');
    const instructors = await response.json();

    const theoryInstrs = instructors.filter(i => i.category === 'Преподаватель по теории');
    const drivingInstrs = instructors.filter(i => i.category === 'Инструктор по вождению');

    // Функция для отображения статических звёзд (средний рейтинг)
    function renderStaticStars(rating, container) {
      const fullStars = Math.floor(rating);
      const fraction = rating - fullStars;
      let starsHtml = '';
      for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
          starsHtml += '<span class="star star--active"></span>';
        } else if (i === fullStars && fraction > 0) {
          const fillPercent = fraction * 100;
          starsHtml += `<span class="star star--partial" style="--star-fill: ${fillPercent}%;"></span>`;
        } else {
          starsHtml += '<span class="star"></span>';
        }
      }
      container.innerHTML = starsHtml;
    }

    // Создание HTML карточки
    function createCard(instr) {
      const photoUrl = instr.photo 
          ? `/photos/${instr.photo}` 
          : '/images/placeholder.jpg';
      const hasCar = instr.car && instr.car.trim() !== '';
      const cardClass = hasCar ? 'instructor-card instructor-card--with-car' : 'instructor-card';
      const carImgHtml = hasCar 
          ? `<img src="/images/${instr.car.toLowerCase().replace(/\s+/g, '-')}.png" alt="Машина инструктора" class="instructor-card__car">` 
          : '';

      let detailsHtml = '';
      if (hasCar) {
          detailsHtml = `<p class="instructor-detail">Стаж вождения: <span class="value">${escapeHtml(instr.experience)}</span></p>
                        <p class="instructor-detail car-text">Автомобиль: <span class="value">${escapeHtml(instr.car)}</span></p>`;
      } else {
          detailsHtml = `<p class="instructor-detail">Стаж вождения: <span class="value">${escapeHtml(instr.experience)}</span></p>
                        <p class="instructor-detail">Образование: <span class="value">${escapeHtml(instr.education)}</span></p>`;
      }

      const isMobile = window.innerWidth <= 768;

      if (isMobile) {
          // Мобильная структура: детали (стаж, образование, картинка машины) внутри .instructor-card__info (под звёздами)
          return `
              <div class="${cardClass}" data-id="${instr.id}" data-rating="${instr.rating}" data-votes="${instr.votes_count}">
                  <div class="instructor-card__inner">
                      <div class="instructor-card__photo-wrapper">
                          <img src="${photoUrl}" alt="${escapeHtml(instr.name)}" class="instructor-card__photo">
                      </div>
                      <div class="instructor-card__info">
                          <h4 class="instructor-card__name">${escapeHtml(instr.name)}</h4>
                          <div class="instructor-card__rating">
                              <span class="rating-value">${instr.rating}</span>
                              <div class="stars static-stars"></div>
                              <span class="votes-count" data-votes="${instr.votes_count}">| Голосов: ${instr.votes_count}</span>
                          </div>
                          <div class="instructor-card__details">
                              ${detailsHtml}
                              ${carImgHtml}
                          </div>
                      </div>
                  </div>
              </div>
          `;
      } else {
          // Десктопная структура: детали после .instructor-card__inner (под фото)
          return `
              <div class="${cardClass}" data-id="${instr.id}" data-rating="${instr.rating}" data-votes="${instr.votes_count}">
                  <div class="instructor-card__inner">
                      <div class="instructor-card__photo-wrapper">
                          <img src="${photoUrl}" alt="${escapeHtml(instr.name)}" class="instructor-card__photo">
                      </div>
                      <div class="instructor-card__info">
                          <h4 class="instructor-card__name">${escapeHtml(instr.name)}</h4>
                          <div class="instructor-card__rating">
                              <span class="rating-value">${instr.rating}</span>
                              <div class="stars static-stars"></div>
                              <span class="votes-count" data-votes="${instr.votes_count}">| Голосов: ${instr.votes_count}</span>
                          </div>
                      </div>
                  </div>
                  <div class="instructor-card__details">
                      ${detailsHtml}
                  </div>
                  ${carImgHtml}
              </div>
          `;
      }
    }

    if (theoryTrack) {
      theoryTrack.innerHTML = theoryInstrs.map(createCard).join('');
      if (theoryInstrs.length === 0) theoryTrack.innerHTML = '<p style="text-align:center; width:100%;">Нет преподавателей</p>';
    }
    if (drivingTrack) {
      drivingTrack.innerHTML = drivingInstrs.map(createCard).join('');
      if (drivingInstrs.length === 0) drivingTrack.innerHTML = '<p style="text-align:center; width:100%;">Нет инструкторов</p>';
    }

    // Отрисовка статических звёзд
    document.querySelectorAll('.instructor-card').forEach(card => {
      const rating = parseFloat(card.dataset.rating) || 0;
      const starsContainer = card.querySelector('.static-stars');
      if (starsContainer) renderStaticStars(rating, starsContainer);
    });

    // ========== ИНТЕРАКТИВНЫЕ ЗВЁЗДЫ ДЛЯ АВТОРИЗОВАННЫХ (десктоп и мобильные) ==========
    if (token) {
      const cards = document.querySelectorAll('.instructor-card');
      const ratingPromises = [];
      cards.forEach(card => {
        const instructorId = card.dataset.id;
        ratingPromises.push(
          fetch(`/api/instructors/${instructorId}/user-rating`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          .then(res => res.ok ? res.json() : { rating: null })
          .catch(() => ({ rating: null }))
        );
      });
      const userRatings = await Promise.all(ratingPromises);
      
      cards.forEach((card, idx) => {
        const instructorId = card.dataset.id;
        const userRating = userRatings[idx]?.rating || null;
        card.dataset.userRating = userRating || '0';
        makeStarsInteractive(card, instructorId, userRating);
      });
    }

    function makeStarsInteractive(card, instructorId, currentUserRating) {
      const starsContainer = card.querySelector('.static-stars');
      if (!starsContainer) return;
      starsContainer.innerHTML = '';
      for (let i = 0; i < 5; i++) {
        const star = document.createElement('span');
        star.classList.add('star');
        star.classList.add('interactive');
        if (i < currentUserRating) star.classList.add('star--active');
        star.dataset.value = i + 1;
        starsContainer.appendChild(star);
      }
      
      const stars = starsContainer.querySelectorAll('.star');
      function highlightStars(rating) {
        stars.forEach((star, index) => {
          if (index < rating) star.classList.add('star--active');
          else star.classList.remove('star--active');
        });
      }
      
      stars.forEach(star => {
        star.addEventListener('mouseenter', () => {
          const val = parseInt(star.dataset.value);
          highlightStars(val);
        });
        star.addEventListener('mouseleave', () => {
          highlightStars(currentUserRating || 0);
        });
        star.addEventListener('click', () => {
          const selectedRating = parseInt(star.dataset.value);
          openRatingOverlay(card, instructorId, selectedRating);
        });
      });
    }

    // ========== ОВЕРЛЕЙ ОЦЕНКИ ==========
    const rateOverlay = document.getElementById('rate-instructor-overlay');
    const rateText = document.getElementById('rate-overlay-text');
    let pendingInstructorId = null;
    let pendingRating = null;
    let pendingCard = null;

    function openRatingOverlay(card, instructorId, rating) {
      pendingCard = card;
      pendingInstructorId = instructorId;
      pendingRating = rating;
      const ratingWord = rating === 1 ? 'звезду' : (rating < 5 ? 'звезды' : 'звезд');
      rateText.textContent = `Оценить инструктора на ${rating} ${ratingWord}?`;
      rateOverlay.classList.add('active');
    }

    function closeRatingOverlay() {
      rateOverlay.classList.remove('active');
      pendingInstructorId = null;
      pendingRating = null;
      pendingCard = null;
    }

    let confirmHandler = null;
    let cancelHandler = null;

    function bindOverlayHandlers() {
      const confirmBtn = document.getElementById('confirm-rate');
      const cancelBtn = document.getElementById('cancel-rate');
      if (!confirmBtn || !cancelBtn) return;

      if (confirmHandler) confirmBtn.removeEventListener('click', confirmHandler);
      if (cancelHandler) cancelBtn.removeEventListener('click', cancelHandler);

      confirmHandler = async () => {
        if (!pendingInstructorId) {
          closeRatingOverlay();
          return;
        }
        const token = localStorage.getItem('token');
        try {
          const res = await fetch(`/api/instructors/${pendingInstructorId}/rate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ rating: pendingRating })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Ошибка');

          const card = pendingCard;
          const ratingValueSpan = card.querySelector('.rating-value');
          const votesSpan = card.querySelector('.votes-count');
          ratingValueSpan.textContent = data.rating;
          votesSpan.textContent = `| Голосов: ${data.votes_count}`;
          votesSpan.setAttribute('data-votes', data.votes_count);

          const newUserRating = pendingRating;
          card.dataset.userRating = newUserRating;
          const starsContainer = card.querySelector('.static-stars');
          if (starsContainer) {
            starsContainer.innerHTML = '';
            for (let i = 0; i < 5; i++) {
              const star = document.createElement('span');
              star.classList.add('star', 'interactive');
              if (i < newUserRating) star.classList.add('star--active');
              star.dataset.value = i + 1;
              starsContainer.appendChild(star);
            }
            const newStars = starsContainer.querySelectorAll('.star');
            function highlightStarsInCard(rating) {
              newStars.forEach((s, idx) => {
                if (idx < rating) s.classList.add('star--active');
                else s.classList.remove('star--active');
              });
            }
            newStars.forEach(star => {
              star.addEventListener('mouseenter', () => {
                const val = parseInt(star.dataset.value);
                highlightStarsInCard(val);
              });
              star.addEventListener('mouseleave', () => {
                highlightStarsInCard(newUserRating);
              });
              star.addEventListener('click', () => {
                const selected = parseInt(star.dataset.value);
                openRatingOverlay(card, pendingInstructorId, selected);
              });
            });
          }
          card.dataset.rating = data.rating;
          card.dataset.votes = data.votes_count;
        } catch (err) {
          console.error(err);
          alert(err.message);
        } finally {
          closeRatingOverlay();
        }
      };

      cancelHandler = () => {
        closeRatingOverlay();
      };

      confirmBtn.addEventListener('click', confirmHandler);
      cancelBtn.addEventListener('click', cancelHandler);
    }
    bindOverlayHandlers();

    // ========== МОБИЛЬНЫЙ СЛАЙДЕР (СВАЙП, ТОЧКИ) ==========
    function initMobileSliders() {
      const isMobile = window.innerWidth <= 768;
      if (!isMobile) return;

      const sliders = [
        { trackId: 'theory-track', dotsId: 'theory-dots' },
        { trackId: 'driving-track', dotsId: 'driving-dots' }
      ];

      sliders.forEach(({ trackId, dotsId }) => {
        const track = document.getElementById(trackId);
        const dotsContainer = document.getElementById(dotsId);
        if (!track || !dotsContainer) return;

        const cards = track.querySelectorAll('.instructor-card');
        if (cards.length === 0) return;

        let currentIndex = 0;         
        let startX = 0;
        let isDragging = false;

        function getStep() {
          const cardWidth = cards[0].offsetWidth;
          const gap = parseInt(window.getComputedStyle(track).gap) || 20;
          return cardWidth + gap;
        }

        function updateSlider() {
          const offset = currentIndex * getStep();
          track.style.transform = `translateX(-${offset}px)`;
          updateMobileDots();
        }

        function updateMobileDots() {
          if (!dotsContainer) return;
          const dots = dotsContainer.querySelectorAll('.instructor-dot');
          if (dots.length === 0) return;
          // Определяем, к какой группе (0,1,2) относится текущий индекс
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

        function slideToGroup(groupIndex) {
          const groupSize = Math.ceil(cards.length / 3);
          let targetIndex = groupIndex * groupSize;
          if (targetIndex >= cards.length) targetIndex = cards.length - 1;
          currentIndex = targetIndex;
          updateSlider();
        }

        // Создаём 3 точки
        dotsContainer.innerHTML = '';
        for (let i = 0; i < 3; i++) {
          const dot = document.createElement('div');
          dot.classList.add('instructor-dot');
          if (i === 0) dot.classList.add('active');
          dot.addEventListener('click', () => {
            slideToGroup(i);
          });
          dotsContainer.appendChild(dot);
        }

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

        // Начальная позиция
        updateSlider();
      });
    }

    // ========== ДЕСКТОПНЫЙ СЛАЙДЕР (СТРЕЛКИ) ==========
    if (window.innerWidth > 768 && typeof initSliders === 'function') {
      initSliders();
    } else if (window.innerWidth <= 768) {
      initMobileSliders();
    }

  } catch (err) {
    console.error('Ошибка загрузки инструкторов:', err);
    if (theoryTrack) theoryTrack.innerHTML = '<p style="color:red;">Ошибка загрузки</p>';
    if (drivingTrack) drivingTrack.innerHTML = '<p style="color:red;">Ошибка загрузки</p>';
  }

  function escapeHtml(str) {
    return str.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'})[m]);
  }
})();