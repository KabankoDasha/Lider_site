document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('reviews-container');
  const loadMoreBtn = document.getElementById('load-more-btn');
  const noMoreMessage = document.getElementById('no-more-message');

  let allReviews = [];           // все отзывы с сервера
  let visibleCount = 5;         // сколько показано
  let currentSort = 'new';      // текущая сортировка

  // Функция рендеринга отзывов (с учётом сортировки и пагинации)
  function renderReviews() {
    // Сортируем согласно currentSort
    let sorted = [...allReviews];
    switch (currentSort) {
      case 'new':
        sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'old':
        sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'high':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'low':
        sorted.sort((a, b) => a.rating - b.rating);
        break;
    }

    // Очищаем контейнер, оставляя кнопку и сообщение
    container.innerHTML = '';

    const toShow = sorted.slice(0, visibleCount);
    toShow.forEach(review => {
      const starsHtml = Array.from({ length: 5 }, (_, i) =>
        `<span class="star ${i < review.rating ? 'star--active' : ''}"></span>`
      ).join('');

      const dateStr = new Date(review.created_at).toLocaleDateString('ru-RU', {
        day: 'numeric', month: 'long', year: 'numeric'
      });

      const card = document.createElement('article');
      card.className = 'review-card';
      card.innerHTML = `
        <div class="review-card__header">
          <div>
            <h3 class="review-card__name">${escapeHtml(review.name)}</h3>
            <p class="review-card__course">${escapeHtml(review.course || '')}</p>
          </div>
          <div class="review-card__stars" aria-label="Оценка ${review.rating} из 5">
            ${starsHtml}
          </div>
        </div>
        <p class="review-card__text">${escapeHtml(review.text)}</p>
        <span class="review-card__date">${dateStr}</span>
      `;
      container.appendChild(card);
    });

    // Добавляем кнопку "Показать ещё" и сообщение
    container.appendChild(loadMoreBtn);
    container.appendChild(noMoreMessage);

    // Управление видимостью
    if (visibleCount >= sorted.length) {
      loadMoreBtn.style.display = 'none';
      noMoreMessage.style.display = 'block';
    } else {
      loadMoreBtn.style.display = 'inline-block';
      noMoreMessage.style.display = 'none';
    }
  }

  // Загрузка отзывов с сервера
  async function loadReviews() {
    try {
      const response = await fetch('http://localhost:3001/api/reviews');
      if (!response.ok) throw new Error('Ошибка загрузки');
      allReviews = await response.json();
      visibleCount = 5;
      renderReviews();
    } catch (err) {
      console.error(err);
      container.innerHTML = '<p style="color:red; text-align:center;">Не удалось загрузить отзывы</p>';
    }
  }

  // Обработчики фильтров
  document.querySelectorAll('.filter-overlay__option').forEach(option => {
    option.addEventListener('click', function () {
      currentSort = this.dataset.sort;
      visibleCount = 5;
      renderReviews();
      document.getElementById('filter-overlay').classList.remove('active');
    });
  });

  // Кнопка "Показать ещё"
  loadMoreBtn.addEventListener('click', () => {
    visibleCount += 2;
    renderReviews();
  });

  // Логика открытия/закрытия оверлея фильтра (без изменений)
  const filterBtn = document.getElementById('filter-btn');
  const filterOverlay = document.getElementById('filter-overlay');
  if (filterBtn && filterOverlay) {
    filterBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      filterOverlay.classList.toggle('active');
    });
    document.addEventListener('click', (e) => {
      if (!filterOverlay.contains(e.target) && e.target !== filterBtn) {
        filterOverlay.classList.remove('active');
      }
    });
  }

  // Загрузка при старте
  await loadReviews();

  function escapeHtml(str) {
    return str.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'})[m]);
  }
});