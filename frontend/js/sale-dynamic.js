(async function() {
  const track = document.getElementById('sales-container');
  if (!track) return;

  try {
    const response = await fetch('http://localhost:3001/api/sales');
    if (!response.ok) throw new Error('Ошибка загрузки акций');
    const sales = await response.json();

    if (sales.length === 0) {
      track.innerHTML = '<p style="text-align:center; grid-column:1/-1;">Нет активных акций</p>';
      return;
    }

    track.innerHTML = sales.map(sale => `
    <div class="promo-card">
        <div class="promo-card__inner">
        <h3 class="promo-card__title">${escapeHtml(sale.name)}</h3>
        <p class="promo-card__discount">${escapeHtml(sale.discount)}</p>
        <p class="promo-card__date">${escapeHtml(sale.validity)}</p>
        </div>
    </div>
    `).join('');

    // Если есть функция инициализации слайдера, её нужно вызвать после вставки
    if (typeof initPromoSlider === 'function') {
      initPromoSlider();
    } else {

    }
  } catch (err) {
    console.error('Не удалось загрузить акции:', err);
    track.innerHTML = '<p style="color:red; text-align:center;">Ошибка загрузки</p>';
  }

  function escapeHtml(str) {
    return str.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'})[m]);
  }
})();