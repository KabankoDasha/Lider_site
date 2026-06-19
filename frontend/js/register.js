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
        
        // Элементы для подтверждения email
        const verificationOverlay = document.getElementById('email-verification-overlay');
        const codeInputs = document.querySelectorAll('.code-input');
        const verificationError = document.getElementById('verification-error');
        const verificationSuccess = document.getElementById('verification-success');
        const resendBtn = document.getElementById('resend-code-btn');
        const resendTimer = document.getElementById('resend-timer');
        
        let registeredUserId = null;
        let resendCooldown = 60; // секунд
        let resendInterval = null;
        let isVerifying = false;

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

        // === ЛОГИКА ЯЧЕЕК КОДА ===
        function initCodeInputs() {
            codeInputs.forEach((input, index) => {
                // Фокус на следующий инпут при вводе цифры
                input.addEventListener('input', function() {
                    this.value = this.value.replace(/\D/g, '').slice(0, 1);
                    if (this.value && index < codeInputs.length - 1) {
                        codeInputs[index + 1].focus();
                    }
                    // Автоматическая проверка при заполнении всех ячеек
                    if (getFullCode().length === 6) {
                        verifyCode();
                    }
                });

                // Обработка Backspace
                input.addEventListener('keydown', function(e) {
                    if (e.key === 'Backspace' && !this.value && index > 0) {
                        codeInputs[index - 1].focus();
                    }
                });

                // Вставка из буфера обмена
                input.addEventListener('paste', function(e) {
                    e.preventDefault();
                    const pasted = (e.clipboardData || window.clipboardData).getData('text');
                    const digits = pasted.replace(/\D/g, '').slice(0, 6);
                    digits.split('').forEach((digit, i) => {
                        if (codeInputs[i]) {
                            codeInputs[i].value = digit;
                        }
                    });
                    const lastIndex = Math.min(digits.length, 6) - 1;
                    if (lastIndex >= 0 && codeInputs[lastIndex]) {
                        codeInputs[lastIndex].focus();
                    }
                    if (digits.length === 6) {
                        verifyCode();
                    }
                });
            });
        }

        function getFullCode() {
            let code = '';
            codeInputs.forEach(input => code += input.value);
            return code;
        }

        function resetCodeInputs() {
            codeInputs.forEach(input => {
                input.value = '';
                input.className = 'code-input';
            });
            codeInputs[0].focus();
        }

        function showVerificationError(message) {
            verificationError.textContent = message;
            verificationError.style.display = 'block';
            verificationSuccess.style.display = 'none';
            codeInputs.forEach(input => {
                input.classList.add('error');
                input.classList.remove('success');
            });
            setTimeout(() => {
                verificationError.style.display = 'none';
            }, 3000);
        }

        function showVerificationSuccess(message) {
            verificationSuccess.textContent = message;
            verificationSuccess.style.display = 'block';
            verificationError.style.display = 'none';
            codeInputs.forEach(input => {
                input.classList.add('success');
                input.classList.remove('error');
            });
        }

        async function verifyCode() {
            if (isVerifying) return;
            const code = getFullCode();
            if (code.length !== 6) return;
            
            isVerifying = true;
            verificationError.style.display = 'none';
            verificationSuccess.style.display = 'none';

            try {
                const response = await fetch('/api/auth/verify-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: registeredUserId, code })
                });
                const data = await response.json();

                if (response.ok) {
                    showVerificationSuccess('Email подтверждён!');
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    setTimeout(() => {
                        window.location.href = data.user.role === 'admin' ? '/admin.html' : '/account.html';
                    }, 1500);
                } else {
                    showVerificationError(data.message || 'Неверный код');
                    resetCodeInputs();
                }
            } catch (err) {
                console.error(err);
                showVerificationError('Ошибка соединения с сервером');
                resetCodeInputs();
            } finally {
                isVerifying = false;
            }
        }

        // === Повторная отправка кода ===
        function startResendTimer() {
            resendCooldown = 60;
            resendBtn.disabled = true;
            resendBtn.style.opacity = '0.5';
            resendTimer.textContent = `(${resendCooldown}с)`;
            
            if (resendInterval) clearInterval(resendInterval);
            resendInterval = setInterval(() => {
                resendCooldown--;
                resendTimer.textContent = `(${resendCooldown}с)`;
                if (resendCooldown <= 0) {
                    clearInterval(resendInterval);
                    resendBtn.disabled = false;
                    resendBtn.style.opacity = '1';
                    resendTimer.textContent = '';
                }
            }, 1000);
        }

        resendBtn.addEventListener('click', async () => {
            if (resendBtn.disabled) return;
            
            try {
                const response = await fetch('/api/auth/resend-code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: registeredUserId })
                });
                const data = await response.json();
                if (response.ok) {
                    verificationSuccess.textContent = 'Новый код отправлен! Проверьте почту.';
                    verificationSuccess.style.display = 'block';
                    verificationError.style.display = 'none';
                    resetCodeInputs();
                    startResendTimer();
                } else {
                    alert(data.message || 'Ошибка при отправке кода');
                }
            } catch (err) {
                console.error(err);
                alert('Ошибка соединения с сервером');
            }
        });

        // === Обработка отправки формы регистрации ===
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
                if (data.success && data.userId) {
                    registeredUserId = data.userId;
                    // Показываем оверлей с ячейками
                    verificationOverlay.classList.add('active');
                    overlay.classList.remove('active'); // скрываем старый оверлей успеха
                    resetCodeInputs();
                    startResendTimer();
                } else {
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

        // Инициализация ячеек
        initCodeInputs();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRegisterValidation);
    } else {
        initRegisterValidation();
    }
})();