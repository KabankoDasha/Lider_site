(function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../pages/login.html';
    }
})();

document.addEventListener('DOMContentLoaded', () => {

    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
        const fullName = (userData.name || '') + (userData.surname ? ' ' + userData.surname : '');
        const nameElement = document.querySelector('.sidebar-name');
        if (nameElement) nameElement.textContent = fullName || 'Пользователь';
    }

    // === Глобальная переменная для хранения исходных данных профиля ===
    let originalProfile = {};

    // --- Загрузка заявок с сервера ---
    async function loadApplications() {
        const container = document.getElementById('applications-container');
        if (!container) return;

        const token = localStorage.getItem('token');
        if (!token) return;

        // Показываем индикатор загрузки
        container.classList.add('cards-wrapper--loading');

        try {
            const response = await fetch('http://localhost:3001/api/applications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Ошибка загрузки');
            const apps = await response.json();

            // Очищаем контейнер и рендерим заново
            container.innerHTML = '';

            apps.forEach(app => {
                const date = new Date(app.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
                const card = document.createElement('article');
                card.className = 'application-card';
                card.dataset.id = app.id;
                card.dataset.status = app.status;
                card.innerHTML = `
                    <div class="application-header">
                        <h4 class="application-number">Заявка №${app.id}</h4>
                        <span class="application-status" data-status="${app.status}">
                            ${app.status === 'processing' ? 'в обработке' : app.status}
                        </span>
                    </div>
                    <p class="application-course">${escapeHtml(app.course || '')}</p>
                    <p class="application-message">${escapeHtml(app.comment || '')}</p>
                    <time class="application-date">от ${date}</time>
                    <button class="application-delete-btn delete-item-btn" data-type="application">
                        <img src="../images/krest.svg" alt="Удалить заявку">
                    </button>
                `;
                container.appendChild(card);
            });
        } catch (err) {
            console.error('Не удалось загрузить заявки:', err);
            container.innerHTML = '<p style="text-align:center; color:#717171;">Не удалось загрузить заявки</p>';
        } finally {
            container.classList.remove('cards-wrapper--loading');
        }
    }

    function escapeHtml(str) {
        return str.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'})[m]);
    }

    // Загрузка отзывов с сервера
    async function loadReviews() {
        const container = document.getElementById('reviews-container');
        if (!container) return;

        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch('http://localhost:3001/api/reviews/my', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Ошибка загрузки');
            const reviews = await response.json();

            container.innerHTML = '';

            reviews.forEach(review => {
                const starsHtml = Array.from({ length: 5 }, (_, i) =>
                    `<span class="star ${i < review.rating ? 'star--active' : ''}"></span>`
                ).join('');

                const dateStr = new Date(review.created_at).toLocaleDateString('ru-RU', {
                    day: 'numeric', month: 'long', year: 'numeric'
                });

                const card = document.createElement('article');
                card.className = 'review-card';
                card.dataset.id = review.id;
                card.innerHTML = `
                    <div class="review-card__header">
                        <div>
                            <h4 class="review-card__name">${escapeHtml(review.name)}</h4>
                            <p class="review-card__course">${escapeHtml(review.course || '')}</p>
                        </div>
                        <div class="review-card__stars">${starsHtml}</div>
                    </div>
                    <p class="review-card__text">${escapeHtml(review.text)}</p>
                    <time class="review-card__date">${dateStr}</time>
                    <button class="application-delete-btn delete-item-btn" data-type="review">
                        <img src="../images/krest.svg" alt="Удалить отзыв">
                    </button>
                `;
                container.appendChild(card);
            });
        } catch (err) {
            console.error('Не удалось загрузить отзывы:', err);
        }
    }

    // --- Загрузка профиля ---
    async function loadProfile() {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch('http://localhost:3001/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Ошибка загрузки профиля');
            const user = await response.json();

            // Сохраняем исходные данные для кнопки «Отменить»
            originalProfile = {
                name: user.name || '',
                surname: user.surname || '',
                phone: user.phone || '',
                email: user.email || ''
            };

            document.getElementById('profile-name').value = originalProfile.name;
            document.getElementById('profile-surname').value = originalProfile.surname;
            document.getElementById('profile-phone').value = originalProfile.phone;
            document.getElementById('profile-email').value = originalProfile.email;
        } catch (err) {
            console.error('Не удалось загрузить профиль:', err);
        }
    }

    // Первоначальная загрузка
    loadApplications();
    loadReviews();
    loadProfile();

    // --- Перезагрузка заявок при событии из формы ---
    document.addEventListener('applicationSubmitted', () => {
        console.log('Событие applicationSubmitted получено, перезагружаю заявки');
        loadApplications();
    });

    // --- Обработчик кнопки «Отменить» в профиле ---
    const cancelProfileBtn = document.querySelector('.btn--cancel-profile');
    if (cancelProfileBtn) {
        cancelProfileBtn.addEventListener('click', () => {
            if (originalProfile) {
                document.getElementById('profile-name').value = originalProfile.name;
                document.getElementById('profile-surname').value = originalProfile.surname;
                document.getElementById('profile-phone').value = originalProfile.phone;
                document.getElementById('profile-email').value = originalProfile.email;
            }
        });
    }

    // --- Обработчик отправки формы профиля ---
    const profileForm = document.querySelector('.profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('profile-name').value.trim();
            const surname = document.getElementById('profile-surname').value.trim();
            const phone = document.getElementById('profile-phone').value.trim();
            const email = document.getElementById('profile-email').value.trim();

            if (!name || !email) {
                alert('Имя и Email обязательны');
                return;
            }

            const token = localStorage.getItem('token');
            try {
                const response = await fetch('http://localhost:3001/api/auth/me', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ name, surname, email, phone })
                });
                const data = await response.json();

                if (response.ok) {
                    // Обновляем данные в localStorage
                    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                    storedUser.name = data.user.name;
                    storedUser.surname = data.user.surname;
                    storedUser.email = data.user.email;
                    storedUser.phone = data.user.phone;
                    localStorage.setItem('user', JSON.stringify(storedUser));

                    // Обновляем имя в сайдбаре
                    const fullName = (data.user.name || '') + (data.user.surname ? ' ' + data.user.surname : '');
                    const nameEl = document.querySelector('.sidebar-name');
                    if (nameEl) nameEl.textContent = fullName || 'Пользователь';

                    // Показываем кастомное уведомление
                    const profileSuccessOverlay = document.getElementById('profile-success-overlay');
                    if (profileSuccessOverlay) {
                        profileSuccessOverlay.classList.add('active');
                        setTimeout(() => {
                            profileSuccessOverlay.classList.remove('active');
                        }, 2000);
                    }
                } else {
                    alert(data.message || 'Ошибка обновления');
                }
            } catch (err) {
                console.error(err);
                alert('Ошибка соединения с сервером');
            }
        });
    }

    // --- Переключение вкладок ---
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

    confirmDeleteBtn.addEventListener('click', async () => {
        if (!currentDeleteElement) return;

        const card = currentDeleteElement;
        const id = card.dataset.id;
        const type = card.classList.contains('review-card') ? 'review' : 'application';

        if (type === 'application' && id) {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`http://localhost:3001/api/applications/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Ошибка удаления');
            } catch (err) {
                console.error(err);
                alert('Не удалось удалить заявку');
                deleteOverlay.classList.remove('active');
                currentDeleteElement = null;
                return;
            }
        }

        if (type === 'review' && id) {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`http://localhost:3001/api/reviews/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Ошибка удаления');
            } catch (err) {
                console.error(err);
                alert('Не удалось удалить отзыв');
                deleteOverlay.classList.remove('active');
                currentDeleteElement = null;
                return;
            }
        }

        // Удаляем из DOM
        if (card && card.parentNode) {
            card.parentNode.removeChild(card);
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
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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

    // --- Оверлей успеха обновления профиля (закрытие по клику) ---
    const profileSuccessOverlay = document.getElementById('profile-success-overlay');
    if (profileSuccessOverlay) {
        profileSuccessOverlay.addEventListener('click', function(e) {
            if (e.target === profileSuccessOverlay) {
                profileSuccessOverlay.classList.remove('active');
            }
        });
    }

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
        // Автозаполнение имени, если пользователь авторизован
        const token = localStorage.getItem('token');
        if (token) {
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            if (userData.name) {
                const fullName = userData.name || '';
                document.getElementById('review-name').value = fullName;
            }
        }
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

    // Закрытие оверлея успеха отзыва при клике на фон
    reviewSuccessOverlay.addEventListener('click', function(e) {
        if (e.target === reviewSuccessOverlay) {
            reviewSuccessOverlay.classList.remove('active');
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

    submitReviewBtn.addEventListener('click', async () => {
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
        const text = reviewText.value.trim();
        const grade = parseInt(gradeSelect.value) || 5;

        const token = localStorage.getItem('token');

        try {
            const response = await fetch('http://localhost:3001/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, course, text, rating: grade })
            });
            const data = await response.json();
            if (!response.ok) {
                alert(data.message || 'Ошибка добавления отзыва');
                return;
            }

            // Перезагружаем список отзывов
            loadReviews();

            // Очистка формы (как раньше)
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
        } catch (err) {
            console.error(err);
            alert('Ошибка соединения с сервером');
        }
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