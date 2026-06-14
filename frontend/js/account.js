(function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
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

        container.classList.add('cards-wrapper--loading');

        try {
            const response = await fetch('/api/applications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Ошибка загрузки');
            const apps = await response.json();

            container.innerHTML = '';

            apps.forEach(app => {
            const date = new Date(app.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
            const card = document.createElement('article');
            card.className = 'application-card';
            card.dataset.id = app.id;
            card.dataset.status = app.status;

            let repliesHtml = '';
            if (app.has_replies) {
                repliesHtml = `
                    <div class="application-replies" data-id="${app.id}" style="display: none;"></div>
                    <button class="toggle-replies-btn" data-id="${app.id}">Показать ответ</button>
                `;
            }

            card.innerHTML = `
                <div class="application-header">
                    <h4 class="application-number">Заявка №${app.id}</h4>
                    <span class="application-status" data-status="${app.status}">
                        ${app.status === 'processing' ? 'в обработке' : app.status === 'confirmed' ? 'подтверждена' : app.status === 'rejected' ? 'отклонена' : app.status}
                    </span>
                </div>
                <p class="application-course">${escapeHtml(app.course || '')}</p>
                <p class="application-message">${escapeHtml(app.comment || '')}</p>
                <time class="application-date">от ${date}</time>
                ${repliesHtml}
                <button class="application-delete-btn delete-item-btn" data-type="application">
                    <img src="/images/krest.svg" alt="Удалить заявку">
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

    document.body.addEventListener('click', async (e) => {
        const toggleBtn = e.target.closest('.toggle-replies-btn');
        if (!toggleBtn) return;
        const appId = toggleBtn.dataset.id;
        const repliesContainer = toggleBtn.previousElementSibling; // контейнер .application-replies
        if (repliesContainer.style.display === 'none') {
            // загружаем ответы
            const token = localStorage.getItem('token');
            try {
                const res = await fetch(`/api/applications/${appId}/replies`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error();
                const replies = await res.json();
                if (replies.length === 0) {
                    repliesContainer.innerHTML = '<p>Ответов пока нет</p>';
                } else {
                    repliesContainer.innerHTML = replies.map(r => `
                        <div class="reply-item">
                            <div class="reply-message">${escapeHtml(r.message)}</div>
                            <div class="reply-date">${new Date(r.created_at).toLocaleString('ru-RU', { day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                    `).join('');
                }
                repliesContainer.style.display = 'block';
                toggleBtn.textContent = 'Скрыть ответ';
            } catch (err) {
                console.error(err);
                repliesContainer.innerHTML = '<p>Не удалось загрузить ответы</p>';
                repliesContainer.style.display = 'block';
            }
        } else {
            repliesContainer.style.display = 'none';
            toggleBtn.textContent = 'Показать ответ';
        }
    });

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
            const response = await fetch('/api/reviews/my', {
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
                        <img src="/images/krest.svg" alt="Удалить отзыв">
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
            const response = await fetch('/api/auth/me', {
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
                const response = await fetch('/api/auth/me', {
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

    // --- Восстановление последней активной вкладки ---
    const lastTab = localStorage.getItem('activeAccountTab') || 'applications';
    const activeMenuItem = document.querySelector(`.sidebar-menu__item[data-target="${lastTab}"]`);
    const activePanel = document.getElementById(`panel-${lastTab}`);
    if (activeMenuItem && activePanel) {
        // Убираем активность со всех
        document.querySelectorAll('.sidebar-menu__item').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.content-panel').forEach(el => el.classList.remove('active'));
        activeMenuItem.classList.add('active');
        activePanel.classList.add('active');
    }

    // --- Переключение вкладок ---
    const menuItems = document.querySelectorAll('.sidebar-menu__item');
    const panels = document.querySelectorAll('.content-panel');

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const target = item.dataset.target;
            // Сохраняем выбор
            localStorage.setItem('activeAccountTab', target);
            // Переключаем
            menuItems.forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            panels.forEach(panel => panel.classList.remove('active'));
            document.getElementById(`panel-${target}`).classList.add('active');
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
                const response = await fetch(`/api/applications/${id}`, {
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
                const response = await fetch(`/api/reviews/${id}`, {
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
        window.location.href = '/login.html';
    });

    // --- Оверлей удаления аккаунта ---
    const deleteAccountOverlay = document.getElementById('delete-account-overlay');
    document.getElementById('delete-account-btn').addEventListener('click', () => deleteAccountOverlay.classList.add('active'));
    document.getElementById('cancel-delete-account').addEventListener('click', () => deleteAccountOverlay.classList.remove('active'));
    document.getElementById('confirm-delete-account').addEventListener('click', async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('/api/auth/me', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login.html';
            } else {
                const data = await response.json();
                alert(data.message || 'Не удалось удалить аккаунт');
            }
        } catch (err) {
            console.error(err);
            alert('Ошибка соединения с сервером');
        } finally {
            deleteAccountOverlay.classList.remove('active');
        }
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
            const response = await fetch('/api/reviews', {
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

    // === ДОГОВОР ===
        // === ДОГОВОР ===
    // --- Данные курсов (список со страницы Обучение) ---
    const COURSES_LIST = [
        "Автомобиль с МКПП — категория «B»",
        "Автомобиль с АКПП — категория «B» автомат",
        "Мотоцикл — категория «A»",
        "Погрузчик — категории «B», «C», «D»",
        "Экскаватор — категории «C», «E», «D»",
        "Трактор — категории «B», «C», «E», «D»",
        "Бульдозер — категория «E» с 19 лет",
        "Автогрейдер — категории «C», «D» с 19 лет",
        "Автомобильный кран",
        "Мостовой кран",
        "Автовышка и автогидроподъемник",
        "Квадроцикл и снегоход — категория «AI» с 16 лет",
        "Внедорожные автотранспортные средства — категория «All» с 19 лет",
        "Внедорожные автотранспортные средства — категория «All» (БелАЗ)",
        "Машинист катка — категория «C»",
        "Машинист уплотняющей машины «Ратрак» — категория «E»",
        "Машинист крана на самоходном ходу"
    ];

    // --- Элементы DOM ---
    const agreementFullnameSpan = document.getElementById('agreement-fullname');
    const agreementStatusSpan = document.getElementById('agreement-status');
    const fillAgreementBtn = document.getElementById('fill-agreement-btn');
    const viewAgreementBtn = document.getElementById('view-agreement-btn');
    const editAgreementBtn = document.getElementById('edit-agreement-btn');
    const agreementDocsDiv = document.getElementById('agreement-docs-buttons');

    // --- Кастомный селект курса ---
    const courseSelectWrapper = document.getElementById('course-select-doc');
    const courseNativeSelect = document.getElementById('course-native-doc');
    const courseTrigger = courseSelectWrapper.querySelector('.custom-select-doc__trigger');
    const courseSelectedSpan = courseSelectWrapper.querySelector('.custom-select-doc__selected');
    const courseOptionsUl = courseSelectWrapper.querySelector('.custom-select-doc__options');

    function initCustomSelect() {
        // Удаляем старый placeholder option, если он есть
        while (courseNativeSelect.options.length > 0) {
            courseNativeSelect.remove(0);
        }
        // Добавляем пустой option с плейсхолдером
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = 'Выберите курс обучения';
        courseNativeSelect.appendChild(emptyOption);

        // Инициализация кастомного селекта (как в форме отзыва)
        courseTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            courseSelectWrapper.classList.toggle('open');
        });

        document.addEventListener('click', (e) => {
            if (!courseSelectWrapper.contains(e.target)) {
                courseSelectWrapper.classList.remove('open');
            }
        });

        // Заполнение опций
        COURSES_LIST.forEach(course => {
            // Добавляем в нативный select (для совместимости)
            const option = document.createElement('option');
            option.value = course;
            option.textContent = course;
            courseNativeSelect.appendChild(option);
            // Добавляем в кастомный список
            const li = document.createElement('li');
            li.dataset.value = course;
            li.textContent = course;
            courseOptionsUl.appendChild(li);
        });

        // Обработка выбора из кастомного списка
        courseOptionsUl.querySelectorAll('li').forEach(li => {
            li.addEventListener('click', () => {
                const value = li.dataset.value;
                courseSelectedSpan.textContent = value;
                courseSelectedSpan.classList.remove('placeholder');
                courseNativeSelect.value = value;
                courseSelectWrapper.classList.remove('open');
                // Если договор уже был заполнен – автоматически сохраняем новый курс
                if (currentAgreement && currentAgreement.id) {
                    updateAgreementCourse(value);
                }
            });
        });
    }

    // --- Текущий договор (глобально для удобства) ---
    let currentAgreement = null;

    // --- Функция обновления карточки договора ---
    function updateAgreementCard(agreement) {
        if (agreement && agreement.id) {
        // Договор есть
        currentAgreement = agreement;
        agreementFullnameSpan.textContent = agreement.full_name || '—';
        agreementStatusSpan.textContent = agreement.status === 'submitted' ? 'Отправлен' : 'Черновик';
        // Устанавливаем курс в селекте
        const savedCourse = agreement.course || COURSES_LIST[0];
        courseNativeSelect.value = savedCourse;
        courseSelectedSpan.textContent = savedCourse;
        courseSelectedSpan.classList.remove('placeholder');
        // Показываем кнопки: Редактировать слева, Договор справа
        fillAgreementBtn.style.display = 'none';      // скрыть "Заполнить договор"
        viewAgreementBtn.style.display = 'inline-flex'; // показать "Договор"
        editAgreementBtn.style.display = 'inline-flex';  // показать "Редактировать"
    } else {
        // Договора нет
        currentAgreement = null;
        agreementFullnameSpan.textContent = '—';
        agreementStatusSpan.textContent = 'Не заполнен';
        // Сбрасываем селект на плейсхолдер
        courseNativeSelect.value = '';
        courseSelectedSpan.textContent = 'Выберите курс обучения';
        courseSelectedSpan.classList.add('placeholder');
        // Показываем только "Заполнить договор" справа
        fillAgreementBtn.style.display = 'inline-flex';
        viewAgreementBtn.style.display = 'none';
        editAgreementBtn.style.display = 'none';
    }
        // Обновляем кнопки загруженных документов
        updateDocumentButtonsInCard();
    }

    // --- Обновление курса договора (если пользователь меняет его после заполнения) ---
    async function updateAgreementCourse(newCourse) {
        if (!currentAgreement || !currentAgreement.id) return;
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`/api/agreements/${currentAgreement.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ course: newCourse })
            });
            if (response.ok) {
                currentAgreement.course = newCourse;
                // Не перезагружаем всю карточку, просто обновляем данные в памяти
            } else {
                console.error('Не удалось обновить курс');
            }
        } catch (err) {
            console.error(err);
        }
    }

    // --- Загрузка договора с сервера ---
    async function loadAgreement() {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('/api/agreements/my', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const agreement = await res.json();
                if (agreement && agreement.id) {
                    updateAgreementCard(agreement);
                } else {
                    updateAgreementCard(null);
                }
            } else {
                updateAgreementCard(null);
            }
        } catch (err) {
            console.error('Ошибка загрузки договора:', err);
            updateAgreementCard(null);
        }
    }

    // --- Открытие оверлея заполнения/редактирования договора ---
    function openAgreementForm(existingData) {
        const overlay = document.getElementById('agreement-form-overlay');
        if (!overlay) return;
        overlay.classList.add('active');
        clearAgreementErrors();

        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val || '';
        };

        if (existingData) {
            setVal('agr-full-name', existingData.full_name);
            setVal('agr-birth-date', existingData.birth_date);
            setVal('agr-birth-place', existingData.birth_place);
            setVal('agr-pass-series', existingData.passport_series);
            setVal('agr-pass-number', existingData.passport_number);
            setVal('agr-pass-issued', existingData.passport_issued_by);
            setVal('agr-pass-date', existingData.passport_issued_date);
            setVal('agr-address', existingData.registration_address);
            setVal('agr-phone', existingData.phone);
            setVal('agr-workplace', existingData.workplace);
        } else {
            ['agr-full-name','agr-birth-date','agr-birth-place','agr-pass-series','agr-pass-number',
            'agr-pass-issued','agr-pass-date','agr-address','agr-phone','agr-workplace']
            .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
        }
    }

    // --- Сохранение договора (после заполнения формы) ---
    async function saveAgreementFromForm() {
        clearAgreementErrors();

        const requiredFields = [
            'agr-full-name', 'agr-birth-date', 'agr-birth-place',
            'agr-pass-series', 'agr-pass-number', 'agr-pass-issued',
            'agr-pass-date', 'agr-address', 'agr-phone'
        ];
        let isValid = true;
        for (const id of requiredFields) {
            const el = document.getElementById(id);
            if (!el.value.trim()) {
                el.classList.add('error');
                showAgreementFieldError(el, 'Заполните поле');
                isValid = false;
            }
        }
        if (!isValid) return;

        // Берём курс из селекта
        const selectedCourse = courseNativeSelect.value;
        if (!selectedCourse || selectedCourse === '') {
            alert('Пожалуйста, выберите курс в карточке документа');
            return;
        }

        const data = {
            course: selectedCourse,
            full_name: document.getElementById('agr-full-name').value.trim(),
            birth_date: document.getElementById('agr-birth-date').value.trim(),
            birth_place: document.getElementById('agr-birth-place').value.trim(),
            passport_series: document.getElementById('agr-pass-series').value.trim(),
            passport_number: document.getElementById('agr-pass-number').value.trim(),
            passport_issued_by: document.getElementById('agr-pass-issued').value.trim(),
            passport_issued_date: document.getElementById('agr-pass-date').value.trim(),
            registration_address: document.getElementById('agr-address').value.trim(),
            phone: document.getElementById('agr-phone').value.trim(),
            workplace: document.getElementById('agr-workplace').value.trim(),
            status: 'submitted'
        };

        const token = localStorage.getItem('token');
        try {
            const res = await fetch('/api/agreements/my', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                const saved = await res.json();
                document.getElementById('agreement-form-overlay').classList.remove('active');
                const successOverlay = document.getElementById('agreement-success-overlay');
                if (successOverlay) {
                    successOverlay.classList.add('active');
                    setTimeout(() => successOverlay.classList.remove('active'), 2000);
                }
                updateAgreementCard(saved);
            } else {
                const errData = await res.json().catch(() => ({}));
                alert('Ошибка сохранения: ' + (errData.message || ''));
            }
        } catch (err) {
            console.error(err);
            alert('Ошибка соединения с сервером');
        }
    }

    // --- Вспомогательная функция для ошибок в форме договора ---
    function showAgreementFieldError(inputElement, message) {
        const wrapper = inputElement.closest('.add-course-input-wrapper');
        if (!wrapper) return;
        const oldErr = wrapper.querySelector('.field-error-text');
        if (oldErr) oldErr.remove();
        const errorSpan = document.createElement('span');
        errorSpan.className = 'field-error-text';
        errorSpan.textContent = message;
        wrapper.appendChild(errorSpan);
    }
    function clearAgreementErrors() {
        document.querySelectorAll('#agreement-form-overlay .add-course-input').forEach(inp => {
            inp.classList.remove('error');
        });
        document.querySelectorAll('#agreement-form-overlay .add-course-input-wrapper .field-error-text').forEach(el => el.remove());
    }

    // Открытие PDF договора 
    async function viewAgreementPdf() {
        if (!currentAgreement || !currentAgreement.id) return;
        const token = localStorage.getItem('token');
        
        // Открываем пустое окно сразу
        const newWindow = window.open();
        if (!newWindow) {
            alert('Пожалуйста, разрешите всплывающие окна для этого сайта');
            return;
        }
        newWindow.document.write('<p>Загрузка PDF...</p>');
        
        try {
            const pdfRes = await fetch(`/api/agreements/${currentAgreement.id}/pdf`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!pdfRes.ok) throw new Error('Ошибка загрузки PDF');
            const blob = await pdfRes.blob();
            const url = URL.createObjectURL(blob);
            newWindow.location.href = url;
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (e) {
            newWindow.document.write('<p>Ошибка загрузки PDF</p>');
            alert('Не удалось открыть PDF. Проверьте права доступа.');
        }
    }

    // --- Обновление кнопок документов (Паспорт, СНИЛС, Справка) внутри карточки ---
    function updateDocumentButtonsInCard() {
        const container = document.getElementById('agreement-docs-buttons');
        if (!container) return;
        container.innerHTML = '';
        const hasAny = documentState.passport || documentState.snils || documentState.medical;
        if (!hasAny) {
            // Показываем сообщение, если нет ни одного документа
            const messageSpan = document.createElement('span');
            messageSpan.className = 'no-docs-message';
            messageSpan.textContent = 'Нет загруженных документов';
            container.appendChild(messageSpan);
            return;
        }
        if (documentState.passport) {
            addDocButton('Паспорт', 'passport', container);
        }
        if (documentState.snils) {
            addDocButton('СНИЛС', 'snils', container);
        }
        if (documentState.medical) {
            addDocButton('Справка', 'medical', container);
        }
    }

    function addDocButton(label, type, container) {
        const btn = document.createElement('button');
        btn.textContent = label;
        btn.classList.add('btn--doc-preview');
        btn.addEventListener('click', () => openDocumentPdf(type));
        container.appendChild(btn);
    }

    async function openDocumentPdf(type) {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/documents/my/${type}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Файл не найден');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            
            const newWindow = window.open();
            if (newWindow) {
                newWindow.location.href = url;
            } else {
                const link = document.createElement('a');
                link.href = url;
                link.download = `${type}.pdf`;
                alert('Браузер заблокировал всплывающее окно. Нажмите "Скачать PDF" в открывшемся диалоге.');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (err) {
            alert('Не удалось открыть документ');
        }
    }

    // --- Загрузка сканов ---
    function setupDocumentUpload(buttonId, fileInputId, docType) {
        const button = document.getElementById(buttonId);
        const fileInput = document.getElementById(fileInputId);

        button.addEventListener('click', () => {
            if (!button.disabled) {
                fileInput.value = '';
                fileInput.click();
            }
        });

        fileInput.addEventListener('change', async () => {
            if (!fileInput.files.length) return;
            const file = fileInput.files[0];
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', docType);

            const token = localStorage.getItem('token');
            const originalText = button.textContent;
            button.textContent = 'Загрузка.';

            try {
                const res = await fetch('/api/documents/upload', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
                if (res.ok) {
                    if (docType === 'passport') documentState.passport = true;
                    if (docType === 'snils') documentState.snils = true;
                    if (docType === 'medical') documentState.medical = true;
                    updateDocumentButtonsInCard();
                    const uploadBtn = document.getElementById(buttonId);
                    uploadBtn.textContent = originalText;
                    uploadBtn.classList.add('btn--uploaded');
                } else {
                    const errData = await res.json().catch(() => ({}));
                    alert('Ошибка: ' + (errData.message || ''));
                    button.textContent = originalText;
                }
            } catch (err) {
                console.error(err);
                alert('Ошибка соединения');
                button.textContent = originalText;
            }
        });
    }

    // --- Инициализация документации ---
    let documentState = { passport: false, snils: false, medical: false };

    async function loadUserDocuments() {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('/api/documents/my', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const docs = await res.json();
                documentState.passport = docs.some(d => d.type === 'passport');
                documentState.snils = docs.some(d => d.type === 'snils');
                documentState.medical = docs.some(d => d.type === 'medical');
                updateDocumentButtonsInCard();
                const passportBtn = document.getElementById('upload-passport-btn');
                const snilsBtn = document.getElementById('upload-snils-btn');
                const medicalBtn = document.getElementById('upload-medical-btn');
                if (documentState.passport) passportBtn.classList.add('btn--uploaded');
                else passportBtn.classList.remove('btn--uploaded');
                if (documentState.snils) snilsBtn.classList.add('btn--uploaded');
                else snilsBtn.classList.remove('btn--uploaded');
                if (documentState.medical) medicalBtn.classList.add('btn--uploaded');
                else medicalBtn.classList.remove('btn--uploaded');
            }
        } catch (err) {
            console.error('Не удалось загрузить статус документов', err);
        }
    }

    // --- Кнопка "Памятка" ---
    document.getElementById('memory-btn')?.addEventListener('click', () => {
        window.open('/pdf/pamyatka.pdf', '_blank');
    });

    // --- Назначение обработчиков ---
    fillAgreementBtn.addEventListener('click', () => openAgreementForm(null));
    viewAgreementBtn.addEventListener('click', viewAgreementPdf);
    editAgreementBtn.addEventListener('click', () => openAgreementForm(currentAgreement));
    document.getElementById('close-agreement-form')?.addEventListener('click', () => {
        document.getElementById('agreement-form-overlay').classList.remove('active');
    });
    document.getElementById('save-agreement-btn')?.addEventListener('click', saveAgreementFromForm);

    // --- Запуск инициализации ---
    initCustomSelect();          
    loadAgreement();
    loadUserDocuments();
    setupDocumentUpload('upload-passport-btn', 'passport-file-input', 'passport');
    setupDocumentUpload('upload-snils-btn', 'snils-file-input', 'snils');
    setupDocumentUpload('upload-medical-btn', 'medical-file-input', 'medical');

    // ========== Мобильное боковое меню ==========
    (function initMobileSidebar() {
        const toggleBtn = document.getElementById('sidebar-toggle-mobile');
        const sidebar = document.querySelector('.account-sidebar');
        if (!toggleBtn || !sidebar) return;

        function closeSidebar() {
            sidebar.classList.remove('mobile-open');
            if (toggleBtn) toggleBtn.classList.remove('active');
        }

        function openSidebar() {
            sidebar.classList.add('mobile-open');
            if (toggleBtn) toggleBtn.classList.add('active');
        }

        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (sidebar.classList.contains('mobile-open')) {
                closeSidebar();
            } else {
                openSidebar();
            }
        });

        // Закрытие при клике на пункт меню
        const menuItems = document.querySelectorAll('.sidebar-menu__item');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                closeSidebar();
            });
        });

        // Закрытие при клике вне панели (по документу)
        document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('mobile-open') && 
                !sidebar.contains(e.target) && 
                !toggleBtn.contains(e.target)) {
                closeSidebar();
            }
        });

        // При изменении ориентации экрана закрываем меню
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) return;
            closeSidebar();
        });
    })();
    
    // Простая защита от XSS (оставлена для локального использования)
    function escapeHtml(str) {
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }
});