(async function() {
  const autoContainer = document.getElementById('auto-courses');
  const specialContainer = document.getElementById('special-courses');
  if (!autoContainer && !specialContainer) return;

  try {
    const response = await fetch('/api/courses');
    if (!response.ok) throw new Error('Ошибка загрузки курсов');
    const courses = await response.json();

    // Разделяем на автошколу и спецтехнику
    const autoCourses = courses.filter(c => c.fulltime_price && c.fulltime_price.trim() !== '');
    const specialCourses = courses.filter(c => !c.fulltime_price || c.fulltime_price.trim() === '');

    function createCourseCard(course) {
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

      console.log('Курс', course.id, course.name, 'ссылка:', `/courses-data.html?id=${course.id}`);
      return `
        <article class="course-card">
            <div class="course-card__name">
            <a href="/courses-data.html?id=${course.id}">${escapeHtml(course.name)}</a>
            </div>
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