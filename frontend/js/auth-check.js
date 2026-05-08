(function() {
    function updateAuthButton() {
        const token = localStorage.getItem('token');
        const userData = JSON.parse(localStorage.getItem('user') || '{}');

        const authBtn = document.querySelector('.auth-btn');
        if (!authBtn) return;

        if (token) {
            const targetPage = userData.role === 'admin' ? '../pages/admin.html' : '../pages/account.html';
            authBtn.innerHTML = `
                <span class="btn--account__text">Личный кабинет</span>
                <img src="../images/user.svg" alt="Иконка пользователя" class="btn--account__icon">
            `;
            authBtn.href = targetPage;
            authBtn.className = 'auth-btn btn--account';
        } else {
            authBtn.innerHTML = 'Войти';
            authBtn.href = '../pages/login.html';
            authBtn.className = 'auth-btn btn btn--login';
        }

        // Показываем кнопку (она была скрыта через CSS)
        authBtn.style.visibility = 'visible';

        // Обновляем имя в боковой панели, если мы в кабинете
        const sidebarName = document.querySelector('.sidebar-name');
        if (sidebarName && token && userData.name) {
            sidebarName.textContent = userData.name;
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateAuthButton);
    } else {
        updateAuthButton();
    }
})();