(function() {
    // Функция инициализации формы
    function initForm() {
        const openButtons = document.querySelectorAll('.btn--cta, #open-form-btn');
        const overlay = document.getElementById('form-overlay');
        const closeBtn = document.getElementById('close-form-btn');
        const successOverlay = document.getElementById('success-overlay');

        if (!overlay || !successOverlay) return; // форма ещё не вставлена

        // Открытие формы
        function openForm(e) {
            e.preventDefault();
            overlay.classList.add('active');
            successOverlay.classList.remove('active');
        }

        openButtons.forEach(btn => btn.addEventListener('click', openForm));

        // Закрытие формы
        if (closeBtn) {
            closeBtn.addEventListener('click', () => overlay.classList.remove('active'));
        }
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.remove('active');
        });

        // Кастомный селект
        const customSelect = document.querySelector('.custom-select');
        if (customSelect) {
            const trigger = customSelect.querySelector('.custom-select__trigger');
            const selected = customSelect.querySelector('.custom-select__selected');
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

        // Отправка формы
        const submitBtn = document.getElementById('form-submit-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                overlay.classList.remove('active');
                successOverlay.classList.add('active');
            });
        }

        // Закрытие оверлея успеха
        successOverlay.addEventListener('click', (e) => {
            if (e.target === successOverlay) successOverlay.classList.remove('active');
        });
    }

    // Запускаем инициализацию, когда DOM готов (если скрипт динамический)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initForm);
    } else {
        initForm();
    }
})();