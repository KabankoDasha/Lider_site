(function() {
    function initForm() {
        const openButtons = document.querySelectorAll('.btn--cta, #open-form-btn, .course-card__btn');
        const overlay = document.getElementById('form-overlay');
        const closeBtn = document.getElementById('close-form-btn');
        const successOverlay = document.getElementById('success-overlay');

        if (!overlay || !successOverlay) return;

        // --- Динамически создаём элемент для ошибки чекбоксов, если его нет ---
        const checkboxContainer = document.querySelector('.form-checkboxes');
        let checkboxErrorEl = checkboxContainer.querySelector('.checkbox-error-text');
        if (!checkboxErrorEl && checkboxContainer) {
            checkboxErrorEl = document.createElement('span');
            checkboxErrorEl.className = 'checkbox-error-text';
            checkboxErrorEl.textContent = 'Необходимо согласие';
            checkboxContainer.appendChild(checkboxErrorEl);  // теперь внутрь контейнера
        }

        // --- Оборачиваем поля, чтобы позиционировать текст ошибки внутри ---
        const nameInput = document.getElementById('form-name');
        const phoneInput = document.getElementById('form-phone');
        const customSelect = document.querySelector('.custom-select');

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
            if (course) {
                setSelectValue(course);
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
        if (closeBtn) {
            closeBtn.addEventListener('click', () => overlay.classList.remove('active'));
        }
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

                // Чекбоксы – общая проверка
                const checkboxes = document.querySelectorAll('.form-check__input');
                let allChecked = true;
                checkboxes.forEach(cb => {
                    if (!cb.checked) allChecked = false;
                });
                if (!allChecked) {
                    if (checkboxErrorEl) checkboxErrorEl.style.display = 'block';
                    isValid = false;
                }

                if (!isValid) return;

                // === ДОБАВЛЕНИЕ ЗАЯВКИ В ЛИЧНЫЙ КАБИНЕТ ===
                const applicationsContainer = document.getElementById('applications-container');
                if (applicationsContainer) {
                    const course = document.getElementById('course-select').value || 'Курс не выбран';
                    const name = nameInput.value.trim() || 'Без имени';
                    const phone = phoneInput.value.trim() || 'Без телефона';
                    const comment = document.querySelector('.form-textarea').value.trim() || 'Без комментариев';

                    const today = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
                    const card = document.createElement('article');
                    card.className = 'application-card';
                    card.innerHTML = `
                        <div class="application-header">
                            <h4 class="application-number">Заявка №${Date.now().toString().slice(-4)}</h4>
                            <span class="application-status">в обработке</span>
                        </div>
                        <p class="application-course">${course}</p>
                        <p class="application-message">${comment}</p>
                        <time class="application-date">от ${today}</time>
                        <button class="application-delete-btn delete-item-btn" data-type="application">
                            <img src="../images/krest.svg" alt="Удалить заявку" style="width:15px;height:15px;">
                        </button>
                    `;
                    applicationsContainer.appendChild(card);
                }

                // Закрываем форму и показываем success
                overlay.classList.remove('active');
                successOverlay.classList.add('active');

                // Очищаем поля (опционально)
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

                // Снимаем галочки с чекбоксов
                document.querySelectorAll('.form-check__input').forEach(cb => cb.checked = false);
                if (checkboxErrorEl) checkboxErrorEl.style.display = 'none';

                // Диспатчим событие (если нужно для других целей)
                document.dispatchEvent(new CustomEvent('applicationSubmited', {
                    detail: { course, name, phone, comment }
                }));
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