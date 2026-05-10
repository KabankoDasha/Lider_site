document.addEventListener('DOMContentLoaded', () => {

    const userData = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    if (userData && userData.name) {
        const nameElement = document.querySelector('.sidebar-name');
        if (nameElement) nameElement.textContent = userData.name;
    }

    // --- Переключение вкладок левого меню ---
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

    // =================== ЗАЯВКИ ===================
    const appContainer = document.getElementById('applications-container');
    const appOverlay = document.getElementById('application-detail-overlay');
    const closeAppOverlay = document.getElementById('close-application-overlay');
    const statusSelect = document.getElementById('app-status');
    const saveApplicationBtn = document.getElementById('save-application');
    const tabs = document.querySelectorAll('.tab');

    let allApps = [];
    let currentAppId = null;

    const appsBadge = document.querySelector('.sidebar-menu__item[data-target="applications"] .counter-badge');

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

    async function loadApplications() {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const response = await fetch('http://localhost:3001/api/applications/admin', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Ошибка загрузки заявок');
            allApps = await response.json();
            updateApplicationsBadge();
            renderApplications();
        } catch (err) {
            console.error(err);
        }
    }

    function updateApplicationsBadge() {
        if (appsBadge) {
            const activeCount = allApps.filter(app => app.status === 'processing').length;
            appsBadge.textContent = activeCount;
        }
    }

    function renderApplications() {
        appContainer.innerHTML = allApps.map(app => {
            const date = new Date(app.created_at).toLocaleDateString('ru-RU', {
                day: 'numeric', month: 'long', year: 'numeric'
            });
            const statusRu = {
                processing: 'в обработке',
                confirmed: 'подтверждена',
                rejected: 'отклонена'
            }[app.status] || 'в обработке';

            const newIndicator = app.status === 'processing' ? '<span class="new-indicator"></span>' : '';

            return `
                <article class="application-card" data-id="${app.id}" data-status="${app.status}">
                    <div class="application-header">
                        <h4 class="application-number">Заявка №${app.id}</h4>
                        <span class="application-status" data-status="${app.status}">${statusRu}</span>
                    </div>
                    <p class="application-course">${escapeHtml(app.course || '')}</p>
                    <p class="application-message">${escapeHtml(app.comment || '')}</p>
                    <time class="application-date">от ${date}</time>
                    ${newIndicator}
                </article>`;
        }).join('');

        document.querySelectorAll('#applications-container .application-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const id = card.dataset.id;
                const app = allApps.find(a => a.id == id);
                if (!app) return;
                currentAppId = app.id;

                document.getElementById('app-number').textContent = app.id;
                document.getElementById('app-name').textContent = app.user_name || 'Не указано';
                document.getElementById('app-phone').textContent = app.user_phone || 'Не указан';
                document.getElementById('app-course').textContent = app.course || '—';
                document.getElementById('app-comment').textContent = app.comment || '—';
                document.getElementById('app-date').textContent = new Date(app.created_at).toLocaleDateString('ru-RU', {
                    day: 'numeric', month: 'long', year: 'numeric'
                });

                const statusMapRu = {
                    processing: 'в обработке',
                    confirmed: 'подтверждена',
                    rejected: 'отклонена'
                };
                const currentStatusRu = statusMapRu[app.status] || 'в обработке';
                document.getElementById('app-status-selected').textContent = currentStatusRu;
                document.getElementById('app-status').value = currentStatusRu;
                document.getElementById('app-status-selected').classList.remove('placeholder');

                appOverlay.classList.add('active');
            });
        });

        applyActiveTabFilter();
    }

    function applyActiveTabFilter() {
        const activeTab = document.querySelector('.tab.active');
        if (!activeTab) return;
        const target = activeTab.dataset.tab;
        document.querySelectorAll('#applications-container .application-card').forEach(card => {
            const status = card.dataset.status;
            if (target === 'active') {
                card.style.display = (status === 'processing') ? '' : 'none';
            } else {
                card.style.display = (status === 'confirmed' || status === 'rejected') ? '' : 'none';
            }
        });
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            applyActiveTabFilter();
        });
    });

    closeAppOverlay.addEventListener('click', () => appOverlay.classList.remove('active'));

    saveApplicationBtn.addEventListener('click', async () => {
        if (!currentAppId) return;
        const newStatusRu = document.getElementById('app-status').value;
        const statusMap = {
            'в обработке': 'processing',
            'подтверждена': 'confirmed',
            'отклонена': 'rejected'
        };
        const newStatus = statusMap[newStatusRu] || 'processing';

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:3001/api/applications/admin/${currentAppId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (!response.ok) throw new Error('Ошибка обновления статуса');

            const app = allApps.find(a => a.id == currentAppId);
            if (app) app.status = newStatus;
            updateApplicationsBadge();
            renderApplications();
            appOverlay.classList.remove('active');
        } catch (err) {
            console.error(err);
            alert('Не удалось сохранить статус');
        }
    });

    // =================== МОДЕРАЦИЯ ОТЗЫВОВ ===================
    const reviewContainer = document.getElementById('reviews-container');
    const reviewOverlay = document.getElementById('review-detail-overlay');
    const closeReviewOverlay = document.getElementById('close-review-overlay');
    const deleteReviewBtn = document.getElementById('delete-review');
    const approveReviewBtn = document.getElementById('approve-review');
    const confirmDeleteReviewOverlay = document.getElementById('confirm-delete-review-overlay');
    const cancelDeleteReviewBtn = document.getElementById('cancel-delete-review');
    const confirmDeleteReviewBtn = document.getElementById('confirm-delete-review');
    const reviewSuccessOverlay = document.getElementById('review-success-overlay');
    const successMessage = document.getElementById('success-message');

    const reviewsBadge = document.querySelector('.sidebar-menu__item[data-target="reviews"] .counter-badge');

    let allReviews = [];
    let currentReviewId = null;

    async function loadReviews() {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const response = await fetch('http://localhost:3001/api/reviews/admin', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Ошибка загрузки отзывов');
            allReviews = await response.json();
            updateReviewsBadge();
            renderReviews();
        } catch (err) {
            console.error(err);
        }
    }

    function updateReviewsBadge() {
        if (reviewsBadge) {
            reviewsBadge.textContent = allReviews.length;
        }
    }

    function renderReviews() {
        reviewContainer.innerHTML = allReviews.map(review => {
            const starsHtml = Array.from({ length: 5 }, (_, i) =>
                `<span class="star ${i < review.rating ? 'star--active' : ''}"></span>`
            ).join('');
            const dateStr = new Date(review.created_at).toLocaleDateString('ru-RU', {
                day: 'numeric', month: 'long', year: 'numeric'
            });
            return `
                <article class="review-card" data-id="${review.id}">
                    <div class="review-card__header">
                        <div>
                            <h4 class="review-card__name">${escapeHtml(review.name)}</h4>
                            <p class="review-card__course">${escapeHtml(review.course || '')}</p>
                        </div>
                        <div class="review-card__stars">${starsHtml}</div>
                    </div>
                    <p class="review-card__text">${escapeHtml(review.text)}</p>
                    <time class="review-card__date">${dateStr}</time>
                </article>`;
        }).join('');

        document.querySelectorAll('#reviews-container .review-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.id;
                const review = allReviews.find(r => r.id == id);
                if (!review) return;
                currentReviewId = review.id;

                document.getElementById('review-name').textContent = review.name;
                document.getElementById('review-course').textContent = review.course || '';
                document.getElementById('review-text').textContent = review.text;
                document.getElementById('review-rating').textContent = review.rating;
                document.getElementById('review-date').textContent = new Date(review.created_at).toLocaleDateString('ru-RU', {
                    day: 'numeric', month: 'long', year: 'numeric'
                });
                reviewOverlay.classList.add('active');
            });
        });
    }

    closeReviewOverlay.addEventListener('click', () => reviewOverlay.classList.remove('active'));
    reviewOverlay.addEventListener('click', (e) => {
        if (e.target === reviewOverlay) reviewOverlay.classList.remove('active');
    });

    approveReviewBtn.addEventListener('click', async () => {
        if (!currentReviewId) return;
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:3001/api/reviews/admin/${currentReviewId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'published' })
            });
            if (!response.ok) throw new Error('Ошибка публикации');
            allReviews = allReviews.filter(r => r.id != currentReviewId);
            updateReviewsBadge();
            renderReviews();
            reviewOverlay.classList.remove('active');
            showReviewSuccess('Отзыв успешно опубликован!');
        } catch (err) {
            console.error(err);
            alert('Не удалось опубликовать отзыв');
        }
    });

    deleteReviewBtn.addEventListener('click', () => {
        confirmDeleteReviewOverlay.classList.add('active');
    });
    cancelDeleteReviewBtn.addEventListener('click', () => {
        confirmDeleteReviewOverlay.classList.remove('active');
    });

    confirmDeleteReviewBtn.addEventListener('click', async () => {
        if (!currentReviewId) return;
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:3001/api/reviews/admin/${currentReviewId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Ошибка удаления');
            allReviews = allReviews.filter(r => r.id != currentReviewId);
            updateReviewsBadge();
            renderReviews();
            reviewOverlay.classList.remove('active');
            confirmDeleteReviewOverlay.classList.remove('active');
            showReviewSuccess('Отзыв удалён!');
        } catch (err) {
            console.error(err);
            alert('Не удалось удалить отзыв');
        }
    });

    function showReviewSuccess(message) {
        successMessage.textContent = message;
        reviewSuccessOverlay.classList.add('active');
        reviewSuccessOverlay.onclick = () => reviewSuccessOverlay.classList.remove('active');
    }

    // =================== ОБЩАЯ ФУНКЦИЯ ДЛЯ УВЕДОМЛЕНИЙ О КОНТЕНТЕ ===================
    function showCourseSuccess(message) {
        const overlay = document.getElementById('course-success-overlay');
        if (!overlay) return;
        document.getElementById('course-success-message').textContent = message;
        overlay.classList.add('active');
        overlay.onclick = () => overlay.classList.remove('active');
    }

    // =================== УПРАВЛЕНИЕ КОНТЕНТОМ ===================
    // ---- КУРСЫ ----
    let courses = [];
    let currentCourseToDelete = null;
    const contentOverlay = document.getElementById('content-edit-overlay');
    const addCourseOverlay = document.getElementById('add-course-overlay');
    const cardsContainer = document.getElementById('content-edit-cards');
    const thumb = document.getElementById('content-edit-thumb');
    let editingCourseId = null;

    async function loadCourses() {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:3001/api/courses', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Ошибка загрузки курсов');
            courses = await response.json();
            renderCourses();
        } catch (err) {
            console.error(err);
        }
    }

    function renderCourses() {
        cardsContainer.innerHTML = courses.map(course => {
            const hasBothOptions = course.distance_price && course.fulltime_price;
            let pricesHtml = '';
            if (hasBothOptions) {
                pricesHtml += `<div class="price-option"><span class="price-option__label">дистанционное</span><div class="price-option__values"><span class="price-current">${course.distance_price} руб.</span>`;
                if (course.distance_old_price) pricesHtml += `<span class="price-old">${course.distance_old_price} руб.</span>`;
                pricesHtml += `</div></div>`;
                pricesHtml += `<div class="price-option"><span class="price-option__label">очное</span><div class="price-option__values"><span class="price-current">${course.fulltime_price} руб.</span>`;
                if (course.fulltime_old_price) pricesHtml += `<span class="price-old">${course.fulltime_old_price} руб.</span>`;
                pricesHtml += `</div></div>`;
            } else {
                pricesHtml = `<div class="price-option single-price"><div class="price-option__values"><span class="price-current">${course.distance_price || course.fulltime_price || ''} руб.</span>`;
                if (course.distance_old_price || course.fulltime_old_price) {
                    pricesHtml += `<span class="price-old">${course.distance_old_price || course.fulltime_old_price} руб.</span>`;
                }
                pricesHtml += `</div></div>`;
            }
            return `
                <div class="course-edit-card" data-id="${course.id}">
                    <div class="course-edit-card__name">${escapeHtml(course.name)}</div>
                    <div class="course-edit-card__duration">${escapeHtml(course.duration || '')}</div>
                    <div class="course-edit-card__prices">${pricesHtml}</div>
                    <button class="course-edit-card__edit" data-id="${course.id}">
                        <img src="../images/edit.svg" alt="Редактировать">
                    </button>
                    <button class="course-edit-card__delete" data-id="${course.id}">
                        <img src="../images/delete.svg" alt="Удалить">
                    </button>
                </div>`;
        }).join('');

        document.querySelectorAll('.course-edit-card__delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                currentCourseToDelete = btn.dataset.id;
                document.getElementById('confirm-delete-course-overlay').classList.add('active');
            });
        });

        document.querySelectorAll('.course-edit-card__edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const course = courses.find(c => c.id == id);
                if (!course) return;
                document.querySelector('.add-course-title').textContent = 'Редактирование курса';
                document.getElementById('new-course-name').value = course.name;
                document.getElementById('new-course-duration').value = course.duration || '';
                document.getElementById('new-course-distance').value = course.distance_price || '';
                document.getElementById('new-course-distance-old').value = course.distance_old_price || '';
                document.getElementById('new-course-fulltime').value = course.fulltime_price || '';
                document.getElementById('new-course-fulltime-old').value = course.fulltime_old_price || '';
                editingCourseId = id;
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

    document.getElementById('confirm-delete-course').addEventListener('click', async () => {
        if (!currentCourseToDelete) return;
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:3001/api/courses/${currentCourseToDelete}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Ошибка удаления');
            loadCourses();
            document.getElementById('confirm-delete-course-overlay').classList.remove('active');
            showCourseSuccess('Курс успешно удалён!');
        } catch (err) {
            console.error(err);
            alert('Не удалось удалить курс');
        }
        currentCourseToDelete = null;
    });

    document.getElementById('cancel-delete-course').addEventListener('click', () => {
        document.getElementById('confirm-delete-course-overlay').classList.remove('active');
        currentCourseToDelete = null;
    });

    document.querySelectorAll('.btn--edit').forEach(btn => {
        btn.addEventListener('click', () => {
            editingCourseId = null;
            document.querySelector('.add-course-title').textContent = 'Добавление нового курса';
            document.getElementById('new-course-name').value = '';
            document.getElementById('new-course-duration').value = '';
            document.getElementById('new-course-distance').value = '';
            document.getElementById('new-course-distance-old').value = '';
            document.getElementById('new-course-fulltime').value = '';
            document.getElementById('new-course-fulltime-old').value = '';
            loadCourses();
            contentOverlay.classList.add('active');
        });
    });

    document.getElementById('content-back-btn').addEventListener('click', () => {
        contentOverlay.classList.remove('active');
    });

    document.getElementById('add-course-btn').addEventListener('click', () => {
        editingCourseId = null;
        document.querySelector('.add-course-title').textContent = 'Добавление нового курса';
        document.getElementById('new-course-name').value = '';
        document.getElementById('new-course-duration').value = '';
        document.getElementById('new-course-distance').value = '';
        document.getElementById('new-course-distance-old').value = '';
        document.getElementById('new-course-fulltime').value = '';
        document.getElementById('new-course-fulltime-old').value = '';
        document.getElementById('new-course-name').placeholder = 'Автомобиль с МКПП — категория «B»';
        document.getElementById('new-course-duration').placeholder = '2,5 месяца';
        document.getElementById('new-course-distance').placeholder = '46 700';
        document.getElementById('new-course-distance-old').placeholder = '48 700';
        document.getElementById('new-course-fulltime').placeholder = '49 700';
        document.getElementById('new-course-fulltime-old').placeholder = '51 700';
        addCourseOverlay.classList.add('active');
    });

    document.getElementById('close-add-course').addEventListener('click', () => {
        addCourseOverlay.classList.remove('active');
    });

    document.getElementById('save-new-course').addEventListener('click', async () => {
        const token = localStorage.getItem('token');
        const data = {
            name: document.getElementById('new-course-name').value,
            duration: document.getElementById('new-course-duration').value,
            distancePrice: document.getElementById('new-course-distance').value,
            distanceOld: document.getElementById('new-course-distance-old').value,
            fulltimePrice: document.getElementById('new-course-fulltime').value,
            fulltimeOld: document.getElementById('new-course-fulltime-old').value,
        };
        if (editingCourseId) {
            await fetch(`http://localhost:3001/api/courses/${editingCourseId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(data)
            });
        } else {
            await fetch('http://localhost:3001/api/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(data)
            });
        }
        addCourseOverlay.classList.remove('active');
        loadCourses();
        showCourseSuccess('Курс добавлен');
    });

    document.getElementById('save-content-btn').addEventListener('click', () => {
        contentOverlay.classList.remove('active');
        showCourseSuccess('Изменения сохранены');
    });

    // ---- АКЦИИ ----
    let sales = [];
    let currentSaleToDelete = null;
    const saleEditOverlay = document.getElementById('sale-edit-overlay');
    const addSaleOverlay = document.getElementById('add-sale-overlay');
    const saleCardsContainer = document.getElementById('sale-edit-cards');
    const saleThumb = document.getElementById('sale-edit-thumb');
    let editingSaleId = null;

    async function loadSales() {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:3001/api/sales', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Ошибка загрузки акций');
            sales = await res.json();
            renderSales();
        } catch (err) {
            console.error(err);
        }
    }

    function renderSales() {
        saleCardsContainer.innerHTML = sales.map(sale => `
            <div class="course-edit-card" data-id="${sale.id}">
                <div class="course-edit-card__name">${escapeHtml(sale.name)}</div>
                <div class="course-edit-card__duration">${escapeHtml(sale.discount)}</div>
                <div class="sale-period">
                    <span>Скидка действительна</span>
                    <span>${escapeHtml(sale.validity)}</span>
                </div>
                <button class="course-edit-card__edit" data-id="${sale.id}">
                    <img src="../images/edit.svg" alt="Редактировать">
                </button>
                <button class="course-edit-card__delete" data-id="${sale.id}">
                    <img src="../images/delete.svg" alt="Удалить">
                </button>
            </div>
        `).join('');

        document.querySelectorAll('#sale-edit-cards .course-edit-card__delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                currentSaleToDelete = btn.dataset.id;
                document.getElementById('confirm-delete-sale-overlay').classList.add('active');
            });
        });

        document.querySelectorAll('#sale-edit-cards .course-edit-card__edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const sale = sales.find(s => s.id == id);
                if (!sale) return;
                document.getElementById('add-sale-title').textContent = 'Редактирование акции';
                document.getElementById('new-sale-name').value = sale.name;
                document.getElementById('new-sale-discount').value = sale.discount;
                document.getElementById('new-sale-date').value = sale.validity;
                editingSaleId = id;
                addSaleOverlay.classList.add('active');
            });
        });

        updateSaleScrollbar();
    }

    function updateSaleScrollbar() {
        const scroll = saleCardsContainer;
        const containerHeight = 480;
        const thumbHeight = (scroll.clientHeight / scroll.scrollHeight) * containerHeight;
        saleThumb.style.height = Math.max(thumbHeight, 20) + 'px';
        scroll.addEventListener('scroll', () => {
            const scrollRatio = scroll.scrollTop / (scroll.scrollHeight - scroll.clientHeight);
            saleThumb.style.top = (scrollRatio * (containerHeight - saleThumb.offsetHeight)) + 'px';
        });
    }

    document.getElementById('confirm-delete-sale').addEventListener('click', async () => {
        if (!currentSaleToDelete) return;
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:3001/api/sales/${currentSaleToDelete}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Ошибка удаления');
            loadSales();
            document.getElementById('confirm-delete-sale-overlay').classList.remove('active');
            showCourseSuccess('Акция успешно удалена!');
        } catch (err) {
            console.error(err);
            alert('Не удалось удалить акцию');
        }
        currentSaleToDelete = null;
    });

    document.getElementById('cancel-delete-sale').addEventListener('click', () => {
        document.getElementById('confirm-delete-sale-overlay').classList.remove('active');
        currentSaleToDelete = null;
    });

    document.querySelectorAll('.btn--edit-sale').forEach(btn => {
        btn.addEventListener('click', () => {
            editingSaleId = null;
            loadSales();
            saleEditOverlay.classList.add('active');
        });
    });
    document.getElementById('sale-back-btn').addEventListener('click', () => {
        saleEditOverlay.classList.remove('active');
    });
    document.getElementById('add-sale-btn').addEventListener('click', () => {
        editingSaleId = null;
        document.getElementById('add-sale-title').textContent = 'Добавление новой акции';
        document.getElementById('new-sale-name').value = '';
        document.getElementById('new-sale-discount').value = '';
        document.getElementById('new-sale-date').value = '';
        addSaleOverlay.classList.add('active');
    });
    document.getElementById('close-add-sale').addEventListener('click', () => {
        addSaleOverlay.classList.remove('active');
    });
    document.getElementById('save-new-sale').addEventListener('click', async () => {
        const token = localStorage.getItem('token');
        const data = {
            name: document.getElementById('new-sale-name').value.trim(),
            discount: document.getElementById('new-sale-discount').value.trim(),
            validity: document.getElementById('new-sale-date').value.trim()
        };
        if (!data.name || !data.discount || !data.validity) return;
        if (editingSaleId) {
            await fetch(`http://localhost:3001/api/sales/${editingSaleId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(data)
            });
        } else {
            await fetch('http://localhost:3001/api/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(data)
            });
        }
        addSaleOverlay.classList.remove('active');
        loadSales();
        showCourseSuccess('Акция добавлена');
    });
    document.getElementById('save-sales-btn').addEventListener('click', () => {
        saleEditOverlay.classList.remove('active');
        showCourseSuccess('Изменения сохранены');
    });

    // ---- ИНСТРУКТОРЫ ----
    let instructors = [];
    let currentInstructorToDelete = null;
    const instructorEditOverlay = document.getElementById('instructor-edit-overlay');
    const addInstructorOverlay = document.getElementById('add-instructor-overlay');
    const instructorCardsContainer = document.getElementById('instructor-edit-cards');
    const instructorThumb = document.getElementById('instructor-edit-thumb');
    let editingInstructorId = null;

    async function loadInstructors() {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:3001/api/instructors', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Ошибка загрузки инструкторов');
            instructors = await res.json();
            renderInstructors();
        } catch (err) {
            console.error(err);
        }
    }

    function renderInstructors() {
        instructorCardsContainer.innerHTML = instructors.map(inst => {
            let thirdDetail = '';
            if (inst.car) thirdDetail = `<div class="instructor-car">Автомобиль: ${escapeHtml(inst.car)}</div>`;
            else if (inst.education) thirdDetail = `<div class="instructor-education">Образование: ${escapeHtml(inst.education)}</div>`;
            return `
                <div class="course-edit-card" data-id="${inst.id}">
                    <div class="instructor-card-left">
                        <div class="instructor-name">${escapeHtml(inst.name)}</div>
                        <div class="instructor-experience">Стаж вождения: ${escapeHtml(inst.experience)}</div>
                        ${thirdDetail}
                    </div>
                    <div class="instructor-card-right">
                        <span class="instructor-rating">${inst.rating}</span>
                        <span class="instructor-photo-status">${inst.photo ? 'Фотография загружена' : 'Фотография не загружена'}</span>
                    </div>
                    <button class="course-edit-card__edit" data-id="${inst.id}">
                        <img src="../images/edit.svg" alt="Редактировать">
                    </button>
                    <button class="course-edit-card__delete" data-id="${inst.id}">
                        <img src="../images/delete.svg" alt="Удалить">
                    </button>
                </div>`;
        }).join('');

        document.querySelectorAll('#instructor-edit-cards .course-edit-card__delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                currentInstructorToDelete = btn.dataset.id;
                document.getElementById('confirm-delete-instructor-overlay').classList.add('active');
            });
        });

        document.querySelectorAll('#instructor-edit-cards .course-edit-card__edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const inst = instructors.find(i => i.id == id);
                if (!inst) return;
                document.getElementById('add-instructor-title').textContent = 'Редактирование инструктора';
                document.getElementById('new-instructor-name').value = inst.name;
                document.getElementById('new-instructor-experience').value = inst.experience;
                document.getElementById('new-instructor-car').value = inst.car || '';
                document.getElementById('new-instructor-education').value = inst.education || '';
                document.getElementById('new-instructor-rating').value = inst.rating;
                document.getElementById('upload-photo-btn').dataset.photoLoaded = inst.photo ? 'true' : 'false';
                document.getElementById('upload-photo-btn').textContent = inst.photo ? 'Файл выбран' : 'Выбрать файл';
                editingInstructorId = id;
                addInstructorOverlay.classList.add('active');
            });
        });

        updateInstructorScrollbar();
    }

    function updateInstructorScrollbar() {
        const scroll = instructorCardsContainer;
        const containerHeight = 480;
        const thumbHeight = (scroll.clientHeight / scroll.scrollHeight) * containerHeight;
        instructorThumb.style.height = Math.max(thumbHeight, 20) + 'px';
        scroll.addEventListener('scroll', () => {
            const scrollRatio = scroll.scrollTop / (scroll.scrollHeight - scroll.clientHeight);
            instructorThumb.style.top = (scrollRatio * (containerHeight - instructorThumb.offsetHeight)) + 'px';
        });
    }

    (function() {
        const container = document.getElementById('instructor-category-select');
        if (!container) return;
        const trigger = container.querySelector('.custom-select__trigger');
        const selected = container.querySelector('.custom-select__selected');
        const options = container.querySelectorAll('.custom-select__options li');
        const native = container.querySelector('.custom-select__native');
        trigger.addEventListener('click', (e) => {
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
    })();

    document.getElementById('confirm-delete-instructor').addEventListener('click', async () => {
        if (!currentInstructorToDelete) return;
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:3001/api/instructors/${currentInstructorToDelete}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Ошибка удаления');
            loadInstructors();
            document.getElementById('confirm-delete-instructor-overlay').classList.remove('active');
            showCourseSuccess('Инструктор успешно удалён!');
        } catch (err) {
            console.error(err);
            alert('Не удалось удалить инструктора');
        }
        currentInstructorToDelete = null;
    });

    document.getElementById('cancel-delete-instructor').addEventListener('click', () => {
        document.getElementById('confirm-delete-instructor-overlay').classList.remove('active');
        currentInstructorToDelete = null;
    });

    document.querySelectorAll('.btn--edit-instr').forEach(btn => {
        btn.addEventListener('click', () => {
            loadInstructors();
            instructorEditOverlay.classList.add('active');
        });
    });

    document.getElementById('instructor-back-btn').addEventListener('click', () => {
        instructorEditOverlay.classList.remove('active');
    });

    document.getElementById('add-instructor-btn').addEventListener('click', () => {
        editingInstructorId = null;
        document.getElementById('add-instructor-title').textContent = 'Добавление нового инструктора';
        document.getElementById('new-instructor-name').value = '';
        document.getElementById('new-instructor-experience').value = '';
        document.getElementById('new-instructor-car').value = '';
        document.getElementById('new-instructor-education').value = '';
        const ratingInput = document.getElementById('new-instructor-rating');
        ratingInput.value = '–';
        ratingInput.disabled = true;
        ratingInput.style.backgroundColor = '#f0f0f0';
        document.getElementById('upload-photo-btn').textContent = 'Выбрать файл';
        document.getElementById('upload-photo-btn').dataset.photoLoaded = 'false';
        const selectContainer = document.getElementById('instructor-category-select');
        selectContainer.querySelector('.custom-select__selected').textContent = 'Инструктор по вождению';
        selectContainer.querySelector('.custom-select__native').value = 'Инструктор по вождению';
        addInstructorOverlay.classList.add('active');
    });

    // === ЗАГРУЗКА ФОТОГРАФИИ ===
    (function() {
        const uploadBtn = document.getElementById('upload-photo-btn');
        if (!uploadBtn) return;

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.jpg,.jpeg,.png,.webp,.svg';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);

        uploadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            fileInput.value = '';
            fileInput.click();
        });

        fileInput.addEventListener('change', async function() {
            if (!this.files.length) return;
            const file = this.files[0];
            const formData = new FormData();
            formData.append('photo', file);

            const token = localStorage.getItem('token');
            const originalText = uploadBtn.textContent;
            uploadBtn.textContent = 'Загрузка...';
            uploadBtn.disabled = true;

            try {
                const response = await fetch('http://localhost:3001/api/upload/photo', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    throw new Error(errData.message || 'Ошибка загрузки');
                }
                const data = await response.json();
                uploadBtn.dataset.photoFilename = data.filename;
                uploadBtn.dataset.photoLoaded = 'true';
                uploadBtn.textContent = 'Файл выбран';
            } catch (err) {
                console.error(err);
                alert('Не удалось загрузить фото: ' + err.message);
            } finally {
                uploadBtn.disabled = false;
            }
        });
    })();

    document.getElementById('close-add-instructor').addEventListener('click', () => {
        addInstructorOverlay.classList.remove('active');
    });

    // === СОХРАНЕНИЕ ИНСТРУКТОРА ===
    document.getElementById('save-new-instructor').addEventListener('click', async (e) => {
        e.preventDefault();
        document.querySelectorAll('#add-instructor-overlay .add-course-input.error')
            .forEach(el => el.classList.remove('error'));
        document.querySelectorAll('#add-instructor-overlay .field-error-text')
            .forEach(el => el.remove());

        const nameInput = document.getElementById('new-instructor-name');
        const expInput = document.getElementById('new-instructor-experience');
        const carInput = document.getElementById('new-instructor-car');
        const eduInput = document.getElementById('new-instructor-education');
        const categorySelect = document.getElementById('instructor-category-select');
        const category = categorySelect.querySelector('.custom-select__selected').textContent;
        const ratingInput = document.getElementById('new-instructor-rating');

        const name = nameInput.value.trim();
        const experience = expInput.value.trim();
        const car = carInput.value.trim();
        const education = eduInput.value.trim();
        const rating = ratingInput.value.trim() === '–' ? 0 : (parseFloat(ratingInput.value) || 0);
        const photo = document.getElementById('upload-photo-btn').dataset.photoFilename || null;

        let isValid = true;

        function setError(input, message = 'Заполните поле') {
            input.classList.add('error');
            const wrapper = input.closest('.input-wrapper') || input.parentNode;
            const oldErr = wrapper.querySelector('.field-error-text');
            if (oldErr) oldErr.remove();
            const err = document.createElement('span');
            err.className = 'field-error-text';
            err.textContent = message;
            wrapper.appendChild(err);
        }

        if (!name) { setError(nameInput); isValid = false; }
        if (!experience) { setError(expInput); isValid = false; }
        if (category === 'Инструктор по вождению' && !car) { setError(carInput); isValid = false; }
        if (category === 'Преподаватель по теории' && !education) { setError(eduInput); isValid = false; }

        if (!isValid) return;

        const token = localStorage.getItem('token');
        const data = { name, experience, car, education, rating, category, photo };

        try {
            let response;
            if (editingInstructorId) {
                response = await fetch(`http://localhost:3001/api/instructors/${editingInstructorId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(data)
                });
            } else {
                response = await fetch('http://localhost:3001/api/instructors', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(data)
                });
            }
            if (!response.ok) throw new Error('Ошибка сохранения');
            addInstructorOverlay.classList.remove('active');
            loadInstructors();
            showCourseSuccess('Инструктор добавлен');
        } catch (err) {
            console.error(err);
            alert('Не удалось сохранить инструктора');
        }
    });
    document.getElementById('save-instructors-btn').addEventListener('click', () => {
        instructorEditOverlay.classList.remove('active');
        showCourseSuccess('Изменения сохранены');
    });

    // =================== ОВЕРЛЕЙ ВЫХОДА И УДАЛЕНИЯ ===================
    const logoutOverlay = document.getElementById('logout-overlay');
    document.getElementById('logout-btn').addEventListener('click', () => logoutOverlay.classList.add('active'));
    document.getElementById('cancel-logout').addEventListener('click', () => logoutOverlay.classList.remove('active'));
    document.getElementById('confirm-logout').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '../pages/login.html';
    });

    const deleteAccountOverlay = document.getElementById('delete-account-overlay');
    document.getElementById('delete-account-btn').addEventListener('click', () => deleteAccountOverlay.classList.add('active'));
    document.getElementById('cancel-delete-account').addEventListener('click', () => deleteAccountOverlay.classList.remove('active'));
    document.getElementById('confirm-delete-account').addEventListener('click', () => {
        alert('Аккаунт удалён');
        deleteAccountOverlay.classList.remove('active');
    });

    // =================== ИНИЦИАЛИЗАЦИЯ ===================
    loadApplications();
    loadReviews();

    function escapeHtml(str) {
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }
});