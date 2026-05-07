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

    let currentDeleteElement = null;

    document.body.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-item-btn');
        if (!deleteBtn) return;
        
        const type = deleteBtn.dataset.type;
        deleteOverlayText.innerHTML = `Вы уверены, что хотите<br>удалить ${type === 'review' ? 'отзыв' : 'заявку'}?`;
        successOverlay.querySelector('.success-overlay__text').textContent = 
            type === 'review' ? 'Ваш отзыв удалён!' : 'Заявка успешно удалена!';
        
        currentDeleteElement = deleteBtn.closest('.application-card, .review-card');
        deleteOverlay.classList.add('active');
    });

    cancelDeleteBtn.addEventListener('click', () => {
        deleteOverlay.classList.remove('active');
        currentDeleteElement = null;
    });

    confirmDeleteBtn.addEventListener('click', () => {
        if (currentDeleteElement && currentDeleteElement.parentNode) {
            currentDeleteElement.parentNode.removeChild(currentDeleteElement);
        }
        deleteOverlay.classList.remove('active');
        successOverlay.classList.add('active');
        currentDeleteElement = null;
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

    // --- Функция сброса ошибок формы отзыва ---
    function clearReviewFormErrors() {
        document.querySelectorAll('#review-form-overlay .review-form-input.error, #review-form-overlay .review-form-textarea.error, #review-form-overlay .review-custom-select__trigger.error')
            .forEach(el => el.classList.remove('error'));
        document.querySelectorAll('#review-form-overlay .field-error-text').forEach(el => el.remove());
    }

    openReviewBtn.addEventListener('click', () => {
        clearReviewFormErrors();
        reviewFormOverlay.classList.add('active');
    });
    closeReviewBtn.addEventListener('click', () => {
        clearReviewFormErrors();
        reviewFormOverlay.classList.remove('active');
    });
    reviewFormOverlay.addEventListener('click', (e) => {
        if (e.target === reviewFormOverlay) {
            clearReviewFormErrors();
            reviewFormOverlay.classList.remove('active');
        }
    });

    document.querySelectorAll('.review-custom-select').forEach(select => initReviewSelect(select));

    // Универсальная функция показа ошибки
    function showFieldError(element, message) {
        let wrapper = null;
        
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            wrapper = element.closest('.review-input-wrapper');
            if (!wrapper) {
                wrapper = document.createElement('div');
                wrapper.className = 'review-input-wrapper';
                element.parentNode.insertBefore(wrapper, element);
                wrapper.appendChild(element);
            }
        } else {
            wrapper = element.closest('.review-custom-select') || element.parentNode;
        }
        
        if (!wrapper) return;
        
        const oldErr = wrapper.querySelector('.field-error-text');
        if (oldErr) oldErr.remove();

        const errorEl = document.createElement('span');
        errorEl.className = 'field-error-text';
        
        if (element.tagName === 'TEXTAREA') {
            errorEl.classList.add('field-error-text--textarea');
        }
        errorEl.textContent = message;
        wrapper.appendChild(errorEl);
    }

    submitReviewBtn.addEventListener('click', () => {
        // Сброс ошибок перед валидацией
        clearReviewFormErrors();

        let isValid = true;

        const nameInput = document.getElementById('review-name');
        const courseSelect = document.getElementById('review-course');
        const reviewText = document.getElementById('review-text');
        const gradeSelect = document.getElementById('review-grade');

        // Имя
        if (!nameInput.value.trim()) {
            nameInput.classList.add('error');
            showFieldError(nameInput, 'Заполните поле');
            isValid = false;
        }

        // Курс
        if (!courseSelect.value) {
            const trigger = document.querySelector('#review-course-select .review-custom-select__trigger');
            if (trigger) {
                trigger.classList.add('error');
                showFieldError(trigger, 'Выберите курс');
            }
            isValid = false;
        }

        // Текст отзыва
        const textValue = reviewText.value.trim();
        if (!textValue) {
            reviewText.classList.add('error');
            showFieldError(reviewText, 'Заполните поле');
            isValid = false;
        } else if (textValue.length < 10) {
            reviewText.classList.add('error');
            showFieldError(reviewText, 'Минимум 10 символов');
            isValid = false;
        }

        // Оценка
        if (!gradeSelect.value) {
            const trigger = document.querySelector('#review-grade-select .review-custom-select__trigger');
            if (trigger) {
                trigger.classList.add('error');
                showFieldError(trigger, 'Поставьте оценку');
            }
            isValid = false;
        }

        if (!isValid) return;

        // --- Создание карточки отзыва ---
        const name = nameInput.value.trim() || 'Аноним';
        const course = courseSelect.value || 'Курс не выбран';
        const text = textValue || 'Без текста';
        const grade = parseInt(gradeSelect.value) || 5;

        const starsHtml = Array.from({ length: 5 }, (_, i) =>
            `<span class="star ${i < grade ? 'star--active' : ''}"></span>`
        ).join('');

        const today = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
        const card = document.createElement('article');
        card.className = 'review-card';
        card.innerHTML = `
            <div class="review-card__header">
                <div>
                    <h4 class="review-card__name">${escapeHtml(name)}</h4>
                    <p class="review-card__course">${escapeHtml(course)}</p>
                </div>
                <div class="review-card__stars">${starsHtml}</div>
            </div>
            <p class="review-card__text">${escapeHtml(text)}</p>
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

    // --- Открытие формы записи из панели заявок ---
    const openFormBtn = document.getElementById('open-form-btn');
    if (openFormBtn) {
        openFormBtn.addEventListener('click', () => {
            const formOverlay = document.getElementById('form-overlay');
            if (formOverlay) formOverlay.classList.add('active');
        });
    }

    // Простая защита от XSS
    function escapeHtml(str) {
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }
});