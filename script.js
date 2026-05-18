function openLightbox(imageSrc, title, type) {
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxTitle = document.getElementById("lightbox-title");
    const lightboxType = document.getElementById("lightbox-type");

    if (!lightbox || !lightboxImg || !lightboxTitle || !lightboxType) {
        return;
    }

    lightboxImg.src = imageSrc;
    lightboxTitle.textContent = title;
    lightboxType.textContent = type;
    lightbox.style.display = "flex";
    document.body.classList.add("modal-open");
}

function closeLightbox() {
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxTitle = document.getElementById("lightbox-title");
    const lightboxType = document.getElementById("lightbox-type");

    if (!lightbox || !lightboxImg || !lightboxTitle || !lightboxType) {
        return;
    }

    lightbox.style.display = "none";
    lightboxImg.src = "";
    lightboxTitle.textContent = "";
    lightboxType.textContent = "";
    document.body.classList.remove("modal-open");
}

function openPolicyModal() {
    const policyModal = document.getElementById("policy-modal");

    if (!policyModal) {
        return;
    }

    policyModal.style.display = "flex";
    document.body.classList.add("modal-open");
}

function closePolicyModal() {
    const policyModal = document.getElementById("policy-modal");

    if (!policyModal) {
        return;
    }

    policyModal.style.display = "none";
    document.body.classList.remove("modal-open");
}

document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        closeLightbox();
        closePolicyModal();
    }
});

const AUTO_SLIDE_TIME = 4000;
const DRAG_PAGE_THRESHOLD = 60;
const CLICK_CANCEL_THRESHOLD = 8;

