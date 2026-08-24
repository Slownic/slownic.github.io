// Auto-advancing, looping carousel. Supports mixed <img> and YouTube <iframe> slides.
document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Crea la finestra modale per l'ingrandimento con frecce integrate
  const modal = document.createElement('div');
  modal.className = 'carousel-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = `
    <span class="carousel-modal-close" aria-label="Chiudi">&times;</span>
    <button class="modal-prev-btn" aria-label="Immagine precedente">&#10094;</button>
    <img class="carousel-modal-content" src="" alt="Anteprima ingrandita">
    <button class="modal-next-btn" aria-label="Immagine successiva">&#10095;</button>
  `;
  document.body.appendChild(modal);

  const modalImg = modal.querySelector('.carousel-modal-content');
  const modalClose = modal.querySelector('.carousel-modal-close');
  const modalPrev = modal.querySelector('.modal-prev-btn');
  const modalNext = modal.querySelector('.modal-next-btn');

  let currentModalImages = [];
  let currentModalIndex = 0;

  function updateModalImage() {
    if (currentModalImages.length > 0) {
      modalImg.src = currentModalImages[currentModalIndex];
    }
  }

  // Eventi per navigazione Modale
  modalPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    currentModalIndex = (currentModalIndex - 1 + currentModalImages.length) % currentModalImages.length;
    updateModalImage();
  });

  modalNext.addEventListener('click', (e) => {
    e.stopPropagation();
    currentModalIndex = (currentModalIndex + 1) % currentModalImages.length;
    updateModalImage();
  });

  modalClose.addEventListener('click', () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }
  });

  // Supporto frecce tastiera per la modale
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    } else if (e.key === 'ArrowLeft') {
      modalPrev.click();
    } else if (e.key === 'ArrowRight') {
      modalNext.click();
    }
  });

  document.querySelectorAll('.carousel').forEach((carousel) => {
    const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
    const dotsWrap = carousel.querySelector('.carousel-dots');
    if (!slides.length) return;

    let index = 0;
    const interval = parseInt(carousel.dataset.interval, 10) || 6000;
    const dots = [];

    slides.forEach((s, i) => s.classList.toggle('active', i === 0));

    // Trova tutte le sorgenti delle sole immagini per questo specifico carousel
    const carouselImages = Array.from(carousel.querySelectorAll('.carousel-slide img'));
    const imageUrls = carouselImages.map(img => img.src);

    // Gestisce il click sulle immagini del carousel
    carouselImages.forEach((img) => {
      img.style.cursor = 'pointer';
      img.addEventListener('click', () => {
        currentModalImages = imageUrls;
        currentModalIndex = currentModalImages.indexOf(img.src);
        updateModalImage();
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
      });
    });

    // AGGIUNTA: Generazione automatica frecce direzionali standard nella pagina
    if (slides.length > 1) {
      const prevBtn = document.createElement('button');
      prevBtn.className = 'carousel-control-btn prev-btn';
      prevBtn.type = 'button';
      prevBtn.innerHTML = '&#10094;';
      prevBtn.setAttribute('aria-label', 'Slide precedente');
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        goTo(index - 1);
      });

      const nextBtn = document.createElement('button');
      nextBtn.className = 'carousel-control-btn next-btn';
      nextBtn.type = 'button';
      nextBtn.innerHTML = '&#10095;';
      nextBtn.setAttribute('aria-label', 'Slide successiva');
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        goTo(index + 1);
      });

      carousel.appendChild(prevBtn);
      carousel.appendChild(nextBtn);
    }

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

    if (!reduceMotion && slides.length > 1) {
      let timer = setInterval(() => goTo(index + 1), interval);
      carousel.addEventListener('mouseenter', () => clearInterval(timer));
      carousel.addEventListener('mouseleave', () => {
        timer = setInterval(() => goTo(index + 1), interval);
      });
    }
  });
});
