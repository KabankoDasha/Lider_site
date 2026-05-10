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
                            ${app.status === 'processing' ? 'в обработке' : app.status === 'confirmed' ? 'подтверждена' : app.status === 'rejected' ? 'отклонена' : app.status}
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
    document.getElementById('confirm-delete-account').addEventListener('click', async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:3001/api/auth/me', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '../pages/login.html';
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

    // === ДОГОВОР ===
    // Сброс ошибок формы договора
    function clearAgreementErrors() {
        document.querySelectorAll('#agreement-form-overlay .add-course-input').forEach(inp => {
            inp.classList.remove('error');
        });
        document.querySelectorAll('#agreement-form-overlay .add-course-input-wrapper .field-error-text').forEach(el => el.remove());
    }

    // Показ ошибки конкретного поля
    function showAgreementFieldError(inputElement, message) {
        const wrapper = inputElement.closest('.add-course-input-wrapper');
        if (!wrapper) return;
        // Удаляем старую ошибку внутри обертки
        const oldErr = wrapper.querySelector('.field-error-text');
        if (oldErr) oldErr.remove();
        const errorSpan = document.createElement('span');
        errorSpan.className = 'field-error-text';
        errorSpan.textContent = message;
        wrapper.appendChild(errorSpan);
    }

    function openAgreementFormHandler() {
        openAgreementForm(null);
    }

    async function loadAgreement() {
        const container = document.getElementById('agreement-container');
        if (!container) return;
        const token = localStorage.getItem('token');
        const openBtn = document.getElementById('open-agreement-btn');

        try {
            const res = await fetch('http://localhost:3001/api/agreements/my', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Ошибка загрузки');
            const agreement = await res.json();

            if (agreement && agreement.id) {
                container.innerHTML = `
                    <div class="agreement-card">
                        <div class="agreement-card__row">
                            <div class="agreement-card__info">
                                <span class="agreement-card__label">Курс</span>
                                <span class="agreement-card__value">${escapeHtml(agreement.course)}</span>
                            </div>
                            <div class="agreement-card__info">
                                <span class="agreement-card__label">ФИО</span>
                                <span class="agreement-card__value">${escapeHtml(agreement.full_name) || 'Не заполнено'}</span>
                            </div>
                            <div class="agreement-card__info">
                                <span class="agreement-card__label">Статус</span>
                                <span class="agreement-card__value">${agreement.status === 'submitted' ? 'Отправлен' : 'Черновик'}</span>
                            </div>
                        </div>
                        <div class="agreement-card__row">
                            <button id="edit-agreement-btn" class="btn--edit-agreement">Редактировать</button>
                            <button id="view-pdf-btn" class="btn--preview-pdf">Договор</button>
                        </div>
                    </div>`;

                if (openBtn) {
                    openBtn.classList.add('btn--disabled');
                    openBtn.removeEventListener('click', openAgreementFormHandler);
                }

                document.getElementById('edit-agreement-btn').addEventListener('click', () => openAgreementForm(agreement));
                document.getElementById('view-pdf-btn').addEventListener('click', async () => {
                    try {
                        const pdfRes = await fetch(`http://localhost:3001/api/agreements/${agreement.id}/pdf`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (!pdfRes.ok) throw new Error('Ошибка загрузки PDF');
                        const blob = await pdfRes.blob();
                        const url = URL.createObjectURL(blob);
                        window.open(url, '_blank');
                    } catch (e) {
                        alert('Не удалось открыть PDF. Проверьте права доступа.');
                    }
                });

            } else {
                container.innerHTML = '<p style="text-align:left;">Договор не заполнен</p>';
                if (openBtn) {
                    openBtn.classList.remove('btn--disabled');
                    openBtn.removeEventListener('click', openAgreementFormHandler);
                    openBtn.addEventListener('click', openAgreementFormHandler);
                }
            }
        } catch (err) {
            console.error(err);
        }
    }

    // --- Открытие оверлея формы договора ---
    function openAgreementForm(existingData) {
        const overlay = document.getElementById('agreement-form-overlay');
        if (!overlay) return;
        overlay.classList.add('active');

        // Сброс ошибок
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

    // Закрытие оверлея договора
    document.getElementById('close-agreement-form')?.addEventListener('click', () => {
        document.getElementById('agreement-form-overlay').classList.remove('active');
    });

    // Сохранение договора с валидацией
    document.getElementById('save-agreement-btn')?.addEventListener('click', async () => {
        // Сброс предыдущих ошибок
        clearAgreementErrors();

        const fields = [
            { id: 'agr-full-name' },
            { id: 'agr-birth-date' },
            { id: 'agr-birth-place' },
            { id: 'agr-pass-series' },
            { id: 'agr-pass-number' },
            { id: 'agr-pass-issued' },
            { id: 'agr-pass-date' },
            { id: 'agr-address' },
            { id: 'agr-phone' }
        ];

        let isValid = true;

        for (const f of fields) {
            const el = document.getElementById(f.id);
            if (!el.value.trim()) {
                el.classList.add('error');
                showAgreementFieldError(el, 'Заполните поле');
                isValid = false;
            }
        }

        if (!isValid) return;

        const data = {
            course: 'Автомобиль с МКПП — категория «B»',
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
            const res = await fetch('http://localhost:3001/api/agreements/my', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                document.getElementById('agreement-form-overlay').classList.remove('active');
                const successOverlay = document.getElementById('agreement-success-overlay');
                if (successOverlay) {
                    successOverlay.classList.add('active');
                    setTimeout(() => successOverlay.classList.remove('active'), 2000);
                }
                loadAgreement();
            } else {
                const errData = await res.json().catch(() => ({}));
                alert('Ошибка сохранения: ' + (errData.message || ''));
            }
        } catch (err) {
            console.error(err);
            alert('Ошибка соединения с сервером');
        }
    });

    // Первоначальная загрузка договора
    loadAgreement();

    // === ЗАГРУЗКА ДОКУМЕНТОВ ===
    const documentState = {
        passport: false,
        snils: false,
        medical: false
    };

    async function loadUserDocuments() {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:3001/api/documents/my', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const docs = await res.json();
                documentState.passport = docs.some(d => d.type === 'passport');
                documentState.snils = docs.some(d => d.type === 'snils');
                documentState.medical = docs.some(d => d.type === 'medical');
                updateDocumentButtons();
            }
        } catch (err) {
            console.error('Не удалось загрузить статус документов', err);
        }
    }

    function updateDocumentButtons() {
        const passportBtn = document.getElementById('upload-passport-btn');
        const snilsBtn = document.getElementById('upload-snils-btn');
        const medicalBtn = document.getElementById('upload-medical-btn');

        if (documentState.passport) {
            passportBtn.textContent = 'Паспорт загружен';
            passportBtn.classList.add('btn--uploaded');
        } else {
            passportBtn.textContent = 'Загрузить скан паспорта';
            passportBtn.classList.remove('btn--uploaded');
        }
        if (documentState.snils) {
            snilsBtn.textContent = 'СНИЛС загружен';
            snilsBtn.classList.add('btn--uploaded');
        } else {
            snilsBtn.textContent = 'Загрузить скан СНИЛСа';
            snilsBtn.classList.remove('btn--uploaded');
        }
        if (documentState.medical) {
            medicalBtn.textContent = 'Справка загружена';
            medicalBtn.classList.add('btn--uploaded');
        } else {
            medicalBtn.textContent = 'Загрузить скан справки';
            medicalBtn.classList.remove('btn--uploaded');
        }
    }

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
            button.textContent = 'Загрузка...';

            try {
                const res = await fetch('http://localhost:3001/api/documents/upload', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
                if (res.ok) {
                    // Успех – обновляем локальное состояние без запроса
                    if (docType === 'passport') documentState.passport = true;
                    if (docType === 'snils') documentState.snils = true;
                    if (docType === 'medical') documentState.medical = true;
                    updateDocumentButtons();
                } else {
                    const errData = await res.json().catch(() => ({}));
                    alert('Ошибка: ' + (errData.message || ''));
                    button.disabled = false;
                    button.textContent = originalText;
                }
            } catch (err) {
                console.error(err);
                alert('Ошибка соединения');
                button.disabled = false;
                button.textContent = originalText;
            }
        });
    }

    // Инициализация
    setupDocumentUpload('upload-passport-btn', 'passport-file-input', 'passport');
    setupDocumentUpload('upload-snils-btn', 'snils-file-input', 'snils');
    setupDocumentUpload('upload-medical-btn', 'medical-file-input', 'medical');
    loadUserDocuments(); 

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