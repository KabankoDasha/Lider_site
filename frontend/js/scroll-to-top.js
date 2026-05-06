(function() {
    const pathToImages = window.location.pathname.includes('/course/') ? '../../images/' : '../images/';

    const btn = document.createElement('div');
    btn.className = 'scroll-to-top';
    btn.innerHTML = `<img src="${pathToImages}arrow2.svg" alt="Наверх" class="scroll-to-top__icon">`;
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
        btn.classList.toggle('scroll-to-top--visible', window.scrollY > 300);
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
})();