ymaps.ready(init);

function init() {
    // Создаём карту и настраиваем её внешний вид
    var myMap = new ymaps.Map('yandex-map', {
        center: [55.1599, 61.4025],
        zoom: 12,
        controls: ['zoomControl'],
        behaviors: ['drag', 'pinchZoom']  
    }, {
        suppressMapOpenBlock: true,
        yandexMapDisablePoiInteractivity: true
    });

    // Готовим собственную иконку для меток
    var markerImageUrl = '/images/map-marker.svg';

    // Создаём метки для каждого филиала
    var branches = [
        { coords: [55.185934, 61.296786], name: 'Офис на пр. Победы, 384' },
        { coords: [55.194984, 61.308473], name: 'Офис на Комсомольском пр., 80' },
        { coords: [55.174064, 61.454611], name: 'Офис на ул. Комарова, 114' },
        { coords: [55.264132, 61.403739], name: 'Офис на ул. Сталеваров, 5а' },
        { coords: [55.264784, 61.393445], name: 'Офис на ул. 60 лет Октября, 18' },
        { coords: [55.244537, 61.370223], name: 'Офис на шоссе Металлургов, 51' }
    ];

    // Добавляем метки на карту
    branches.forEach(function(branch) {
        var placemark = new ymaps.Placemark(branch.coords, {
            // Текст, который появится при клике на метку
            balloonContentHeader: branch.name
        }, {
            // Настройки внешнего вида метки
            iconLayout: 'default#image',
            iconImageHref: markerImageUrl,
            iconImageSize: [40, 50],  
            iconImageOffset: [-20, -45] 
        });

        myMap.geoObjects.add(placemark); // Добавляем метку на карту
    });

    // Подгоняем масштаб карты, чтобы были видны все метки
    if (branches.length > 0) {
        myMap.setBounds(myMap.geoObjects.getBounds());
    }
}