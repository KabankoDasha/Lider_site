(async function() {
  const theoryTrack = document.getElementById('theory-track');
  const drivingTrack = document.getElementById('driving-track');
  if (!theoryTrack && !drivingTrack) return;

  try {
    const response = await fetch('http://localhost:3001/api/instructors');
    if (!response.ok) throw new Error('Ошибка загрузки инструкторов');
    const instructors = await response.json();

    const theoryInstrs = instructors.filter(i => i.category === 'Преподаватель по теории');
    const drivingInstrs = instructors.filter(i => i.category === 'Инструктор по вождению');

    function createCard(instr) {
      const photoUrl = instr.photo 
        ? `http://localhost:3001/photos/${instr.photo}` 
        : '../images/placeholder.jpg';   // заглушка, если фото нет
      const hasCar = instr.car && instr.car.trim() !== '';
      const cardClass = hasCar ? 'instructor-card instructor-card--with-car' : 'instructor-card';
      // Картинка автомобиля – если есть авто (замените путь при необходимости)
      const carImgHtml = hasCar 
        ? `<img src="../images/${instr.car.toLowerCase().replace(/\s+/g, '-')}.svg" alt="Машина инструктора" class="instructor-card__car">` 
        : '';

      let detailsHtml = `<p class="instructor-detail">Стаж вождения: <span class="value">${escapeHtml(instr.experience)}</span></p>`;
      if (hasCar) {
        detailsHtml += `<p class="instructor-detail">Автомобиль: <span class="value">${escapeHtml(instr.car)}</span></p>`;
      } else if (instr.education) {
        detailsHtml += `<p class="instructor-detail">Образование: <span class="value">${escapeHtml(instr.education)}</span></p>`;
      }

      return `
        <div class="${cardClass}">
          <div class="instructor-card__inner">
            <div class="instructor-card__photo-wrapper">
              <img src="${photoUrl}" alt="${escapeHtml(instr.name)}" class="instructor-card__photo">
            </div>
            <div class="instructor-card__info">
              <h4 class="instructor-card__name">${escapeHtml(instr.name)}</h4>
              <div class="instructor-card__rating">
                <span class="rating-value">${instr.rating}</span>
                <div class="stars"></div>
              </div>
            </div>
          </div>
          <div class="instructor-card__details">
            ${detailsHtml}
          </div>
          ${carImgHtml}
        </div>
      `;
    }

    if (theoryTrack) {
      theoryTrack.innerHTML = theoryInstrs.map(createCard).join('');
      if (theoryInstrs.length === 0) theoryTrack.innerHTML = '<p style="text-align:center; width:100%;">Нет преподавателей</p>';
    }
    if (drivingTrack) {
      drivingTrack.innerHTML = drivingInstrs.map(createCard).join('');
      if (drivingInstrs.length === 0) drivingTrack.innerHTML = '<p style="text-align:center; width:100%;">Нет инструкторов</p>';
    }

    // После вставки карточек вызываем инициализацию слайдеров и звёзд
    if (typeof initSliders === 'function') {
      initSliders();
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        if (typeof initSliders === 'function') initSliders();
      });
    }
  } catch (err) {
    console.error('Ошибка загрузки инструкторов:', err);
    if (theoryTrack) theoryTrack.innerHTML = '<p style="color:red;">Ошибка загрузки</p>';
    if (drivingTrack) drivingTrack.innerHTML = '<p style="color:red;">Ошибка загрузки</p>';
  }

  function escapeHtml(str) {
    return str.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'})[m]);
  }
})();