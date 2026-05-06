(function() {
    function initLoginValidation() {
        const loginBox = document.querySelector('.login-box');
        if (!loginBox) return;

        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');
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

            // Все проверки пройдены – переход в кабинет
            window.location.href = '../pages/account.html';  // или admin.html, смотря куда надо
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLoginValidation);
    } else {
        initLoginValidation();
    }
})();