(async function() {
  const autoContainer = document.getElementById('auto-courses');
  const specialContainer = document.getElementById('special-courses');
  if (!autoContainer && !specialContainer) return;

  try {
    const response = await fetch('http://localhost:3001/api/courses');
    if (!response.ok) throw new Error('Ошибка загрузки курсов');
    const courses = await response.json();

    // Разделяем на автошколу и спецтехнику по наличию fulltime_price (у спецтехники обычно пусто)
    const autoCourses = courses.filter(c => c.fulltime_price && c.fulltime_price.trim() !== '');
    const specialCourses = courses.filter(c => !c.fulltime_price || c.fulltime_price.trim() === '');

    function createCourseCard(course) {
    const courseKeyMap = {
        'Автомобиль с МКПП — категория «B»': 'auto',
        'Автомобиль с АКПП — категория «B» автомат': 'auto2',
        'Мотоцикл — категория «A»': 'motorcycle',
        'Погрузчик — категории «B», «C», «D»': 'pogruz',
        'Экскаватор — категории «C», «E», «D»': 'excovator',
        'Трактор — категории «B», «C», «E», «D»': 'truck',
        'Бульдозер — категория «E» с 19 лет': 'buldozer',
        'Автогрейдер — категории «C», «D» с 19 лет': 'autograde',
        'Автомобильный кран': 'autocran',
        'Мостовой кран': 'mostcran',
        'Автовышка и автогидроподъемник': 'autovyshka',
        'Квадроцикл и снегоход — категория «AI» с 16 лет': 'kvadro',
        'Внедорожные автотранспортные средства — категория «AII» с 19 лет': 'trekol',
        'Внедорожные автотранспортные средства — категория «АIII» (БелАЗ)': 'belaz',
        'Машинист катка — категория «C»': 'katok',
        'Машинист уплотняющей машины «Ратрак» — категория «E»': 'ratrak',
        'Машинист крана на самоходном ходу': 'samohod'
    };
    const courseKey = courseKeyMap[course.name] || 'auto';

    const hasBothOptions = course.distance_price && course.fulltime_price;
    const durationLabel = `<div class="duration-mobile"><span class="duration-label-mobile">длительность</span><span class="duration-value-mobile">${escapeHtml(course.duration)}</span></div>`;

    let pricesHtml = '';
    if (hasBothOptions) {
        pricesHtml += `
            <div class="price-option">
                <span class="price-option__label desktop-only">дистанционное</span>
                <span class="price-label-mobile">дистанционное</span>
                <div class="price-option__values">
                    <span class="price-current">${course.distance_price} руб.</span>
                    ${course.distance_old_price ? `<span class="price-old">${course.distance_old_price} руб.</span>` : ''}
                </div>
            </div>
            <div class="price-option">
                <span class="price-option__label desktop-only">очное</span>
                <span class="price-label-mobile">очное</span>
                <div class="price-option__values">
                    <span class="price-current">${course.fulltime_price} руб.</span>
                    ${course.fulltime_old_price ? `<span class="price-old">${course.fulltime_old_price} руб.</span>` : ''}
                </div>
            </div>
        `;
    } else {
        pricesHtml = `
            <div class="price-option">
                <span class="price-label-mobile">стоимость</span>
                <div class="price-option__values">
                    <span class="price-current">${course.distance_price || course.fulltime_price} руб.</span>
                    ${(course.distance_old_price || course.fulltime_old_price) ? `<span class="price-old">${course.distance_old_price || course.fulltime_old_price} руб.</span>` : ''}
                </div>
            </div>
        `;
    }

    return `
        <article class="course-card">
            <a href="../pages/courses-data.html?course=${courseKey}" class="course-card__link-overlay"></a>
            <div class="course-card__name"><a href="#">${escapeHtml(course.name)}</a></div>
            <div class="course-card__duration desktop-only">${escapeHtml(course.duration)}</div>
            ${durationLabel}
            <div class="course-card__prices">${pricesHtml}</div>
            <button class="btn course-card__btn" data-course="${escapeHtml(course.name)}">Записаться</button>
        </article>
    `;
}

    if (autoContainer) autoContainer.innerHTML = autoCourses.map(createCourseCard).join('');
    if (specialContainer) specialContainer.innerHTML = specialCourses.map(createCourseCard).join('');

  } catch (err) {
    console.error('Не удалось загрузить курсы:', err);
    if (autoContainer) autoContainer.innerHTML = '<p style="color:red; text-align:center;">Ошибка загрузки</p>';
    if (specialContainer) specialContainer.innerHTML = '<p style="color:red; text-align:center;">Ошибка загрузки</p>';
  }

  function escapeHtml(str) {
    return str.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'})[m]);
  }
})();