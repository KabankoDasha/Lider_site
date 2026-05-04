document.addEventListener('DOMContentLoaded', () => {

    // Переключение вкладок левого меню
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

    // Оверлей деталей заявки
    const appOverlay = document.getElementById('application-detail-overlay');
    let currentApplicationId = null;

    // Открытие оверлея при клике на карточку заявки
    document.querySelectorAll('#applications-container .application-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.new-indicator')) return;
            currentApplicationId = card.dataset.id;
            document.getElementById('app-number').textContent = card.dataset.id;
            document.getElementById('app-name').textContent = 'Иван';
            document.getElementById('app-phone').textContent = '89991110033';
            document.getElementById('app-course').textContent = card.querySelector('.application-course').textContent;
            document.getElementById('app-comment').textContent = card.querySelector('.application-message').textContent;
            document.getElementById('app-date').textContent = card.querySelector('.application-date').textContent.replace('от ', '');

            // Код статуса → русский текст
            const statusMapReverse = {
                'processing': 'в обработке',
                'confirmed': 'подтверждена',
                'rejected': 'отклонена'
            };
            const currentStatus = card.dataset.status || 'processing';
            const currentStatusRu = statusMapReverse[currentStatus] || 'в обработке';

            const statusSelect = document.getElementById('app-status');
            statusSelect.value = currentStatusRu;
            document.getElementById('app-status-selected').textContent = currentStatusRu;
            document.getElementById('app-status-selected').classList.remove('placeholder');

            appOverlay.classList.add('active');
        });
    });

    document.getElementById('close-application-overlay').addEventListener('click', () => {
        appOverlay.classList.remove('active');
    });

    // Кастомный селект статуса
    function initStatusSelect() {
        const container = document.getElementById('app-status-select');
        if (!container) return;
        const trigger = container.querySelector('.status-select__trigger');
        const selected = container.querySelector('.status-select__selected');
        const options = container.querySelectorAll('.status-select__options li');
        const nativeSelect = document.getElementById('app-status');

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
    initStatusSelect();

    // Сохранение статуса (прямой обработчик)
    document.getElementById('save-application').addEventListener('click', () => {
        if (!currentApplicationId) return;
        const newStatusRu = document.getElementById('app-status').value;
        const card = document.querySelector(`.application-card[data-id="${currentApplicationId}"]`);
        if (!card) return;

        const statusCodeMap = {
            'в обработке': 'processing',
            'подтверждена': 'confirmed',
            'отклонена': 'rejected'
        };
        const newStatusCode = statusCodeMap[newStatusRu] || 'processing';

        card.dataset.status = newStatusCode;
        const statusBadge = card.querySelector('.application-status');
        statusBadge.dataset.status = newStatusCode;
        statusBadge.textContent = newStatusRu;

        card.classList.remove('new');
        const indicator = card.querySelector('.new-indicator');
        if (indicator) indicator.remove();

        appOverlay.classList.remove('active');
        applyActiveTabFilter();
    });

    // Фильтрация по вкладкам «Активные / Обработанные»
    function applyActiveTabFilter() {
        const activeTab = document.querySelector('.tab.active');
        if (!activeTab) return;
        const target = activeTab.dataset.tab;
        const cards = document.querySelectorAll('#applications-container .application-card');
        cards.forEach(card => {
            const status = card.dataset.status;
            if (target === 'active') {
                card.style.display = (status === 'processing') ? 'block' : 'none';
            } else {
                card.style.display = (status === 'confirmed' || status === 'rejected') ? 'block' : 'none';
            }
        });
    }

    // Переключение вкладок «Активные / Обработанные»
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            applyActiveTabFilter();
        });
    });

    // Инициализация начальной фильтрации
    applyActiveTabFilter();

    // Оверлей деталей отзыва
    const reviewOverlay = document.getElementById('review-detail-overlay');
    const closeReviewOverlay = document.getElementById('close-review-overlay');
    let currentReviewCard = null;

    // Открытие оверлея при клике на карточку отзыва
    document.querySelectorAll('#reviews-container .review-card').forEach(card => {
        card.addEventListener('click', () => {
            currentReviewCard = card;
            document.getElementById('review-name').textContent = card.querySelector('.review-card__name').textContent;
            document.getElementById('review-course').textContent = card.querySelector('.review-card__course').textContent;
            document.getElementById('review-text').textContent = card.querySelector('.review-card__text').textContent;
            // Извлекаем количество закрашенных звёзд
            const stars = card.querySelectorAll('.star--active').length;
            document.getElementById('review-rating').textContent = stars;
            document.getElementById('review-date').textContent = card.querySelector('.review-card__date').textContent;
            reviewOverlay.classList.add('active');
        });
    });

    // Закрытие оверлея
    closeReviewOverlay.addEventListener('click', () => reviewOverlay.classList.remove('active'));
    reviewOverlay.addEventListener('click', (e) => {
        if (e.target === reviewOverlay) reviewOverlay.classList.remove('active');
    });

    // Кнопка «Добавить» – публикация отзыва
    document.getElementById('approve-review').addEventListener('click', () => {
        if (!currentReviewCard) return;
        // Здесь будет AJAX-запрос для публикации на сайт
        // Пока просто удаляем из списка и показываем успех
        currentReviewCard.remove();
        reviewOverlay.classList.remove('active');
        showSuccess('Отзыв успешно опубликован!');
    });

    // Кнопка «Удалить» – открывает подтверждение
    document.getElementById('delete-review').addEventListener('click', () => {
        document.getElementById('confirm-delete-review-overlay').classList.add('active');
    });

    // Подтверждение удаления
    document.getElementById('cancel-delete-review').addEventListener('click', () => {
        document.getElementById('confirm-delete-review-overlay').classList.remove('active');
    });

    document.getElementById('confirm-delete-review').addEventListener('click', () => {
        if (!currentReviewCard) return;
        currentReviewCard.remove();
        reviewOverlay.classList.remove('active');
        document.getElementById('confirm-delete-review-overlay').classList.remove('active');
        showSuccess('Отзыв удалён!');
    });

    // Функция показа сообщения об успехе
    function showSuccess(message) {
        const successOverlay = document.getElementById('review-success-overlay');
        document.getElementById('success-message').textContent = message;
        successOverlay.classList.add('active');
        successOverlay.onclick = () => successOverlay.classList.remove('active');
    }

    // Управление контентом (курсы)
    const courses = [
        // Автошкола
        {
            name: 'Автомобиль с МКПП — категория «B»',
            duration: '2,5 месяца',
            distancePrice: '46 700',
            distanceOld: '48 700',
            fulltimePrice: '49 700',
            fulltimeOld: '51 700'
        },
        {
            name: 'Автомобиль с АКПП — категория «B» автомат',
            duration: '2,5 месяца',
            distancePrice: '50 300',
            distanceOld: '53 300',
            fulltimePrice: '53 700',
            fulltimeOld: '55 700'
        },
        {
            name: 'Мотоцикл — категория «A»',
            duration: '2,5 месяца',
            distancePrice: '25 000',
            distanceOld: '25 000',
            fulltimePrice: '25 000',
            fulltimeOld: '25 000'
        },
        // Спецтехника
        {
            name: 'Погрузчик — категории «B», «C», «D»',
            duration: '1,5 месяца',
            distancePrice: '15 000',
            distanceOld: '20 000',
            fulltimePrice: '15 000',
            fulltimeOld: ''
        },
        {
            name: 'Экскаватор — категории «C», «E», «D»',
            duration: '2 месяца',
            distancePrice: '15 000',
            distanceOld: '18 000',
            fulltimePrice: '15 000',
            fulltimeOld: ''
        },
        {
            name: 'Трактор — категории «B», «C», «E», «D»',
            duration: '1 месяц',
            distancePrice: '25 000',
            distanceOld: '30 000',
            fulltimePrice: '25 000',
            fulltimeOld: ''
        },
        {
            name: 'Бульдозер — категория «E» с 19 лет',
            duration: '2 месяца',
            distancePrice: '15 000',
            distanceOld: '22 000',
            fulltimePrice: '15 000',
            fulltimeOld: ''
        },
        {
            name: 'Автогрейдер — категории «C», «D» с 19 лет',
            duration: '2 месяца',
            distancePrice: '15 000',
            distanceOld: '25 000',
            fulltimePrice: '15 000',
            fulltimeOld: ''
        },
        {
            name: 'Автомобильный кран',
            duration: '2 месяца',
            distancePrice: '18 000',
            distanceOld: '',
            fulltimePrice: '18 000',
            fulltimeOld: ''
        },
        {
            name: 'Мостовой кран',
            duration: '2 месяца',
            distancePrice: '18 000',
            distanceOld: '',
            fulltimePrice: '18 000',
            fulltimeOld: ''
        },
        {
            name: 'Автовышка и автогидроподъемник',
            duration: '2,5 месяца',
            distancePrice: '18 000',
            distanceOld: '',
            fulltimePrice: '18 000',
            fulltimeOld: ''
        },
        {
            name: 'Квадроцикл и снегоход — категория «AI» с 16 лет',
            duration: '1,5 месяца',
            distancePrice: '16 000',
            distanceOld: '',
            fulltimePrice: '16 000',
            fulltimeOld: ''
        },
        {
            name: 'Внедорожные автотранспортные средства — категория «All» с 19 лет',
            duration: '1,5 месяца',
            distancePrice: 'от 18 000',
            distanceOld: '',
            fulltimePrice: 'от 18 000',
            fulltimeOld: ''
        },
        {
            name: 'Внедорожные автотранспортные средства — категория «All» (БелАЗ)',
            duration: '1,5 месяца',
            distancePrice: '35 000',
            distanceOld: '',
            fulltimePrice: '35 000',
            fulltimeOld: ''
        },
        {
            name: 'Машинист катка — категория «C»',
            duration: '2 месяца',
            distancePrice: '15 000',
            distanceOld: '',
            fulltimePrice: '15 000',
            fulltimeOld: ''
        },
        {
            name: 'Машинист уплотняющей машины «Ратрак» — категория «E»',
            duration: '2 месяца',
            distancePrice: '15 000',
            distanceOld: '',
            fulltimePrice: '15 000',
            fulltimeOld: ''
        },
        {
            name: 'Машинист крана на самоходном ходу',
            duration: '2,5 месяца',
            distancePrice: '15 000',
            distanceOld: '',
            fulltimePrice: '15 000',
            fulltimeOld: ''
        }
    ];

    const contentOverlay = document.getElementById('content-edit-overlay');
    const addCourseOverlay = document.getElementById('add-course-overlay');
    const cardsContainer = document.getElementById('content-edit-cards');
    const thumb = document.getElementById('content-edit-thumb');
    let currentCourseToDelete = null;

    function renderCourses() {
        cardsContainer.innerHTML = courses.map((course, index) => {
            const hasDistance = course.distancePrice !== course.fulltimePrice || course.distanceOld !== course.fulltimeOld;
            let pricesHtml = '';
            if (hasDistance) {
                // Блок "дистанционное"
                pricesHtml += `<div class="price-option"><span class="price-option__label">дистанционное</span><div class="price-option__values"><span class="price-current">${course.distancePrice} руб.</span>`;
                if (course.distanceOld) pricesHtml += `<span class="price-old">${course.distanceOld} руб.</span>`;
                pricesHtml += `</div></div>`;
                // Блок "очное"
                pricesHtml += `<div class="price-option"><span class="price-option__label">очное</span><div class="price-option__values"><span class="price-current">${course.fulltimePrice} руб.</span>`;
                if (course.fulltimeOld) pricesHtml += `<span class="price-old">${course.fulltimeOld} руб.</span>`;
                pricesHtml += `</div></div>`;
            } else {
                // Одна общая цена
                pricesHtml = `<div class="price-option"><div class="price-option__values"><span class="price-current">${course.distancePrice} руб.</span>`;
                if (course.distanceOld) pricesHtml += `<span class="price-old">${course.distanceOld} руб.</span>`;
                pricesHtml += `</div></div>`;
            }
            return `
                <div class="course-edit-card" data-index="${index}">
                    <div class="course-edit-card__name">${course.name}</div>
                    <div class="course-edit-card__duration">${course.duration}</div>
                    <div class="course-edit-card__prices">
                        ${pricesHtml}
                    </div>
                    <button class="course-edit-card__delete" data-index="${index}">
                        <img src="../images/delete.svg" alt="Удалить">
                    </button>
                </div>
            `;
        }).join('');

        // Навешиваем обработчики удаления
        document.querySelectorAll('.course-edit-card__delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                currentCourseToDelete = btn.dataset.index;
                document.getElementById('confirm-delete-course-overlay').classList.add('active');
            });
        });

        // Обновляем скролл
        updateScrollbar();
    }

    function updateScrollbar() {
        const scroll = cardsContainer;
        const thumbHeight = (scroll.clientHeight / scroll.scrollHeight) * 480;
        thumb.style.height = Math.max(thumbHeight, 20) + 'px';
        scroll.addEventListener('scroll', () => {
            const scrollRatio = scroll.scrollTop / (scroll.scrollHeight - scroll.clientHeight);
            thumb.style.top = (scrollRatio * (480 - thumb.offsetHeight)) + 'px';
        });
    }

    // Кнопка «Назад» (закрывает оверлей контента)
    document.getElementById('content-back-btn').addEventListener('click', () => {
        contentOverlay.classList.remove('active');
    });

    // Открытие оверлея контента
    document.querySelectorAll('.btn--edit').forEach(btn => {
        btn.addEventListener('click', () => {
            renderCourses();
            contentOverlay.classList.add('active');
        });
    });

    // Удаление курса
    document.getElementById('cancel-delete-course').addEventListener('click', () => {
        document.getElementById('confirm-delete-course-overlay').classList.remove('active');
    });

    document.getElementById('confirm-delete-course').addEventListener('click', () => {
        if (currentCourseToDelete !== null) {
            courses.splice(currentCourseToDelete, 1);
            renderCourses();
            showCourseSuccess('Курс успешно удалён!');
        }
        document.getElementById('confirm-delete-course-overlay').classList.remove('active');
    });

    // Добавление нового курса
    document.getElementById('add-course-btn').addEventListener('click', () => {
        addCourseOverlay.classList.add('active');
    });

    document.getElementById('close-add-course').addEventListener('click', () => {
        addCourseOverlay.classList.remove('active');
    });

    document.getElementById('save-new-course').addEventListener('click', () => {
        const newCourse = {
            name: document.getElementById('new-course-name').value,
            duration: document.getElementById('new-course-duration').value,
            distancePrice: document.getElementById('new-course-distance').value,
            distanceOld: document.getElementById('new-course-distance-old').value,
            fulltimePrice: document.getElementById('new-course-fulltime').value,
            fulltimeOld: document.getElementById('new-course-fulltime-old').value,
        };
        courses.push(newCourse);
        renderCourses();
        addCourseOverlay.classList.remove('active');
    });

    // Сохранить изменения (просто закрываем оверлей)
    document.getElementById('save-content-btn').addEventListener('click', () => {
        contentOverlay.classList.remove('active');
        showCourseSuccess('Изменения сохранены!');
    });

    // Функция показа сообщения об успехе
    function showCourseSuccess(message) {
        const successOverlay = document.getElementById('course-success-overlay');
        document.getElementById('course-success-message').textContent = message;
        successOverlay.classList.add('active');
        successOverlay.onclick = () => successOverlay.classList.remove('active');
    }

    // Оверлей выхода
    const logoutOverlay = document.getElementById('logout-overlay');
    document.getElementById('logout-btn').addEventListener('click', () => logoutOverlay.classList.add('active'));
    document.getElementById('cancel-logout').addEventListener('click', () => logoutOverlay.classList.remove('active'));
    document.getElementById('confirm-logout').addEventListener('click', () => {
        window.location.href = '../pages/login.html';
    });

    // Оверлей удаления аккаунта
    const deleteAccountOverlay = document.getElementById('delete-account-overlay');
    document.getElementById('delete-account-btn').addEventListener('click', () => deleteAccountOverlay.classList.add('active'));
    document.getElementById('cancel-delete-account').addEventListener('click', () => deleteAccountOverlay.classList.remove('active'));
    document.getElementById('confirm-delete-account').addEventListener('click', () => {
        alert('Аккаунт удалён');
        deleteAccountOverlay.classList.remove('active');
    });
});