document.querySelectorAll("[data-carousel]").forEach(function(carousel) {
    const windowArea = carousel.querySelector(".carousel-window");
    const track = carousel.querySelector(".carousel-track");
    const slides = carousel.querySelectorAll("[data-slide]");
    const dotsArea = carousel.querySelector("[data-dots]");
    const prevButton = carousel.querySelector("[data-prev]");
    const nextButton = carousel.querySelector("[data-next]");

    let currentPage = 0;
    let autoSlideTimer = null;

    let isDragging = false;
    let startX = 0;
    let currentX = 0;
    let dragMoveX = 0;
    let isRealDrag = false;
    let blockNextClick = false;

    function getCardsPerPage() {
        if (carousel.classList.contains("service-carousel")) {
            if (window.innerWidth <= 760) {
                return 1;
            }

            return 2;
        }

        if (window.innerWidth <= 520) {
            return 1;
        }

        if (window.innerWidth <= 760) {
            return 2;
        }

        if (window.innerWidth <= 1100) {
            return 3;
        }

        return 4;
    }

    function getMaxPage() {
        const cardsPerPage = getCardsPerPage();
        return Math.max(0, Math.ceil(slides.length / cardsPerPage) - 1);
    }

    function getBaseMoveX() {
        if (slides.length === 0) {
            return 0;
        }

        const cardsPerPage = getCardsPerPage();
        const slideWidth = slides[0].getBoundingClientRect().width;
        const gap = 12;

        return currentPage * cardsPerPage * (slideWidth + gap);
    }

    function createDots() {
        if (!dotsArea) {
            return;
        }

        dotsArea.innerHTML = "";

        const maxPage = getMaxPage();

        for (let i = 0; i <= maxPage; i++) {
            const dot = document.createElement("button");
            dot.className = "carousel-dot";
            dot.setAttribute("aria-label", `${i + 1}번째 페이지`);

            dot.addEventListener("click", function(event) {
                event.preventDefault();
                event.stopPropagation();

                currentPage = i;
                updateCarousel();
                restartAutoSlide();
            });

            dotsArea.appendChild(dot);
        }
    }

    function updateDots() {
        if (!dotsArea) {
            return;
        }

        const dots = dotsArea.querySelectorAll(".carousel-dot");

        dots.forEach(function(dot, index) {
            dot.classList.toggle("active", index === currentPage);
        });
    }

    function updateCarousel() {
        const maxPage = getMaxPage();

        if (currentPage > maxPage) {
            currentPage = maxPage;
        }

        if (currentPage < 0) {
            currentPage = 0;
        }

        const moveX = getBaseMoveX();

        track.style.transition = "transform 0.65s ease";
        track.style.transform = `translateX(-${moveX}px)`;

        updateDots();
    }

    function goNext() {
        const maxPage = getMaxPage();

        if (currentPage >= maxPage) {
            currentPage = 0;
        } else {
            currentPage++;
        }

        updateCarousel();
    }

    function goPrev() {
        const maxPage = getMaxPage();

        if (currentPage <= 0) {
            currentPage = maxPage;
        } else {
            currentPage--;
        }

        updateCarousel();
    }

    function startAutoSlide() {
        stopAutoSlide();
        autoSlideTimer = setInterval(goNext, AUTO_SLIDE_TIME);
    }

    function stopAutoSlide() {
        if (autoSlideTimer !== null) {
            clearInterval(autoSlideTimer);
            autoSlideTimer = null;
        }
    }

    function restartAutoSlide() {
        stopAutoSlide();
        startAutoSlide();
    }

    function startDrag(clientX) {
        isDragging = true;
        startX = clientX;
        currentX = clientX;
        dragMoveX = 0;
        isRealDrag = false;

        windowArea.classList.add("dragging");
        track.style.transition = "none";
        stopAutoSlide();
    }

    function moveDrag(clientX) {
        if (!isDragging) {
            return;
        }

        currentX = clientX;
        dragMoveX = currentX - startX;

        if (Math.abs(dragMoveX) > CLICK_CANCEL_THRESHOLD) {
            isRealDrag = true;
        }

        const baseMoveX = getBaseMoveX();
        const moveX = baseMoveX - dragMoveX;

        track.style.transform = `translateX(-${moveX}px)`;
    }

    function endDrag() {
        if (!isDragging) {
            return;
        }

        isDragging = false;
        windowArea.classList.remove("dragging");

        if (isRealDrag) {
            blockNextClick = true;

            setTimeout(function() {
                blockNextClick = false;
            }, 100);
        }

        if (dragMoveX > DRAG_PAGE_THRESHOLD) {
            goPrev();
        } else if (dragMoveX < -DRAG_PAGE_THRESHOLD) {
            goNext();
        } else {
            updateCarousel();
        }

        dragMoveX = 0;
        restartAutoSlide();
    }

    windowArea.addEventListener("click", function(event) {
        if (blockNextClick) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            blockNextClick = false;
        }
    }, true);

    windowArea.addEventListener("mousedown", function(event) {
        event.preventDefault();
        startDrag(event.clientX);
    });

    window.addEventListener("mousemove", function(event) {
        moveDrag(event.clientX);
    });

    window.addEventListener("mouseup", function() {
        endDrag();
    });

    windowArea.addEventListener("touchstart", function(event) {
        startDrag(event.touches[0].clientX);
    });

    windowArea.addEventListener("touchmove", function(event) {
        moveDrag(event.touches[0].clientX);
    });

    windowArea.addEventListener("touchend", function() {
        endDrag();
    });

    if (prevButton) {
        prevButton.addEventListener("click", function(event) {
            event.preventDefault();
            event.stopPropagation();

            goPrev();
            restartAutoSlide();
        });
    }

    if (nextButton) {
        nextButton.addEventListener("click", function(event) {
            event.preventDefault();
            event.stopPropagation();

            goNext();
            restartAutoSlide();
        });
    }

    carousel.addEventListener("mouseenter", stopAutoSlide);

    carousel.addEventListener("mouseleave", function() {
        if (!isDragging) {
            startAutoSlide();
        }
    });

    window.addEventListener("resize", function() {
        createDots();
        updateCarousel();
    });

    createDots();
    updateCarousel();
    startAutoSlide();
});