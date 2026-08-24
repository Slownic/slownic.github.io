// Auto-advancing, looping carousel. Supports mixed <img> and YouTube <iframe> slides.
// Supporta navigazione da tastiera e gesture swipe ottimizzata per mobile.
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

    // Navigazione da tastiera (Frecce Sinistra / Destra)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        goTo(index - 1);
      } else if (e.key === 'ArrowRight') {
        goTo(index + 1);
      }
    });

    // CORREZIONE: Gestione dello Swipe su Mobile stabile
    let touchStartX = 0;
    let touchStartY = 0;

    carousel.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    carousel.addEventListener('touchmove', (e) => {
      // Calcola lo spostamento orizzontale e verticale
      const xDiff = Math.abs(e.touches[0].clientX - touchStartX);
      const yDiff = Math.abs(e.touches[0].clientY - touchStartY);

      // Se l'utente sta muovendo il dito più in orizzontale che in verticale,
      // significa che vuole fare uno swipe e non scrollare la pagina.
      if (xDiff > yDiff) {
        if (e.cancelable) e.preventDefault(); // Impedisce alla pagina di oscillare
      }
    }, { passive: false }); // Deve essere false per permettere il preventDefault

    carousel.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const swipeDistance = touchEndX - touchStartX;
      const minSwipeThreshold = 40; // Ridotta leggermente la distanza per renderlo più sensibile

      if (Math.abs(swipeDistance) > minSwipeThreshold) {
        if (swipeDistance > 0) {
          // Swipe verso destra -> slide precedente
          goTo(index - 1);
        } else {
          // Swipe verso sinistra -> slide successiva
          goTo(index + 1);
        }
      }
    }, { passive: true });

    if (!reduceMotion && slides.length > 1) {
      let timer = setInterval(() => goTo(index + 1), interval);
      carousel.addEventListener('mouseenter', () => clearInterval(timer));
      carousel.addEventListener('mouseleave', () => {
        timer = setInterval(() => goTo(index + 1), interval);
      });
    }
  });
});
