// Загрузка оверлея формы и оверлея успеха
Promise.all([
    fetch('../pages/forma.html').then(res => res.text()),
    fetch('../pages/success.html').then(res => res.text())
])
.then(([formHTML, successHTML]) => {
    // Вставляем HTML в конец body
    document.body.insertAdjacentHTML('beforeend', formHTML);
    document.body.insertAdjacentHTML('beforeend', successHTML);

    // Теперь можно подключать скрипт логики
    var script = document.createElement('script');
    script.src = '../js/forma.js';
    document.body.appendChild(script);
})
