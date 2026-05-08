(function() {
    function initLoginValidation() {
        const loginBox = document.querySelector('.login-box');
        if (!loginBox) return;

        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');

        // Переключение видимости пароля
        document.querySelectorAll('.password-toggle-icon').forEach(icon => {
            icon.addEventListener('click', function() {
                const wrapper = this.closest('.input-wrapper');
                if (!wrapper) return;
                const input = wrapper.querySelector('input');
                if (!input) return;

                if (input.type === 'password') {
                    input.type = 'text';
                    this.src = '../images/visible.svg';
                    this.alt = 'Скрыть пароль';
                } else {
                    input.type = 'password';
                    this.src = '../images/hidden.svg';
                    this.alt = 'Показать пароль';
                }
            });
        });
        
        const submitBtn = document.getElementById('login-submit-btn');

        // Оборачиваем инпуты во врапперы для позиционирования ошибки
        function wrapInWrapper(input) {
            if (!input.parentNode.classList.contains('input-wrapper')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'input-wrapper';
                input.parentNode.insertBefore(wrapper, input);
                wrapper.appendChild(input);
                return wrapper;
            }
            return input.parentNode;
        }

        const emailWrapper = wrapInWrapper(emailInput);
        const passwordWrapper = wrapInWrapper(passwordInput);

        // Очистка ошибок
        function clearErrors() {
            document.querySelectorAll('.login-box__input.error')
                .forEach(el => el.classList.remove('error'));
            document.querySelectorAll('.login-box .field-error-text')
                .forEach(el => el.remove());
        }

        // Универсальная функция показа ошибки
        function showError(wrapper, input, message = 'Заполните поле') {
            input.classList.add('error');
            // Удаляем предыдущее сообщение
            const oldErr = wrapper.querySelector('.field-error-text');
            if (oldErr) oldErr.remove();
            const err = document.createElement('span');
            err.className = 'field-error-text';
            err.textContent = message;
            wrapper.appendChild(err);
        }

        // Обработчик клика по кнопке
        submitBtn.addEventListener('click', (e) => {
            e.preventDefault();  // предотвращаем отправку формы (если бы была)
            clearErrors();
            let isValid = true;

            // Проверка email
            const email = emailInput.value.trim();
            if (!email) {
                showError(emailWrapper, emailInput, 'Заполните поле');
                isValid = false;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showError(emailWrapper, emailInput, 'Неверный формат');
                isValid = false;
            }

            // Проверка пароля
            const password = passwordInput.value.trim();
            if (!password) {
                showError(passwordWrapper, passwordInput, 'Заполните поле');
                isValid = false;
            } else if (password.length < 8) {
                showError(passwordWrapper, passwordInput, 'Минимум 8 символов');
                isValid = false;
            }

            if (!isValid) return;

            // Все проверки пройдены – отправляем запрос на сервер
            const loginData = { email, password };

            fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
            })
            .then(response => response.json())
            .then(data => {
            if (data.token) {
                // Сохраняем токен и данные пользователя
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Перенаправляем в личный кабинет (или админку, в зависимости от роли)
                if (data.user.role === 'admin') {
                window.location.href = '../pages/admin.html';
                } else {
                window.location.href = '../pages/account.html';
                }
            } else {
                // Ошибка от сервера: неверный email или пароль
                clearErrors();
                showError(emailWrapper, emailInput, 'Неверный email или пароль');
                showError(passwordWrapper, passwordInput, 'Неверный email или пароль');
                }
            })
            .catch(err => {
            console.error(err);
            alert('Ошибка соединения с сервером');
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLoginValidation);
    } else {
        initLoginValidation();
    }
})();