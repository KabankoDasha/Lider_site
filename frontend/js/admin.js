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

    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            applyActiveTabFilter();
        });
    });

    applyActiveTabFilter();

    // Оверлей деталей отзыва
    const reviewOverlay = document.getElementById('review-detail-overlay');
    const closeReviewOverlay = document.getElementById('close-review-overlay');
    let currentReviewCard = null;

    document.querySelectorAll('#reviews-container .review-card').forEach(card => {
        card.addEventListener('click', () => {
            currentReviewCard = card;
            document.getElementById('review-name').textContent = card.querySelector('.review-card__name').textContent;
            document.getElementById('review-course').textContent = card.querySelector('.review-card__course').textContent;
            document.getElementById('review-text').textContent = card.querySelector('.review-card__text').textContent;
            const stars = card.querySelectorAll('.star--active').length;
            document.getElementById('review-rating').textContent = stars;
            document.getElementById('review-date').textContent = card.querySelector('.review-card__date').textContent;
            reviewOverlay.classList.add('active');
        });
    });

    closeReviewOverlay.addEventListener('click', () => reviewOverlay.classList.remove('active'));
    reviewOverlay.addEventListener('click', (e) => { if (e.target === reviewOverlay) reviewOverlay.classList.remove('active'); });

    document.getElementById('approve-review').addEventListener('click', () => {
        if (!currentReviewCard) return;
        currentReviewCard.remove();
        reviewOverlay.classList.remove('active');
        showSuccess('Отзыв успешно опубликован!');
    });

    document.getElementById('delete-review').addEventListener('click', () => {
        document.getElementById('confirm-delete-review-overlay').classList.add('active');
    });

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

    function showSuccess(message) {
        const successOverlay = document.getElementById('review-success-overlay');
        document.getElementById('success-message').textContent = message;
        successOverlay.classList.add('active');
        successOverlay.onclick = () => successOverlay.classList.remove('active');
    }

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
            distancePrice: '25 000',   // дистанционное
            distanceOld: '',           // без зачёркнутой цены
            fulltimePrice: '25 000',   // очное
            fulltimeOld: ''            // без зачёркнутой цены
        },
        // Спецтехника (единые цены, без разделения)
        {
            name: 'Погрузчик — категории «B», «C», «D»',
            duration: '1,5 месяца',
            distancePrice: '15 000',
            distanceOld: '25 000',
            fulltimePrice: '',
            fulltimeOld: ''
        },
        {
            name: 'Экскаватор — категории «C», «E», «D»',
            duration: '2 месяца',
            distancePrice: '15 000',
            distanceOld: '25 000',
            fulltimePrice: '',
            fulltimeOld: ''
        },
        {
            name: 'Трактор — категории «B», «C», «E», «D»',
            duration: '1 месяц',
            distancePrice: '25 000',
            distanceOld: '35 000',
            fulltimePrice: '',
            fulltimeOld: ''
        },
        {
            name: 'Бульдозер — категория «E» с 19 лет',
            duration: '2 месяца',
            distancePrice: '15 000',
            distanceOld: '25 000',
            fulltimePrice: '',
            fulltimeOld: ''
        },
        {
            name: 'Автогрейдер — категории «C», «D» с 19 лет',
            duration: '2 месяца',
            distancePrice: '15 000',
            distanceOld: '25 000',
            fulltimePrice: '',
            fulltimeOld: ''
        },
        // Начиная отсюда – без зачёркнутой цены (distanceOld пусто)
        {
            name: 'Автомобильный кран',
            duration: '2 месяца',
            distancePrice: '18 000',
            distanceOld: '',
            fulltimePrice: '',
            fulltimeOld: ''
        },
        {
            name: 'Мостовой кран',
            duration: '2 месяца',
            distancePrice: '18 000',
            distanceOld: '',
            fulltimePrice: '',
            fulltimeOld: ''
        },
        {
            name: 'Автовышка и автогидроподъемник',
            duration: '2,5 месяца',
            distancePrice: '18 000',
            distanceOld: '',
            fulltimePrice: '',
            fulltimeOld: ''
        },
        {
            name: 'Квадроцикл и снегоход — категория «AI» с 16 лет',
            duration: '1,5 месяца',
            distancePrice: '16 000',
            distanceOld: '',
            fulltimePrice: '',
            fulltimeOld: ''
        },
        {
            name: 'Внедорожные автотранспортные средства — категория «All» с 19 лет',
            duration: '1,5 месяца',
            distancePrice: 'от 18 000',
            distanceOld: '',
            fulltimePrice: '',
            fulltimeOld: ''
        },
        {
            name: 'Внедорожные автотранспортные средства — категория «All» (БелАЗ)',
            duration: '1,5 месяца',
            distancePrice: '35 000',
            distanceOld: '',
            fulltimePrice: '',
            fulltimeOld: ''
        },
        // Последние три – с зачёркнутой ценой
        {
            name: 'Машинист катка — категория «C»',
            duration: '2 месяца',
            distancePrice: '15 000',
            distanceOld: '25 000',
            fulltimePrice: '',
            fulltimeOld: ''
        },
        {
            name: 'Машинист уплотняющей машины «Ратрак» — категория «E»',
            duration: '2 месяца',
            distancePrice: '15 000',
            distanceOld: '25 000',
            fulltimePrice: '',
            fulltimeOld: ''
        },
        {
            name: 'Машинист крана на самоходном ходу',
            duration: '2,5 месяца',
            distancePrice: '15 000',
            distanceOld: '25 000',
            fulltimePrice: '',
            fulltimeOld: ''
        }
    ];

    const contentOverlay = document.getElementById('content-edit-overlay');
    const addCourseOverlay = document.getElementById('add-course-overlay');
    const cardsContainer = document.getElementById('content-edit-cards');
    const thumb = document.getElementById('content-edit-thumb');
    let currentCourseToDelete = null;
    let editingCourseIndex = null;   

    function renderCourses() {
        cardsContainer.innerHTML = courses.map((course, index) => {
            const hasBothOptions = course.distancePrice !== '' && course.fulltimePrice !== '';
            let pricesHtml = '';

            if (hasBothOptions) {
                // дистанционное
                pricesHtml += `<div class="price-option"><span class="price-option__label">дистанционное</span><div class="price-option__values"><span class="price-current">${course.distancePrice} руб.</span>`;
                if (course.distanceOld) pricesHtml += `<span class="price-old">${course.distanceOld} руб.</span>`;
                pricesHtml += `</div></div>`;
                // очное
                pricesHtml += `<div class="price-option"><span class="price-option__label">очное</span><div class="price-option__values"><span class="price-current">${course.fulltimePrice} руб.</span>`;
                if (course.fulltimeOld) pricesHtml += `<span class="price-old">${course.fulltimeOld} руб.</span>`;
                pricesHtml += `</div></div>`;
            } else {
                // Одна строка без меток (если задана только дистанционная или только очная цена)
                pricesHtml = `<div class="price-option single-price"><div class="price-option__values"><span class="price-current">${course.distancePrice || course.fulltimePrice} руб.</span>`;
                if (course.distanceOld || course.fulltimeOld) {
                    pricesHtml += `<span class="price-old">${course.distanceOld || course.fulltimeOld} руб.</span>`;
                }
                pricesHtml += `</div></div>`;
            }

            return `
                <div class="course-edit-card" data-index="${index}">
                    <div class="course-edit-card__name">${course.name}</div>
                    <div class="course-edit-card__duration">${course.duration}</div>
                    <div class="course-edit-card__prices">${pricesHtml}</div>
                    <button class="course-edit-card__edit" data-index="${index}">
                        <img src="../images/edit.svg" alt="Редактировать">
                    </button>
                    <button class="course-edit-card__delete" data-index="${index}">
                        <img src="../images/delete.svg" alt="Удалить">
                    </button>
                </div>
            `;
        }).join('');

        document.querySelectorAll('.course-edit-card__delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                currentCourseToDelete = btn.dataset.index;
                document.getElementById('confirm-delete-course-overlay').classList.add('active');
            });
        });

        document.querySelectorAll('.course-edit-card__edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                editingCourseIndex = parseInt(btn.dataset.index, 10);
                const course = courses[editingCourseIndex];
                document.querySelector('.add-course-title').textContent = 'Редактирование курса';

                // Заполняем поля значениями
                document.getElementById('new-course-name').value = course.name;
                document.getElementById('new-course-duration').value = course.duration;
                document.getElementById('new-course-distance').value = course.distancePrice;
                document.getElementById('new-course-distance-old').value = course.distanceOld || '';
                document.getElementById('new-course-fulltime').value = course.fulltimePrice;
                document.getElementById('new-course-fulltime-old').value = course.fulltimeOld || '';

                // Убираем все подсказки, чтобы не мешали
                document.getElementById('new-course-name').placeholder = '';
                document.getElementById('new-course-duration').placeholder = '';
                document.getElementById('new-course-distance').placeholder = '';
                document.getElementById('new-course-distance-old').placeholder = '';
                document.getElementById('new-course-fulltime').placeholder = '';
                document.getElementById('new-course-fulltime-old').placeholder = '';

                addCourseOverlay.classList.add('active');
            });
        });

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

    document.getElementById('content-back-btn').addEventListener('click', () => {
        contentOverlay.classList.remove('active');
    });

    document.querySelectorAll('.btn--edit').forEach(btn => {
        btn.addEventListener('click', () => {
            editingCourseIndex = null;
            document.querySelector('.add-course-title').textContent = 'Добавление нового курса';
            // сброс полей
            document.getElementById('new-course-name').value = 'Автомобиль с МКПП — категория «B»';
            document.getElementById('new-course-duration').value = '2,5';
            document.getElementById('new-course-distance').value = '46700';
            document.getElementById('new-course-distance-old').value = '48700';
            document.getElementById('new-course-fulltime').value = '49700';
            document.getElementById('new-course-fulltime-old').value = '51700';
            renderCourses();
            contentOverlay.classList.add('active');
        });
    });

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

    // Добавление / редактирование курса
    document.getElementById('add-course-btn').addEventListener('click', () => {
        editingCourseIndex = null;
        document.querySelector('.add-course-title').textContent = 'Добавление нового курса';

        // Очищаем все поля и ставим серые подсказки
        document.getElementById('new-course-name').value = '';
        document.getElementById('new-course-name').placeholder = 'Автомобиль с МКПП — категория «B»';
        document.getElementById('new-course-duration').value = '';
        document.getElementById('new-course-duration').placeholder = '2,5 месяца';
        document.getElementById('new-course-distance').value = '';
        document.getElementById('new-course-distance').placeholder = '46 700';
        document.getElementById('new-course-distance-old').value = '';
        document.getElementById('new-course-distance-old').placeholder = '48 700';
        document.getElementById('new-course-fulltime').value = '';
        document.getElementById('new-course-fulltime').placeholder = '49 700';
        document.getElementById('new-course-fulltime-old').value = '';
        document.getElementById('new-course-fulltime-old').placeholder = '51 700';

        addCourseOverlay.classList.add('active');
    });

    document.getElementById('close-add-course').addEventListener('click', () => {
        addCourseOverlay.classList.remove('active');
    });

    document.getElementById('save-new-course').addEventListener('click', () => {
        const updatedCourse = {
            name: document.getElementById('new-course-name').value,
            duration: document.getElementById('new-course-duration').value,
            distancePrice: document.getElementById('new-course-distance').value,
            distanceOld: document.getElementById('new-course-distance-old').value,
            fulltimePrice: document.getElementById('new-course-fulltime').value,
            fulltimeOld: document.getElementById('new-course-fulltime-old').value,
        };

        if (editingCourseIndex !== null) {
            courses[editingCourseIndex] = updatedCourse;
        } else {
            courses.push(updatedCourse);
        }

        renderCourses();
        addCourseOverlay.classList.remove('active');
        editingCourseIndex = null;
    });

    document.getElementById('save-content-btn').addEventListener('click', () => {
        contentOverlay.classList.remove('active');
        showCourseSuccess('Изменения сохранены!');
    });

    function showCourseSuccess(message) {
        const successOverlay = document.getElementById('course-success-overlay');
        document.getElementById('course-success-message').textContent = message;
        successOverlay.classList.add('active');
        successOverlay.onclick = () => successOverlay.classList.remove('active');
    }

    // АКЦИИ
    const sales = [
        { name: 'Акция на автокурсы категории «B»', discount: '-10%', date: 'до 31.03.2026' },
        { name: 'Акция 1+1 на обучение автомобиль+мотоцикл', discount: '-15%', date: 'до 31.03.2026' },
        { name: 'Акция на курсы водителя квадроцикла', discount: '-50%', date: 'до 15.04.2026' },
        { name: 'Скидка на обучение на спецтехнику', discount: '-20%', date: 'до 30.06.2026' },
        { name: 'Раннее бронирование', discount: '-15%', date: 'до 31.05.2026' },
        { name: 'Семейная скидка', discount: '-10%', date: 'при обучении двух членов семьи' }
    ];

    const saleEditOverlay = document.getElementById('sale-edit-overlay');
    const addSaleOverlay = document.getElementById('add-sale-overlay');
    const saleCardsContainer = document.getElementById('sale-edit-cards');
    const saleThumb = document.getElementById('sale-edit-thumb');
    let currentSaleToDelete = null;
    let editingSaleIndex = null;

    // Рендер карточек акций
    function renderSales() {
        saleCardsContainer.innerHTML = sales.map((sale, index) => {
            return `
                <div class="course-edit-card" data-index="${index}">
                    <div class="course-edit-card__name">${sale.name}</div>
                    <div class="course-edit-card__duration">${sale.discount}</div>
                    <div class="sale-period">
                        <span>Скидка действительна</span>
                        <span>${sale.date}</span>
                    </div>
                    <button class="course-edit-card__edit" data-index="${index}">
                        <img src="../images/edit.svg" alt="Редактировать">
                    </button>
                    <button class="course-edit-card__delete" data-index="${index}">
                        <img src="../images/delete.svg" alt="Удалить">
                    </button>
                </div>
            `;
        }).join('');

        // Кнопки удаления
        document.querySelectorAll('#sale-edit-cards .course-edit-card__delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                currentSaleToDelete = parseInt(btn.dataset.index, 10);
                document.getElementById('confirm-delete-sale-overlay').classList.add('active');
                updateBodyScrollLock(); // если будет использоваться блокировка прокрутки
            });
        });

        // Кнопки редактирования
        document.querySelectorAll('#sale-edit-cards .course-edit-card__edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                editingSaleIndex = parseInt(btn.dataset.index, 10);
                const sale = sales[editingSaleIndex];
                document.getElementById('add-sale-title').textContent = 'Редактирование акции';
                document.getElementById('new-sale-name').value = sale.name;
                document.getElementById('new-sale-discount').value = sale.discount;
                document.getElementById('new-sale-date').value = sale.date;
                // убираем плейсхолдеры
                document.getElementById('new-sale-name').placeholder = '';
                document.getElementById('new-sale-discount').placeholder = '';
                document.getElementById('new-sale-date').placeholder = '';
                addSaleOverlay.classList.add('active');
            });
        });

        updateSaleScrollbar();
    }

    // Скроллбар для акций
    function updateSaleScrollbar() {
        const scroll = saleCardsContainer;
        const thumb = saleThumb;
        const containerHeight = 480; // высота .content-edit-scroll
        const thumbHeight = (scroll.clientHeight / scroll.scrollHeight) * containerHeight;
        thumb.style.height = Math.max(thumbHeight, 20) + 'px';
        scroll.addEventListener('scroll', () => {
            const scrollRatio = scroll.scrollTop / (scroll.scrollHeight - scroll.clientHeight);
            thumb.style.top = (scrollRatio * (containerHeight - thumb.offsetHeight)) + 'px';
        });
    }

    // Обработчик кнопки "Редактировать" на странице акций
    document.querySelectorAll('.btn--edit-sale').forEach(btn => {
        btn.addEventListener('click', () => {
            editingSaleIndex = null; // сброс режима
            renderSales();
            saleEditOverlay.classList.add('active');
        });
    });

    // Закрытие оверлея акций
    document.getElementById('sale-back-btn').addEventListener('click', () => {
        saleEditOverlay.classList.remove('active');
    });

    // Кнопка "Добавить акцию"
    document.getElementById('add-sale-btn').addEventListener('click', () => {
        editingSaleIndex = null;
        document.getElementById('add-sale-title').textContent = 'Добавление новой акции';
        document.getElementById('new-sale-name').value = '';
        document.getElementById('new-sale-discount').value = '';
        document.getElementById('new-sale-date').value = '';
        document.getElementById('new-sale-name').placeholder = 'Название акции';
        document.getElementById('new-sale-discount').placeholder = '-10%';
        document.getElementById('new-sale-date').placeholder = 'до 31.03.2026';
        addSaleOverlay.classList.add('active');
    });

    // Закрытие оверлея добавления акции
    document.getElementById('close-add-sale').addEventListener('click', () => {
        addSaleOverlay.classList.remove('active');
    });

    // Сохранение новой/отредактированной акции
    document.getElementById('save-new-sale').addEventListener('click', () => {
        const name = document.getElementById('new-sale-name').value.trim();
        const discount = document.getElementById('new-sale-discount').value.trim();
        const date = document.getElementById('new-sale-date').value.trim();
        if (!name || !discount || !date) return; // простая валидация

        const updatedSale = { name, discount, date };

        if (editingSaleIndex !== null) {
            sales[editingSaleIndex] = updatedSale;
        } else {
            sales.push(updatedSale);
        }

        renderSales();
        addSaleOverlay.classList.remove('active');
        editingSaleIndex = null;
    });

    // Сохранить (закрытие основного оверлея)
    document.getElementById('save-sales-btn').addEventListener('click', () => {
        saleEditOverlay.classList.remove('active');
        showCourseSuccess('Изменения сохранены!');  // используем тот же алерт успеха
    });

    // Удаление акции – кнопки подтверждения
    document.getElementById('cancel-delete-sale').addEventListener('click', () => {
        document.getElementById('confirm-delete-sale-overlay').classList.remove('active');
    });
    document.getElementById('confirm-delete-sale').addEventListener('click', () => {
        if (currentSaleToDelete !== null) {
            sales.splice(currentSaleToDelete, 1);
            renderSales();
            showCourseSuccess('Акция успешно удалена!');
        }
        document.getElementById('confirm-delete-sale-overlay').classList.remove('active');
        currentSaleToDelete = null;
    });

    // ИНСТРУКТОРЫ 
    const instructors = [
        // Преподаватели по теории
        { name: 'Ушакова Инна Геннадьевна', experience: '12 лет', car: '', education: 'Высшее', rating: '4.7', photoLoaded: true, category: 'Преподаватель по теории' },
        { name: 'Алифиренко Александр Николаевич', experience: '20 лет', car: '', education: 'Высшее', rating: '4.7', photoLoaded: true, category: 'Преподаватель по теории' },
        { name: 'Симакин Данил Владимирович', experience: '17 лет', car: '', education: 'Высшее', rating: '4.8', photoLoaded: true, category: 'Преподаватель по теории' },
        { name: 'Кокшаров Игорь Викторович', experience: '15 лет', car: '', education: 'Высшее', rating: '4.9', photoLoaded: true, category: 'Преподаватель по теории' },
        { name: 'Котляренко Людмила Васильевна', experience: '14 лет', car: '', education: 'Высшее', rating: '4.6', photoLoaded: true, category: 'Преподаватель по теории' },
        { name: 'Мещеряков Александр Александрович', experience: '11 лет', car: '', education: 'Высшее', rating: '4.8', photoLoaded: true, category: 'Преподаватель по теории' },
        { name: 'Устюгов Виктор Владимирович', experience: '13 лет', car: '', education: 'Высшее', rating: '4.5', photoLoaded: true, category: 'Преподаватель по теории' },
        // Инструкторы по вождению
        { name: 'Ярушин Алексей Константинович', experience: '10 лет', car: 'Hyundai Accent', education: '', rating: '4.8', photoLoaded: true, category: 'Инструктор по вождению' },
        { name: 'Бубенко Елена Валерьевна', experience: '14 лет', car: 'Hyundai Solaris', education: '', rating: '4.6', photoLoaded: true, category: 'Инструктор по вождению' },
        { name: 'Ярушин Иван Константинович', experience: '11 лет', car: 'Changan Alsvin', education: '', rating: '4.7', photoLoaded: true, category: 'Инструктор по вождению' },
        { name: 'Гаев Александр Геннадьевич', experience: '7 лет', car: 'Renault Logan', education: '', rating: '4.5', photoLoaded: true, category: 'Инструктор по вождению' },
        { name: 'Махоня Ольга Валентиновна', experience: '27 лет', car: 'Lada Vesta', education: '', rating: '4.2', photoLoaded: true, category: 'Инструктор по вождению' },
        { name: 'Гриб Валерий Анатольевич', experience: '20 лет', car: 'Renault Kaptur', education: '', rating: '4.0', photoLoaded: true, category: 'Инструктор по вождению' },
        { name: 'Могилевский Сергей Аркадьевич', experience: '19 лет', car: 'Chevrolet Lacetti', education: '', rating: '3.2', photoLoaded: true, category: 'Инструктор по вождению' },
        { name: 'Сокольников Дмитрий Викторович', experience: '19 лет', car: 'Hyundai Accent', education: '', rating: '3.7', photoLoaded: true, category: 'Инструктор по вождению' },
        { name: 'Махотина Ксения Олеговна', experience: '6 лет', car: 'Lada Vesta', education: '', rating: '5.0', photoLoaded: true, category: 'Инструктор по вождению' },
        { name: 'Чувильков Денис Алексеевич', experience: '10 лет', car: 'Hyundai Accent', education: '', rating: '4.6', photoLoaded: true, category: 'Инструктор по вождению' },
        { name: 'Юсупова Юлия Суфьяновна', experience: '7 лет', car: 'Changan Alsvin', education: '', rating: '4.3', photoLoaded: true, category: 'Инструктор по вождению' }
    ];

    const instructorEditOverlay = document.getElementById('instructor-edit-overlay');
    const addInstructorOverlay = document.getElementById('add-instructor-overlay');
    const instructorCardsContainer = document.getElementById('instructor-edit-cards');
    const instructorThumb = document.getElementById('instructor-edit-thumb');
    let currentInstructorToDelete = null;
    let editingInstructorIndex = null;

    // Скрытый input для загрузки фото (создаётся один раз)
    let photoInput = null;
    function ensurePhotoInput() {
        if (!photoInput) {
            photoInput = document.createElement('input');
            photoInput.type = 'file';
            photoInput.accept = '.jpg,.jpeg,.png,.webp';
            photoInput.classList.add('photo-upload-input');
            document.body.appendChild(photoInput);
        }
        return photoInput;
    }

    function renderInstructors() {
        instructorCardsContainer.innerHTML = instructors.map((inst, index) => {
            // Третья строка: авто или образование в зависимости от категории
            let thirdDetail = '';
            if (inst.car) {
                thirdDetail = `<div class="instructor-car">Автомобиль: ${inst.car}</div>`;
            } else if (inst.education) {
                thirdDetail = `<div class="instructor-education">Образование: ${inst.education}</div>`;
            }
            return `
                <div class="course-edit-card" data-index="${index}">
                    <div class="instructor-card-left">
                        <div class="instructor-name">${inst.name}</div>
                        <div class="instructor-experience">Стаж вождения: ${inst.experience}</div>
                        ${thirdDetail}
                    </div>
                    <div class="instructor-card-right">
                        <span class="instructor-rating">${inst.rating}</span>
                        <span class="instructor-photo-status">${inst.photoLoaded ? 'Фотография загружена' : 'Фотография не загружена'}</span>
                    </div>
                    <button class="course-edit-card__edit" data-index="${index}">
                        <img src="../images/edit.svg" alt="Редактировать">
                    </button>
                    <button class="course-edit-card__delete" data-index="${index}">
                        <img src="../images/delete.svg" alt="Удалить">
                    </button>
                </div>
            `;
        }).join('');

        // Кнопки удаления
        document.querySelectorAll('#instructor-edit-cards .course-edit-card__delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                currentInstructorToDelete = parseInt(btn.dataset.index, 10);
                document.getElementById('confirm-delete-instructor-overlay').classList.add('active');
            });
        });

        // Кнопки редактирования
        document.querySelectorAll('#instructor-edit-cards .course-edit-card__edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                editingInstructorIndex = parseInt(btn.dataset.index, 10);
                const inst = instructors[editingInstructorIndex];
                document.getElementById('add-instructor-title').textContent = 'Редактирование инструктора';
                document.getElementById('new-instructor-name').value = inst.name;
                document.getElementById('new-instructor-experience').value = inst.experience;
                document.getElementById('new-instructor-car').value = inst.car || '';
                document.getElementById('new-instructor-education').value = inst.education || '';
                // Рейтинг не редактируем – отключаем поле
                const ratingInput = document.getElementById('new-instructor-rating');
                ratingInput.value = inst.rating;
                ratingInput.disabled = true;
                ratingInput.style.backgroundColor = '#e9e9e9';
                // Категория
                const selectContainer = document.getElementById('instructor-category-select');
                const selectedSpan = selectContainer.querySelector('.custom-select__selected');
                const nativeSelect = selectContainer.querySelector('.custom-select__native');
                selectedSpan.textContent = inst.category;
                nativeSelect.value = inst.category;
                // Статус фото
                document.getElementById('upload-photo-btn').dataset.photoLoaded = inst.photoLoaded;
                document.getElementById('upload-photo-btn').textContent = inst.photoLoaded ? 'Файл выбран' : 'Выбрать файл';
                // Очищаем плейсхолдеры
                document.getElementById('new-instructor-name').placeholder = '';
                document.getElementById('new-instructor-experience').placeholder = '';
                document.getElementById('new-instructor-car').placeholder = '';
                document.getElementById('new-instructor-education').placeholder = '';
                document.getElementById('new-instructor-rating').placeholder = '';
                addInstructorOverlay.classList.add('active');
            });
        });

        updateInstructorScrollbar();
    }

    function updateInstructorScrollbar() {
        const scroll = instructorCardsContainer;
        const thumb = instructorThumb;
        const containerHeight = 480;
        const thumbHeight = (scroll.clientHeight / scroll.scrollHeight) * containerHeight;
        thumb.style.height = Math.max(thumbHeight, 20) + 'px';
        scroll.addEventListener('scroll', () => {
            const scrollRatio = scroll.scrollTop / (scroll.scrollHeight - scroll.clientHeight);
            thumb.style.top = (scrollRatio * (containerHeight - thumb.offsetHeight)) + 'px';
        });
    }

    // Обработчик кнопки «Редактировать» в панели управления
    document.querySelectorAll('.btn--edit-instr').forEach(btn => {
        btn.addEventListener('click', () => {
            renderInstructors();
            instructorEditOverlay.classList.add('active');
        });
    });

    // Закрытие основного оверлея
    document.getElementById('instructor-back-btn').addEventListener('click', () => {
        instructorEditOverlay.classList.remove('active');
    });

    // Кнопка «Добавить инструктора»
    document.getElementById('add-instructor-btn').addEventListener('click', () => {
        editingInstructorIndex = null;
        document.getElementById('add-instructor-title').textContent = 'Добавление нового инструктора';
        document.getElementById('new-instructor-name').value = '';
        document.getElementById('new-instructor-experience').value = '';
        document.getElementById('new-instructor-car').value = '';
        document.getElementById('new-instructor-education').value = '';
        const ratingInput = document.getElementById('new-instructor-rating');
        ratingInput.value = '–';
        ratingInput.disabled = true;
        ratingInput.style.backgroundColor = '#e9e9e9';
        document.getElementById('new-instructor-name').placeholder = 'ФИО';
        document.getElementById('new-instructor-experience').placeholder = '10 лет';
        document.getElementById('new-instructor-car').placeholder = 'Hyundai Accent';
        document.getElementById('new-instructor-education').placeholder = 'Высшее';
        // Сброс категории
        const selectContainer = document.getElementById('instructor-category-select');
        selectContainer.querySelector('.custom-select__selected').textContent = 'Инструктор по вождению';
        selectContainer.querySelector('.custom-select__native').value = 'Инструктор по вождению';
        // Кнопка загрузки
        document.getElementById('upload-photo-btn').textContent = 'Выбрать файл';
        document.getElementById('upload-photo-btn').dataset.photoLoaded = 'false';
        addInstructorOverlay.classList.add('active');
    });

    // Закрытие оверлея добавления
    document.getElementById('close-add-instructor').addEventListener('click', () => {
        addInstructorOverlay.classList.remove('active');
    });

    // Работа с кнопкой «Выбрать файл»
    document.getElementById('upload-photo-btn').addEventListener('click', function() {
        const input = ensurePhotoInput();
        input.click();   // открываем диалог выбора файла
        // При выборе файла обновляем статус
        input.onchange = () => {
            if (input.files.length > 0) {
                this.textContent = 'Файл выбран';
                this.dataset.photoLoaded = 'true';
            } else {
                this.textContent = 'Выбрать файл';
                this.dataset.photoLoaded = 'false';
            }
        };
    });

    // Сохранить (основной оверлей)
    document.getElementById('save-instructors-btn').addEventListener('click', () => {
        instructorEditOverlay.classList.remove('active');
        showCourseSuccess('Изменения сохранены!');
    });

    // Удаление инструктора
    document.getElementById('cancel-delete-instructor').addEventListener('click', () => {
        document.getElementById('confirm-delete-instructor-overlay').classList.remove('active');
    });
    document.getElementById('confirm-delete-instructor').addEventListener('click', () => {
        if (currentInstructorToDelete !== null) {
            instructors.splice(currentInstructorToDelete, 1);
            renderInstructors();
            showCourseSuccess('Инструктор успешно удалён!');
        }
        document.getElementById('confirm-delete-instructor-overlay').classList.remove('active');
        currentInstructorToDelete = null;
    });

    // Инициализация кастомного селекта категории
    function initCategorySelect() {
        const container = document.getElementById('instructor-category-select');
        if (!container) return;

        // Ждём, пока forma.js отработает, и перехватываем управление
        setTimeout(() => {
            const trigger = container.querySelector('.custom-select__trigger');
            const selected = container.querySelector('.custom-select__selected');
            const options = container.querySelectorAll('.custom-select__options li');
            const native = container.querySelector('.custom-select__native');

            // Создаём новый триггер с нуля, чтобы гарантированно убрать чужие обработчики
            const newTrigger = document.createElement('div');
            newTrigger.className = 'custom-select__trigger';
            newTrigger.innerHTML = trigger.innerHTML;
            trigger.replaceWith(newTrigger);

            newTrigger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                container.classList.toggle('open');
            });

            options.forEach(opt => {
                opt.addEventListener('click', (e) => {
                    e.stopPropagation();
                    selected.textContent = opt.dataset.value;
                    native.value = opt.dataset.value;
                    container.classList.remove('open');
                });
            });

            document.addEventListener('click', (e) => {
                if (!container.contains(e.target)) {
                    container.classList.remove('open');
                }
            });
        }, 10);  
    }

    // Сохранение инструктора с валидацией без alert
    document.getElementById('save-new-instructor').addEventListener('click', () => {
        // Сброс ошибок
        document.querySelectorAll('.add-course-input.error').forEach(input => input.classList.remove('error'));
        document.querySelectorAll('.field-error-text').forEach(el => el.remove());

        const nameInput = document.getElementById('new-instructor-name');
        const expInput = document.getElementById('new-instructor-experience');
        const carInput = document.getElementById('new-instructor-car');
        const eduInput = document.getElementById('new-instructor-education');
        const categorySelect = document.getElementById('instructor-category-select');
        const category = categorySelect.querySelector('.custom-select__selected').textContent;
        const photoLoaded = document.getElementById('upload-photo-btn').dataset.photoLoaded === 'true';
        const rating = document.getElementById('new-instructor-rating').value.trim();

        const name = nameInput.value.trim();
        const experience = expInput.value.trim();
        const car = carInput.value.trim();
        const education = eduInput.value.trim();

        let isValid = true;

        function setError(input, wrapper) {
            input.classList.add('error');
            // Удаляем предыдущее сообщение, если есть
            const oldErr = wrapper.querySelector('.field-error-text');
            if (oldErr) oldErr.remove();
            const err = document.createElement('span');
            err.className = 'field-error-text';
            err.textContent = 'Заполните поле';
            wrapper.appendChild(err);
        }

        if (!name) {
            const wrapper = nameInput.closest('.input-wrapper');
            if (wrapper) setError(nameInput, wrapper);
            isValid = false;
        }
        if (!experience) {
            const wrapper = expInput.closest('.input-wrapper');
            if (wrapper) setError(expInput, wrapper);
            isValid = false;
        }

        if (category === 'Инструктор по вождению' && !car) {
            const wrapper = carInput.closest('.input-wrapper');
            if (wrapper) setError(carInput, wrapper);
            isValid = false;
        }
        if (category === 'Преподаватель по теории' && !education) {
            const wrapper = eduInput.closest('.input-wrapper');
            if (wrapper) setError(eduInput, wrapper);
            isValid = false;
        }

        if (!isValid) return;

        const updatedInstructor = {
            name, experience, car, education, rating, category, photoLoaded
        };

        if (editingInstructorIndex !== null) {
            instructors[editingInstructorIndex] = updatedInstructor;
        } else {
            instructors.push(updatedInstructor);
        }

        renderInstructors();
        addInstructorOverlay.classList.remove('active');
        editingInstructorIndex = null;
    });

    // Оверлей выхода
    const logoutOverlay = document.getElementById('logout-overlay');
    document.getElementById('logout-btn').addEventListener('click', () => logoutOverlay.classList.add('active'));
    document.getElementById('cancel-logout').addEventListener('click', () => logoutOverlay.classList.remove('active'));
    document.getElementById('confirm-logout').addEventListener('click', () => { window.location.href = '../pages/login.html'; });

    // Оверлей удаления аккаунта
    const deleteAccountOverlay = document.getElementById('delete-account-overlay');
    document.getElementById('delete-account-btn').addEventListener('click', () => deleteAccountOverlay.classList.add('active'));
    document.getElementById('cancel-delete-account').addEventListener('click', () => deleteAccountOverlay.classList.remove('active'));
    document.getElementById('confirm-delete-account').addEventListener('click', () => { alert('Аккаунт удалён'); deleteAccountOverlay.classList.remove('active'); });
});