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

    // Переключение вкладок "Активные / Обработанные"
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const target = this.dataset.tab;
            const cards = document.querySelectorAll('#applications-container .application-card');
            cards.forEach(card => {
                if (target === 'active') {
                    card.style.display = card.classList.contains('new') ? 'block' : 'none';
                } else {
                    card.style.display = card.classList.contains('new') ? 'none' : 'block';
                }
            });
        });
    });

    // Оверлей деталей заявки (изменение статуса)
    const appOverlay = document.getElementById('application-detail-overlay');
    const statusSelect = document.getElementById('status-select');
    let currentApplicationId = null;

    document.querySelectorAll('#applications-container .application-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Не открываем, если клик по кнопке или индикатору
            if (e.target.closest('button') || e.target.closest('.new-indicator')) return;
            currentApplicationId = card.dataset.id;
            statusSelect.value = card.dataset.status;
            appOverlay.classList.add('active');
        });
    });

    document.getElementById('cancel-application').addEventListener('click', () => {
        appOverlay.classList.remove('active');
    });

    document.getElementById('save-application').addEventListener('click', () => {
        if (currentApplicationId) {
            const card = document.querySelector(`.application-card[data-id="${currentApplicationId}"]`);
            if (card) {
                card.dataset.status = statusSelect.value;
                const statusText = card.querySelector('.application-status');
                const statusMap = {
                    new: 'Новая',
                    processing: 'В обработке',
                    confirmed: 'Подтверждена',
                    rejected: 'Отклонена'
                };
                statusText.textContent = statusMap[statusSelect.value] || 'Новая';
                // Если статус не «новая», убираем индикатор
                if (statusSelect.value !== 'new') {
                    card.classList.remove('new');
                    const indicator = card.querySelector('.new-indicator');
                    if (indicator) indicator.remove();
                } else {
                    card.classList.add('new');
                }
            }
        }
        appOverlay.classList.remove('active');
    });

    // Оверлей деталей отзыва
    const reviewOverlay = document.getElementById('review-detail-overlay');
    const reviewDetailContent = document.getElementById('review-detail-content');
    let currentReviewCard = null;

    document.querySelectorAll('#reviews-container .review-card').forEach(card => {
        card.addEventListener('click', () => {
            currentReviewCard = card;
            const name = card.querySelector('.review-card__name').textContent;
            const course = card.querySelector('.review-card__course').textContent;
            const stars = card.querySelector('.review-card__stars').innerHTML;
            const text = card.querySelector('.review-card__text').textContent;
            reviewDetailContent.innerHTML = `
                <h4 class="review-card__name">${name}</h4>
                <p class="review-card__course">${course}</p>
                <div class="review-card__stars">${stars}</div>
                <p class="review-card__text">${text}</p>
            `;
            reviewOverlay.classList.add('active');
        });
    });

    document.getElementById('cancel-review').addEventListener('click', () => {
        reviewOverlay.classList.remove('active');
    });

    document.getElementById('approve-review').addEventListener('click', () => {
        reviewOverlay.classList.remove('active');
        alert('Отзыв добавлен на сайт!');
        // Здесь будет AJAX-запрос для публикации
        if (currentReviewCard) currentReviewCard.remove();
    });

    document.getElementById('delete-review').addEventListener('click', () => {
        reviewOverlay.classList.remove('active');
        alert('Отзыв удалён.');
        if (currentReviewCard) currentReviewCard.remove();
    });

    // Оверлей редактирования контента (заглушка)
    const contentEditOverlay = document.getElementById('content-edit-overlay');
    document.querySelectorAll('.btn--edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.dataset.page;
            document.getElementById('content-edit-area').innerHTML = `
                <p>Редактирование раздела: <strong>${page}</strong></p>
                <textarea style="width:100%;height:150px;margin-top:20px;">Пример данных для страницы ${page}</textarea>
            `;
            contentEditOverlay.classList.add('active');
        });
    });

    document.getElementById('cancel-content').addEventListener('click', () => {
        contentEditOverlay.classList.remove('active');
    });
    document.getElementById('save-content').addEventListener('click', () => {
        contentEditOverlay.classList.remove('active');
        alert('Изменения сохранены!');
    });

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