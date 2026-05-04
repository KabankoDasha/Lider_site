document.addEventListener('DOMContentLoaded', function () {
  const container = document.getElementById('reviews-container');
  const loadMoreBtn = document.getElementById('load-more-btn');
  const noMoreMessage = document.getElementById('no-more-message');

  // Все карточки отзывов (в исходном порядке DOM)
  let allCards = Array.from(container.querySelectorAll('.review-card'));
  let currentCards = [...allCards];
  let visibleCount = 5;             // сколько карточек видно

  // Функция скрытия/показа карточек
  function updateVisibility() {
    currentCards.forEach((card, index) => {
      card.style.display = index < visibleCount ? '' : 'none';
    });

    // Управление кнопкой и сообщением
    if (visibleCount >= currentCards.length) {
      loadMoreBtn.style.display = 'none';
      noMoreMessage.style.display = 'block';
    } else {
      loadMoreBtn.style.display = 'inline-block';
      noMoreMessage.style.display = 'none';
    }
  }

  // Сортировка и перестановка DOM-элементов
  function sortAndReorder(sortType) {
    // Сортируем массив (исходный allCards)
    allCards.sort((a, b) => {
      const dateA = new Date(a.dataset.date);
      const dateB = new Date(b.dataset.date);
      const ratingA = parseInt(a.dataset.rating, 10);
      const ratingB = parseInt(b.dataset.rating, 10);

      switch (sortType) {
        case 'new':  return dateB - dateA;
        case 'old':  return dateA - dateB;
        case 'high': return ratingB - ratingA;
        case 'low':  return ratingA - ratingB;
        default:     return 0;
      }
    });

    // Перемещаем элементы в DOM в новом порядке (перед кнопкой)
    allCards.forEach(card => container.insertBefore(card, loadMoreBtn));

    // Обновляем рабочий массив
    currentCards = [...allCards];
    visibleCount = 5;
    updateVisibility();
  }

  // Инициализация (по умолчанию сортировка "новые")
  sortAndReorder('new');

  // Обработчики фильтра
  document.querySelectorAll('.filter-overlay__option').forEach(option => {
    option.addEventListener('click', function () {
      const sortType = this.dataset.sort;
      sortAndReorder(sortType);
      document.getElementById('filter-overlay').classList.remove('active');
    });
  });

  // Кнопка "Показать ещё"
  loadMoreBtn.addEventListener('click', function () {
    visibleCount += 2;
    updateVisibility();
  });

  // Логика открытия/закрытия оверлея фильтра
  const filterBtn = document.getElementById('filter-btn');
  const filterOverlay = document.getElementById('filter-overlay');
  if (filterBtn && filterOverlay) {
    filterBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      filterOverlay.classList.toggle('active');
    });
    document.addEventListener('click', function (e) {
      if (!filterOverlay.contains(e.target) && e.target !== filterBtn) {
        filterOverlay.classList.remove('active');
      }
    });
  }
});