(function() {
    function initForm() {
        const openButtons = document.querySelectorAll('.btn--cta, #open-form-btn, .course-card__btn');
        const overlay = document.getElementById('form-overlay');
        const closeBtn = document.getElementById('close-form-btn');
        const successOverlay = document.getElementById('success-overlay');

        if (!overlay || !successOverlay) return;

        // --- Элемент для инлайн-ошибок (серверные и сетевые) ---
        let formErrorEl = overlay.querySelector('.form-error');
        if (!formErrorEl) {
            formErrorEl = document.createElement('div');
            formErrorEl.className = 'form-error';
            // Вставляем перед кнопкой отправки
            const submitBtnContainer = overlay.querySelector('#form-submit-btn').parentNode;
            submitBtnContainer.insertBefore(formErrorEl, overlay.querySelector('#form-submit-btn'));
        }

        // --- Динамически создаём элемент для ошибки чекбоксов ---
        const checkboxContainer = overlay.querySelector('.form-checkboxes');
        let checkboxErrorEl = checkboxContainer.querySelector('.checkbox-error-text');
        if (!checkboxErrorEl && checkboxContainer) {
            checkboxErrorEl = document.createElement('span');
            checkboxErrorEl.className = 'checkbox-error-text';
            checkboxErrorEl.textContent = 'Необходимо согласие';
            checkboxContainer.appendChild(checkboxErrorEl);
        }

        // --- Оборачиваем поля для позиционирования ошибки ---
        const nameInput = document.getElementById('form-name');
        const phoneInput = document.getElementById('form-phone');
        const customSelect = overlay.querySelector('.custom-select');

        function wrapInWrapper(el) {
            if (!el) return null;
            if (el.parentNode.classList.contains('input-wrapper')) return el.parentNode;
            const wrapper = document.createElement('div');
            wrapper.className = 'input-wrapper';
            el.parentNode.insertBefore(wrapper, el);
            wrapper.appendChild(el);
            return wrapper;
        }

        const nameWrapper = wrapInWrapper(nameInput);
        const phoneWrapper = wrapInWrapper(phoneInput);
        let selectWrapper = null;
        if (customSelect) {
            selectWrapper = wrapInWrapper(customSelect);
        }

        // --- Открытие формы и предустановка курса ---
        function openForm(e) {
            e.preventDefault();
            overlay.classList.add('active');
            successOverlay.classList.remove('active');
            clearErrors();
            const btn = e.currentTarget;
            const course = btn.dataset.course;
            if (course) setSelectValue(course);

            // Автозаполнение, если пользователь авторизован
            const token = localStorage.getItem('token');
            if (token) {
                const userData = JSON.parse(localStorage.getItem('user') || '{}');
                if (userData.name) {
                    nameInput.value = userData.name;
                }
                if (userData.phone) phoneInput.value = userData.phone;
            }
        }

        function setSelectValue(value) {
            const select = document.getElementById('course-select');
            const selectedSpan = customSelect.querySelector('.custom-select__selected');
            const options = customSelect.querySelectorAll('.custom-select__options li');
            for (let option of options) {
                if (option.dataset.value === value) {
                    select.value = value;
                    selectedSpan.textContent = value;
                    selectedSpan.classList.remove('placeholder');
                    customSelect.classList.remove('open');
                    return;
                }
            }
        }

        openButtons.forEach(btn => btn.addEventListener('click', openForm));

        // --- Закрытие формы ---
        if (closeBtn) closeBtn.addEventListener('click', () => overlay.classList.remove('active'));
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.remove('active');
        });

        // --- Кастомный селект ---
        if (customSelect) {
            const trigger = customSelect.querySelector('.custom-select__trigger');
            const selected = trigger.querySelector('.custom-select__selected');
            const optionsList = customSelect.querySelector('.custom-select__options');
            const optionsItems = optionsList.querySelectorAll('li');
            const nativeSelect = document.getElementById('course-select');

            trigger.addEventListener('click', () => customSelect.classList.toggle('open'));

            optionsItems.forEach(item => {
                item.addEventListener('click', () => {
                    const value = item.dataset.value;
                    selected.textContent = value;
                    selected.classList.remove('placeholder');
                    nativeSelect.value = value;
                    customSelect.classList.remove('open');
                });
            });

            document.addEventListener('click', (e) => {
                if (!customSelect.contains(e.target)) customSelect.classList.remove('open');
            });
        }

        // --- Очистка всех ошибок ---
        function clearErrors() {
            document.querySelectorAll('.form-field__input.error, .custom-select__trigger.error')
                .forEach(el => el.classList.remove('error'));
            document.querySelectorAll('.field-error-text').forEach(el => el.remove());
            if (checkboxErrorEl) checkboxErrorEl.style.display = 'none';
            if (formErrorEl) formErrorEl.textContent = '';
        }

        // --- Показать ошибку под полем ---
        function showError(wrapper, inputOrTrigger) {
            inputOrTrigger.classList.add('error');
            const oldErr = wrapper.querySelector('.field-error-text');
            if (oldErr) oldErr.remove();
            const err = document.createElement('span');
            err.className = 'field-error-text';
            err.textContent = 'Заполните поле';
            wrapper.appendChild(err);
        }

        // --- Показать общую ошибку (сервер/сеть) ---
        function showFormError(message) {
            if (formErrorEl) {
                formErrorEl.textContent = message;
            }
        }

        // --- Отправка формы ---
        const submitBtn = document.getElementById('form-submit-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                clearErrors();

                let isValid = true;

                // Имя
                if (!nameInput.value.trim()) {
                    if (nameWrapper) showError(nameWrapper, nameInput);
                    isValid = false;
                }

                // Телефон
                if (!phoneInput.value.trim()) {
                    if (phoneWrapper) showError(phoneWrapper, phoneInput);
                    isValid = false;
                }

                // Выбор курса
                const selectedSpan = customSelect.querySelector('.custom-select__selected');
                if (selectedSpan.classList.contains('placeholder') || !document.getElementById('course-select').value) {
                    const trigger = customSelect.querySelector('.custom-select__trigger');
                    if (selectWrapper) showError(selectWrapper, trigger);
                    isValid = false;
                }

                // Чекбоксы
                const checkboxes = document.querySelectorAll('.form-check__input');
                let allChecked = true;
                checkboxes.forEach(cb => { if (!cb.checked) allChecked = false; });
                if (!allChecked) {
                    if (checkboxErrorEl) checkboxErrorEl.style.display = 'block';
                    isValid = false;
                }

                if (!isValid) return;

                // --- Отправка данных на сервер ---
                const name = nameInput.value.trim();
                const phone = phoneInput.value.trim();
                const course = document.getElementById('course-select').value || 'Курс не выбран';
                const comment = document.querySelector('.form-textarea').value.trim();

                // Индикация загрузки
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Отправка...';
                submitBtn.disabled = true;

                // Очищаем предыдущие серверные ошибки
                showFormError('');

                const token = localStorage.getItem('token');
                const headers = { 'Content-Type': 'application/json' };
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                fetch('http://localhost:3001/api/applications', {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({ name, phone, course, comment })
                })
                .then(async (response) => {
                    const data = await response.json();
                    if (!response.ok) {
                        throw new Error(data.message || 'Ошибка сервера');
                    }
                    return data;
                })
                .then((data) => {
                    // Закрываем форму и показываем успех
                    overlay.classList.remove('active');
                    successOverlay.classList.add('active');

                    // Очистка полей
                    nameInput.value = '';
                    phoneInput.value = '';
                    document.querySelector('.form-textarea').value = '';
                    const nativeSelect = document.getElementById('course-select');
                    if (nativeSelect) nativeSelect.value = '';
                    const selected = customSelect.querySelector('.custom-select__selected');
                    if (selected) {
                        selected.textContent = 'Выберите курс обучения';
                        selected.classList.add('placeholder');
                    }
                    document.querySelectorAll('.form-check__input').forEach(cb => cb.checked = false);
                    if (checkboxErrorEl) checkboxErrorEl.style.display = 'none';

                    // Сообщаем личному кабинету, что появилась новая заявка
                    document.dispatchEvent(new CustomEvent('applicationSubmitted'));
                })
                .catch((error) => {
                    // Показываем инлайн-ошибку
                    showFormError(error.message || 'Ошибка соединения с сервером');
                    console.error(error);
                })
                .finally(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                });
            });
        }

        // --- Закрытие оверлея успеха ---
        successOverlay.addEventListener('click', (e) => {
            if (e.target === successOverlay) successOverlay.classList.remove('active');
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initForm);
    } else {
        initForm();
    }
})();