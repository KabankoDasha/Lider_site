document.addEventListener('DOMContentLoaded', () => {
    // --- Удаление заявки ---
    const deleteAppBtn = document.getElementById('delete-app-btn');
    const deleteOverlay = document.getElementById('delete-overlay');
    const cancelDeleteBtn = document.getElementById('cancel-delete');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    const successDeleteOverlay = document.getElementById('success-delete-overlay');

    if (deleteAppBtn && deleteOverlay) {
        deleteAppBtn.addEventListener('click', () => deleteOverlay.classList.add('active'));
    }
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', () => deleteOverlay.classList.remove('active'));
    }
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', () => {
            deleteOverlay.classList.remove('active');
            if (successDeleteOverlay) successDeleteOverlay.classList.add('active');
            const card = document.querySelector('.application-card');
            if (card) card.style.display = 'none';
        });
    }
    if (successDeleteOverlay) {
        successDeleteOverlay.addEventListener('click', (e) => {
            if (e.target === successDeleteOverlay) successDeleteOverlay.classList.remove('active');
        });
    }
    if (deleteOverlay) {
        deleteOverlay.addEventListener('click', (e) => {
            if (e.target === deleteOverlay) deleteOverlay.classList.remove('active');
        });
    }

    // --- Выход из ЛК ---
    const logoutBtn = document.getElementById('logout-btn');
    const logoutOverlay = document.getElementById('logout-overlay');
    const cancelLogoutBtn = document.getElementById('cancel-logout');
    const confirmLogoutBtn = document.getElementById('confirm-logout');

    if (logoutBtn && logoutOverlay) {
        logoutBtn.addEventListener('click', () => logoutOverlay.classList.add('active'));
    }
    if (cancelLogoutBtn) {
        cancelLogoutBtn.addEventListener('click', () => logoutOverlay.classList.remove('active'));
    }
    if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener('click', () => {
            // Закрываем оверлей и переходим на страницу входа
            logoutOverlay.classList.remove('active');
            window.location.href = '../pages/login.html';
        });
    }
    if (logoutOverlay) {
        logoutOverlay.addEventListener('click', (e) => {
            if (e.target === logoutOverlay) logoutOverlay.classList.remove('active');
        });
    }

    // --- Удаление аккаунта ---
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    const deleteAccountOverlay = document.getElementById('delete-account-overlay');
    const cancelDeleteAccountBtn = document.getElementById('cancel-delete-account');
    const confirmDeleteAccountBtn = document.getElementById('confirm-delete-account');

    if (deleteAccountBtn && deleteAccountOverlay) {
        deleteAccountBtn.addEventListener('click', () => deleteAccountOverlay.classList.add('active'));
    }
    if (cancelDeleteAccountBtn) {
        cancelDeleteAccountBtn.addEventListener('click', () => deleteAccountOverlay.classList.remove('active'));
    }
    if (confirmDeleteAccountBtn) {
        confirmDeleteAccountBtn.addEventListener('click', () => {
            // Здесь можно выполнить удаление, показать успех и редирект
            deleteAccountOverlay.classList.remove('active');
            // Покажем успешное удаление (можно перенаправить на главную)
            if (successDeleteOverlay) {
                // Заменим текст на "Учётная запись удалена!"
                const box = successDeleteOverlay.querySelector('.success-overlay__text');
                if (box) box.innerHTML = 'Учётная запись успешно удалена!';
                successDeleteOverlay.classList.add('active');
            }
        });
    }
    if (deleteAccountOverlay) {
        deleteAccountOverlay.addEventListener('click', (e) => {
            if (e.target === deleteAccountOverlay) deleteAccountOverlay.classList.remove('active');
        });
    }

    // --- Открытие формы записи ---
    const openFormButtons = document.querySelectorAll('.open-form-trigger, #open-form-btn');
    // функция инициализируется в load-form.js, но мы можем добавить ещё один обработчик для иконки
    // так как load-form.js уже добавляет обработчики на .btn--cta и .open-form-btn,
    // нам просто нужно, чтобы у иконки был класс open-form-btn или id open-form-btn
    // добавим класс open-form-trigger в кнопку
    // (уже есть в HTML: class="content-add-btn open-form-trigger")
    // load-form.js ищет .btn--cta, .open-form-btn, поэтому добавим класс open-form-btn
    const addBtn = document.getElementById('open-create-application');
    if (addBtn) {
        addBtn.classList.add('open-form-btn');
    }
});