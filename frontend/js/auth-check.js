(function() {
    function updateAuthButton() {
        const token = localStorage.getItem('token');
        const userData = JSON.parse(localStorage.getItem('user') || '{}');

        // Десктопная кнопка (всегда с классом desktop-only)
        const authBtn = document.querySelector('.auth-btn');
        if (authBtn) {
            if (token) {
                const targetPage = userData.role === 'admin' ? '../pages/admin.html' : '../pages/account.html';
                authBtn.innerHTML = `
                    <span class="btn--account__text">Личный кабинет</span>
                    <img src="../images/user.svg" alt="Иконка пользователя" class="btn--account__icon">
                `;
                authBtn.href = targetPage;
                authBtn.className = 'auth-btn btn--account desktop-only';
            } else {
                authBtn.innerHTML = 'Войти';
                authBtn.href = '../pages/login.html';
                authBtn.className = 'auth-btn btn btn--login desktop-only';
            }
            authBtn.style.visibility = 'visible';
        }

        // Мобильная кнопка (в бургер-меню)
        const mobileAuthBtn = document.getElementById('mobile-auth-btn');
        if (mobileAuthBtn) {
            if (token) {
                const targetPage = userData.role === 'admin' ? '../pages/admin.html' : '../pages/account.html';
                mobileAuthBtn.innerHTML = `
                    <span>Личный кабинет</span>
                    <img src="../images/user.svg" alt="Иконка" class="mobile-menu__account-icon">
                `;
                mobileAuthBtn.href = targetPage;
                mobileAuthBtn.classList.remove('mobile-menu__link--login');
                mobileAuthBtn.classList.add('mobile-menu__link--account');
            } else {
                mobileAuthBtn.textContent = 'Войти';
                mobileAuthBtn.href = '../pages/login.html';
                mobileAuthBtn.classList.remove('mobile-menu__link--account');
                mobileAuthBtn.classList.add('mobile-menu__link--login');
            }
        }

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