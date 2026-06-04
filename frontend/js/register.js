(function() {
    function initRegisterValidation() {
        const registerBox = document.querySelector('.register-box');
        if (!registerBox) return;

        const nameInput = document.getElementById('reg-name');
        const surnameInput = document.getElementById('reg-surname');
        const emailInput = document.getElementById('reg-email');
        const phoneInput = document.getElementById('reg-phone');
        const passwordInput = document.getElementById('reg-password');
        const passwordRepeatInput = document.getElementById('reg-password-repeat');
        const consentCheckbox = document.getElementById('reg-consent');
        const consentWrapper = document.querySelector('.register-consent');
        const submitBtn = document.getElementById('register-submit');
        const overlay = document.getElementById('register-overlay');

        // Переключение видимости пароля 
        document.querySelectorAll('.password-toggle-icon').forEach(icon => {
            icon.addEventListener('click', function() {
                const wrapper = this.closest('.input-wrapper');
                if (!wrapper) return;
                const input = wrapper.querySelector('input');
                if (!input) return;

                if (input.type === 'password') {
                    input.type = 'text';
                    this.src = '/images/visible.svg';
                    this.alt = 'Скрыть пароль';
                } else {
                    input.type = 'password';
                    this.src = '/images/hidden.svg';
                    this.alt = 'Показать пароль';
                }
            });
        });

        // Функция оборачивания инпута
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

        const wrappers = {
            name: wrapInWrapper(nameInput),
            surname: wrapInWrapper(surnameInput),
            email: wrapInWrapper(emailInput),
            phone: wrapInWrapper(phoneInput),
            password: wrapInWrapper(passwordInput),
            passwordRepeat: wrapInWrapper(passwordRepeatInput)
        };

        // Очистка ошибок
        function clearErrors() {
            document.querySelectorAll('.register-field__input.error')
                .forEach(el => el.classList.remove('error'));
            document.querySelectorAll('.register-field .field-error-text')
                .forEach(el => el.remove());
            // Чекбокс
            const consentErr = consentWrapper.querySelector('.consent-error-text');
            if (consentErr) consentErr.remove();
            consentWrapper.classList.remove('error-text');
        }

        // Функция показа ошибки для поля
        function showFieldError(wrapper, input, message) {
            input.classList.add('error');
            const oldErr = wrapper.querySelector('.field-error-text');
            if (oldErr) oldErr.remove();
            const err = document.createElement('span');
            err.className = 'field-error-text';
            err.textContent = message;
            wrapper.appendChild(err);
        }

        // Очистка ошибки конкретного поля
        function clearFieldError(input, wrapper) {
            input.classList.remove('error');
            const err = wrapper.querySelector('.field-error-text');
            if (err) err.remove();
        }

        // Обработчики ввода 
        function attachInputListeners() {
            for (let [key, input] of Object.entries({
                name: nameInput,
                surname: surnameInput,
                email: emailInput,
                phone: phoneInput,
                password: passwordInput,
                passwordRepeat: passwordRepeatInput
            })) {
                input.addEventListener('input', () => {
                    clearFieldError(input, wrappers[key]);
                });
            }
            consentCheckbox.addEventListener('change', () => {
                const err = consentWrapper.querySelector('.consent-error-text');
                if (err) err.remove();
                consentWrapper.classList.remove('error-text');
            });
        }
        attachInputListeners();

        // Обработка отправки
        submitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            clearErrors();
            let isValid = true;

            // Имя
            if (!nameInput.value.trim()) {
                showFieldError(wrappers.name, nameInput, 'Заполните поле');
                isValid = false;
            }

            // Фамилия
            if (!surnameInput.value.trim()) {
                showFieldError(wrappers.surname, surnameInput, 'Заполните поле');
                isValid = false;
            }

            // Email
            const email = emailInput.value.trim();
            if (!email) {
                showFieldError(wrappers.email, emailInput, 'Заполните поле');
                isValid = false;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showFieldError(wrappers.email, emailInput, 'Неверный формат');
                isValid = false;
            }

            // Телефон
            const phone = phoneInput.value.trim();
            if (!phone) {
                showFieldError(wrappers.phone, phoneInput, 'Заполните поле');
                isValid = false;
            } else {
                const digits = phone.replace(/\D/g, '');
                if (digits.length < 10) {
                    showFieldError(wrappers.phone, phoneInput, 'Минимум 10 цифр');
                    isValid = false;
                }
            }

            // Пароль
            const password = passwordInput.value.trim();
            if (!password) {
                showFieldError(wrappers.password, passwordInput, 'Заполните поле');
                isValid = false;
            } else if (password.length < 8) {
                showFieldError(wrappers.password, passwordInput, 'Минимум 8 символов');
                isValid = false;
            }

            // Повтор пароля
            const passwordRepeat = passwordRepeatInput.value.trim();
            if (!passwordRepeat) {
                showFieldError(wrappers.passwordRepeat, passwordRepeatInput, 'Заполните поле');
                isValid = false;
            } else if (passwordRepeat !== password) {
                showFieldError(wrappers.passwordRepeat, passwordRepeatInput, 'Пароли не совпадают');
                isValid = false;
            }

            // Чекбокс согласия
            if (!consentCheckbox.checked) {
                let consentErr = consentWrapper.querySelector('.consent-error-text');
                if (!consentErr) {
                    consentErr = document.createElement('span');
                    consentErr.className = 'consent-error-text';
                    consentErr.textContent = 'Необходимо согласие';
                    consentWrapper.appendChild(consentErr);
                }
                consentWrapper.classList.add('error-text');
                isValid = false;
            }

            if (!isValid) return;

            // Отправка данных на сервер 
            const name = nameInput.value.trim();
            const surname = surnameInput.value.trim();

            fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name,
                    surname: surname,
                    email: email,
                    phone: phone,
                    password: password
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.token) {
                    // Сохраняем токен и данные пользователя (автоматический вход после регистрации)
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));

                    // Показываем оверлей успеха
                    overlay.classList.add('active');
                    // Через 2 секунды перенаправляем в личный кабинет
                    setTimeout(() => {
                        overlay.classList.remove('active');
                        window.location.href = '/account.html';
                    }, 2000);
                } else {
                    // Ошибка от сервера 
                    clearErrors();
                    showFieldError(wrappers.email, emailInput, data.message || 'Ошибка регистрации');
                }
            })
            .catch(err => {
                console.error(err);
                clearErrors();
                showFieldError(wrappers.email, emailInput, 'Ошибка соединения с сервером');
            });
        });

        // Закрытие оверлея при клике вне белого блока
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                overlay.classList.remove('active');
                window.location.href = '/login.html';
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRegisterValidation);
    } else {
        initRegisterValidation();
    }
})();