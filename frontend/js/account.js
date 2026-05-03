document.addEventListener('DOMContentLoaded', () => {

    // Переключение вкладок
    const menuItems = document.querySelectorAll('.sidebar-menu__item');
    const panels = document.querySelectorAll('.content-panel');

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            menuItems.forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            panels.forEach(panel => panel.classList.remove('active'));
            document.getElementById(`panel-${item.dataset.target}`).classList.add('active');
        });
    });

    // --- Оверлей удаления заявки / отзыва ---
    const deleteOverlay = document.getElementById('delete-overlay');
    const deleteOverlayText = document.getElementById('delete-overlay-text');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    const cancelDeleteBtn = document.getElementById('cancel-delete');
    const successOverlay = document.getElementById('success-delete-overlay');

    document.body.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-item-btn');
        if (!deleteBtn) return;
        const type = deleteBtn.dataset.type;
        deleteOverlayText.innerHTML = `Вы уверены, что хотите<br>удалить ${type === 'review' ? 'отзыв' : 'заявку'}?`;
        successOverlay.querySelector('.success-overlay__text').textContent = 
            type === 'review' ? 'Ваш отзыв удалён!' : 'Заявка успешно удалена!';
        deleteOverlay.dataset.itemElement = '';
        deleteOverlay.dataset.itemElement = deleteBtn.closest('.application-card, .review-card');
        deleteOverlay.classList.add('active');
    });

    cancelDeleteBtn.addEventListener('click', () => deleteOverlay.classList.remove('active'));

    confirmDeleteBtn.addEventListener('click', () => {
        const cardElement = deleteOverlay.dataset.itemElement;
        if (cardElement && cardElement.parentNode) {
            cardElement.parentNode.removeChild(cardElement);
        }
        deleteOverlay.classList.remove('active');
        successOverlay.classList.add('active');
    });

    successOverlay.addEventListener('click', (e) => {
        if (e.target === successOverlay) successOverlay.classList.remove('active');
    });

    // --- Оверлей выхода ---
    const logoutOverlay = document.getElementById('logout-overlay');
    document.getElementById('logout-btn').addEventListener('click', () => logoutOverlay.classList.add('active'));
    document.getElementById('cancel-logout').addEventListener('click', () => logoutOverlay.classList.remove('active'));
    document.getElementById('confirm-logout').addEventListener('click', () => {
        window.location.href = '../pages/login.html';
    });

    // --- Оверлей удаления аккаунта ---
    const deleteAccountOverlay = document.getElementById('delete-account-overlay');
    document.getElementById('delete-account-btn').addEventListener('click', () => deleteAccountOverlay.classList.add('active'));
    document.getElementById('cancel-delete-account').addEventListener('click', () => deleteAccountOverlay.classList.remove('active'));
    document.getElementById('confirm-delete-account').addEventListener('click', () => {
        alert('Аккаунт удалён');
        deleteAccountOverlay.classList.remove('active');
    });

    // --- Форма отзыва (кастомные селекты) ---
    function initReviewSelect(container) {
        const trigger = container.querySelector('.review-custom-select__trigger');
        const selected = container.querySelector('.review-custom-select__selected');
        const options = container.querySelectorAll('.review-custom-select__options li');
        const nativeSelect = container.querySelector('.review-custom-select__native');

        trigger.addEventListener('click', () => container.classList.toggle('open'));

        options.forEach(opt => {
            opt.addEventListener('click', () => {
                const value = opt.dataset.value;
                selected.textContent = value;
                selected.classList.remove('placeholder');
                nativeSelect.value = value;
                container.classList.remove('open');
            });
        });

        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) container.classList.remove('open');
        });
    }

    const reviewFormOverlay = document.getElementById('review-form-overlay');
    const openReviewBtn = document.getElementById('open-review-form');
    const closeReviewBtn = document.getElementById('close-review-form-btn');
    const submitReviewBtn = document.getElementById('submit-review-btn');
    const reviewSuccessOverlay = document.getElementById('review-success-overlay');

    openReviewBtn.addEventListener('click', () => reviewFormOverlay.classList.add('active'));
    closeReviewBtn.addEventListener('click', () => reviewFormOverlay.classList.remove('active'));
    reviewFormOverlay.addEventListener('click', (e) => {
        if (e.target === reviewFormOverlay) reviewFormOverlay.classList.remove('active');
    });

    // Инициализация кастомных селектов отзыва
    document.querySelectorAll('.review-custom-select').forEach(select => initReviewSelect(select));

    submitReviewBtn.addEventListener('click', () => {
        const name = document.getElementById('review-name').value.trim() || 'Аноним';
        const course = document.getElementById('review-course').value || 'Курс не выбран';
        const text = document.getElementById('review-text').value.trim() || 'Без текста';
        const grade = parseInt(document.getElementById('review-grade').value) || 5;

        const starsHtml = Array.from({ length: 5 }, (_, i) =>
            `<span class="star ${i < grade ? 'star--active' : ''}"></span>`
        ).join('');

        const today = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
        const card = document.createElement('article');
        card.className = 'review-card';
        card.innerHTML = `
            <div class="review-card__header">
                <div>
                    <h4 class="review-card__name">${name}</h4>
                    <p class="review-card__course">${course}</p>
                </div>
                <div class="review-card__stars">${starsHtml}</div>
            </div>
            <p class="review-card__text">${text}</p>
            <time class="review-card__date">${today}</time>
            <button class="application-delete-btn delete-item-btn" data-type="review">
                <img src="../images/krest.svg" alt="Удалить отзыв">
            </button>
        `;

        document.getElementById('reviews-container').appendChild(card);

        // Очистка формы
        document.getElementById('review-name').value = '';
        document.getElementById('review-course').value = '';
        document.getElementById('review-text').value = '';
        document.getElementById('review-grade').value = '';
        const selects = reviewFormOverlay.querySelectorAll('.review-custom-select__selected');
        selects.forEach(sel => {
            sel.textContent = sel.closest('.review-custom-select').classList.contains('review-custom-select--grade')
                ? 'Поставьте оценку' : 'Выберите курс на котором вы обучались';
            sel.classList.add('placeholder');
        });

        reviewFormOverlay.classList.remove('active');
        reviewSuccessOverlay.classList.add('active');
    });

    reviewSuccessOverlay.addEventListener('click', (e) => {
        if (e.target === reviewSuccessOverlay) reviewSuccessOverlay.classList.remove('active');
    });

    // --- Добавление заявки из формы записи (после её загрузки) ---
    function setupFormApplication() {
        const formSubmitBtn = document.getElementById('form-submit-btn');
        if (!formSubmitBtn) {
            // Форма ещё не загружена, ждём
            setTimeout(setupFormApplication, 200);
            return;
        }

        // Удаляем старые обработчики (если были) заменой кнопки
        formSubmitBtn.replaceWith(formSubmitBtn.cloneNode(true));
        const newSubmitBtn = document.getElementById('form-submit-btn');

        newSubmitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const name = document.getElementById('form-name')?.value.trim() || 'Без имени';
            const course = document.getElementById('course-select')?.value || 'Курс не выбран';
            const phone = document.getElementById('form-phone')?.value.trim() || 'Без телефона';
            const comment = document.querySelector('.form-textarea')?.value.trim() || '';

            const today = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
            const card = document.createElement('article');
            card.className = 'application-card';
            card.innerHTML = `
                <div class="application-header">
                    <h4 class="application-number">Заявка №${Date.now().toString().slice(-4)}</h4>
                    <span class="application-status">создана</span>
                </div>
                <p class="application-course">${course}</p>
                <p class="application-message">${comment || 'Без дополнительных комментариев'}</p>
                <time class="application-date">${today}</time>
                <button class="application-delete-btn delete-item-btn" data-type="application">
                    <img src="../images/krest.svg" alt="Удалить заявку">
                </button>
            `;
            document.getElementById('applications-container').appendChild(card);

            // Закрываем форму (оверлей) и показываем уведомление
            const formOverlay = document.getElementById('form-overlay');
            if (formOverlay) formOverlay.classList.remove('active');
            const successOverlayForm = document.getElementById('success-overlay'); // success-overlay из forma, но на странице аккаунта overlay id другой. 
            // Используем success-delete-overlay? Лучше показать текст "Заявка создана". Но в forma.css success-overlay может быть не подключён. Создадим универсальное уведомление.
            alert('Заявка успешно создана!');
        });

        // Восстанавливаем работу кастомного селекта формы записи (если он перестал открываться)
        const customSelect = document.querySelector('#form-overlay .custom-select');
        if (customSelect) {
            const trigger = customSelect.querySelector('.custom-select__trigger');
            const selected = customSelect.querySelector('.custom-select__selected');
            const options = customSelect.querySelectorAll('.custom-select__options li');
            const nativeSelect = customSelect.querySelector('.custom-select__native');
            trigger.addEventListener('click', () => customSelect.classList.toggle('open'));
            options.forEach(opt => {
                opt.addEventListener('click', () => {
                    const value = opt.dataset.value;
                    selected.textContent = value;
                    selected.classList.remove('placeholder');
                    nativeSelect.value = value;
                    customSelect.classList.remove('open');
                });
            });
            document.addEventListener('click', (e) => {
                if (!customSelect.contains(e.target)) customSelect.classList.remove('open');
            });
        }
    }

    // Запускаем настройку формы, когда она появится в DOM
    setupFormApplication();

    // Открытие формы записи из панели заявок
    window.openFormOverlay = function() {
        const formOverlay = document.getElementById('form-overlay');
        if (formOverlay) formOverlay.classList.add('active');
    };

    // Связываем кнопку "плюс" в заявках с открытием формы
    const openFormBtn = document.getElementById('open-form-btn');
    if (openFormBtn) {
        openFormBtn.addEventListener('click', () => window.openFormOverlay());
    }
});