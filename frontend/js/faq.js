// faq.js
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.faq-list').forEach(list => {
    list.addEventListener('click', function (e) {
      const item = e.target.closest('.faq-item');
      if (!item) return;

      // Закрываем все другие активные вопросы в этой группе
      const allItems = list.querySelectorAll('.faq-item');
      allItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
        }
      });

      // Переключаем текущий
      item.classList.toggle('active');
    });
  });
});