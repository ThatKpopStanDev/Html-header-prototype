document.addEventListener("DOMContentLoaded", () => {
  const modal = document.querySelector(".modal");
  const modalContent = modal.querySelector(".modal-content");
  const container = document.querySelector(".image_container");
  const button = modal.querySelector(".modal-close-control");
  const canvas = modal.getElementsByTagName("canvas");

  button.addEventListener("click", () => {
    container.style.pointerEvents = "auto";

    gsap.to(modalContent, {
      duration: 1,
      opacity: 0,
      y: 20,
    });

    gsap.to(button, {
      duration: 1,
      opacity: 0,
      scale: 0,
      ease: "easeInOut",
    });
    gsap.to(canvas[0], {
      duration: 1,
      opacity: 0,
      scale: 0,
      borderRadius: "100%",
      ease: "easeInOut",
      delay: 1,
    });
    gsap.to(modal, {
      duration: 1,
      opacity: 0,
      scale: 0,
      borderRadius: "100%",
      ease: "easeInOut",
      delay: 1,
    });
    function removeUnusedContent() {
      const contentSectors =
        modalContent.getElementsByClassName("content-sector");

      Array.from(contentSectors).forEach((sector) => {
        if (
          !sector.classList.contains("show") &&
          !isElementInViewport(sector)
        ) {
          sector.remove();
        }
      });
    }

    function isElementInViewport(el) {
      const rect = el.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <=
          (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <=
          (window.innerWidth || document.documentElement.clientWidth)
      );
    }

    removeUnusedContent();
  });
});
