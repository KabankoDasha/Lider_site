(function() {
    // Определяем пути относительно текущей страницы
    const pathToPages = window.location.pathname.includes('/course/') ? '../../pages/' : '../pages/';
    const pathToJs = window.location.pathname.includes('/course/') ? '../../js/' : '../js/';
    const pathToImages = window.location.pathname.includes('/course/') ? '../../images/' : '../images/';

    Promise.all([
        fetch(pathToPages + 'forma.html').then(res => res.text()),
        fetch(pathToPages + 'success.html').then(res => res.text())
    ])
    .then(([formHTML, successHTML]) => {
        // Вставляем HTML в конец body
        document.body.insertAdjacentHTML('beforeend', formHTML);
        document.body.insertAdjacentHTML('beforeend', successHTML);

        // Исправляем пути ко всем иконкам внутри оверлеев
        document.querySelectorAll('#form-overlay img, #success-overlay img').forEach(img => {
            const src = img.getAttribute('src');
            if (src && !src.startsWith('http') && !src.startsWith('/')) {
                // Оставляем только имя файла и подставляем правильный путь
                const fileName = src.replace(/^.*[\\\/]/, '');
                img.setAttribute('src', pathToImages + fileName);
            }
        });

        // Подключаем логику формы
        var script = document.createElement('script');
        script.src = pathToJs + 'forma.js';
        document.body.appendChild(script);
    })
    .catch(err => console.error('Ошибка загрузки оверлеев:', err));
})();
