(function() {
    const basePath = '/';
    const pagesPath = basePath;          
    const jsPath = basePath + 'js/';
    const imagesPath = basePath + 'images/';

    Promise.all([
        fetch(pagesPath + 'forma.html').then(res => res.text()),
        fetch(pagesPath + 'success.html').then(res => res.text())
    ])
    .then(([formHTML, successHTML]) => {
        // Вставляем HTML оверлеев в конец body
        document.body.insertAdjacentHTML('beforeend', formHTML);
        document.body.insertAdjacentHTML('beforeend', successHTML);

        // Исправляем пути к картинкам внутри оверлеев
        document.querySelectorAll('#form-overlay img, #success-overlay img').forEach(img => {
            const src = img.getAttribute('src');
            if (src && !src.startsWith('http') && !src.startsWith('/')) {
                // Берём только имя файла и подставляем абсолютный путь
                const fileName = src.replace(/^.*[\\\/]/, '');
                img.setAttribute('src', imagesPath + fileName);
            }
        });

        // Загружаем скрипт логики формы
        var script = document.createElement('script');
        script.src = jsPath + 'forma.js';
        document.body.appendChild(script);
    })
    .catch(err => console.error('Ошибка загрузки оверлеев:', err));
})();
