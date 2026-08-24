// Auto-advancing, looping carousel. Supports mixed <img> and YouTube <iframe> slides.
// Supporta anche la navigazione con le frecce della tastiera (Sinistra / Destra).
document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('.carousel').forEach((carousel) => {
    const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
    const dotsWrap = carousel.querySelector('.carousel-dots');
    if (!slides.length) return;

    let index = 0;
    const interval = parseInt(carousel.dataset.interval, 10) || 6000;
    const dots = [];

    slides.forEach((s, i) => s.classList.toggle('active', i === 0));

    if (dotsWrap) {
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
        dots.push(dot);
      });
    }

    function goTo(next) {
      slides[index].classList.remove('active');
      if (dots[index]) dots[index].classList.remove('active');
      index = (next + slides.length) % slides.length;
      slides[index].classList.add('active');
      if (dots[index]) dots[index].classList.add('active');
    }

    // AGGIUNTA: Ascolta la tastiera per muovere le slide
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        goTo(index - 1); // Freccia Sinistra -> Precedente
      } else if (e.key === 'ArrowRight') {
        goTo(index + 1); // Freccia Destra -> Successiva
      }
    });

    if (!reduceMotion && slides.length > 1) {
      let timer = setInterval(() => goTo(index + 1), interval);
      carousel.addEventListener('mouseenter', () => clearInterval(timer));
      carousel.addEventListener('mouseleave', () => {
        timer = setInterval(() => goTo(index + 1), interval);
      });
    }
  });
});
