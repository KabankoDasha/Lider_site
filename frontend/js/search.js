(function() {
    const searchInput = document.querySelector('.search-box__input');
    if (!searchInput) return;

    // Контейнер для подсказок
    const suggestionsBox = document.createElement('div');
    suggestionsBox.className = 'search-suggestions';
    suggestionsBox.style.display = 'none';
    searchInput.parentNode.appendChild(suggestionsBox);

    // Функция выполнения поиска
    function performSearch(query) {
        const q = query.toLowerCase().trim();
        if (!q) {
            suggestionsBox.style.display = 'none';
            return;
        }

        const results = searchIndex.filter(item =>
            item.title.toLowerCase().includes(q) ||
            item.keywords.includes(q)
        );

        if (results.length === 0) {
            suggestionsBox.innerHTML = '<div class="search-suggestions__no-results">Ничего не найдено</div>';
        } else {
            suggestionsBox.innerHTML = results.map(item => `
                <a href="${item.url}" class="search-suggestions__item">
                    <span class="search-suggestions__title">${item.title}</span>
                </a>
            `).join('');
        }
        suggestionsBox.style.display = 'block';
    }

    // Обработчик ввода
    searchInput.addEventListener('input', () => performSearch(searchInput.value));

    // Скрываем подсказки при клике вне поля
    document.addEventListener('click', (e) => {
        if (!searchInput.parentNode.contains(e.target)) {
            suggestionsBox.style.display = 'none';
        }
    });

    // Повторно показываем подсказки при фокусе, если есть текст
    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim()) performSearch(searchInput.value);
    });
})();