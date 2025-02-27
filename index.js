import { modalData } from "./modalData.js";

document.addEventListener("DOMContentLoaded", () => {
  const images = Array.from(document.querySelectorAll(".hoverImage"));
  const container = document.querySelector(".image_container");
  const modal = document.querySelector(".modal");
  const modalContent = modal.querySelector(".modal-content");
  const button = modal.querySelector(".modal-close-control");

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  canvas.style.display = "none";
  document.body.appendChild(canvas);

  const letterAnimations = {
    TitleAppearingN: "movingLettersN 2s infinite",
    TitleAppearingJ: "movingLettersJ 2s infinite",
    TitleAppearingZ: "movingLettersZ 2s infinite",
  };

  document
    .querySelectorAll(".letter-n, .letter-j, .letter-z")
    .forEach((letter) => {
      letter.addEventListener("animationend", (event) => {
        const newAnimation = letterAnimations[event.animationName];
        if (newAnimation) {
          event.target.style.animation = newAnimation;
        }
      });
    });

  let foundImage = null;
  let animationFrameId = null;

  const calculateImageMetrics = (img, rect) => {
    const imageAspect = img.naturalWidth / img.naturalHeight;
    const rectAspect = rect.width / rect.height;
    let drawnWidth, drawnHeight, offsetX, offsetY;
    if (rectAspect > imageAspect) {
      drawnHeight = rect.height;
      drawnWidth = drawnHeight * imageAspect;
      offsetX = (rect.width - drawnWidth) / 2;
      offsetY = 0;
    } else {
      drawnWidth = rect.width;
      drawnHeight = drawnWidth / imageAspect;
      offsetX = 0;
      offsetY = (rect.height - drawnHeight) / 2;
    }
    return { drawnWidth, drawnHeight, offsetX, offsetY };
  };

  container.addEventListener("mousemove", (e) => {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(() => {
      let currentFoundImage = null;
      for (const img of images) {
        const rect = img.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const { drawnWidth, drawnHeight, offsetX, offsetY } =
          calculateImageMetrics(img, rect);
        if (
          mouseX < offsetX ||
          mouseX > offsetX + drawnWidth ||
          mouseY < offsetY ||
          mouseY > offsetY + drawnHeight
        ) {
          continue;
        }
        const localX = mouseX - offsetX;
        const localY = mouseY - offsetY;
        const scaleX = img.naturalWidth / drawnWidth;
        const scaleY = img.naturalHeight / drawnHeight;
        if (
          canvas.width !== img.naturalWidth ||
          canvas.height !== img.naturalHeight
        ) {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const pixelData = ctx.getImageData(
          Math.floor(localX * scaleX),
          Math.floor(localY * scaleY),
          1,
          1
        ).data;
        if (pixelData[3] > 0) {
          currentFoundImage = img;
          break;
        }
      }
      if (foundImage !== currentFoundImage) {
        images.forEach((img) => {
          if (img === currentFoundImage) {
            img.classList.add("hovered");
            img.classList.remove("not-hovered");
          } else {
            img.classList.add("not-hovered");
            img.classList.remove("hovered");
          }
        });
      }
      if (!currentFoundImage) {
        images.forEach((img) => img.classList.remove("hovered", "not-hovered"));
      }
      foundImage = currentFoundImage;
    });
  });

  container.addEventListener("mouseleave", () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    images.forEach((img) => img.classList.remove("hovered", "not-hovered"));
    foundImage = null;
  });

  container.addEventListener("touchstart", (e) => {
    const touch = e.touches[0];
    if (!touch) return;
    let currentFoundImage = null;
    for (const img of images) {
      const rect = img.getBoundingClientRect();
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;
      const { drawnWidth, drawnHeight, offsetX, offsetY } =
        calculateImageMetrics(img, rect);
      if (
        touchX < offsetX ||
        touchX > offsetX + drawnWidth ||
        touchY < offsetY ||
        touchY > offsetY + drawnHeight
      ) {
        continue;
      }
      const localX = touchX - offsetX;
      const localY = touchY - offsetY;
      const scaleX = img.naturalWidth / drawnWidth;
      const scaleY = img.naturalHeight / drawnHeight;
      if (
        canvas.width !== img.naturalWidth ||
        canvas.height !== img.naturalHeight
      ) {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const pixelData = ctx.getImageData(
        Math.floor(localX * scaleX),
        Math.floor(localY * scaleY),
        1,
        1
      ).data;
      if (pixelData[3] > 0) {
        currentFoundImage = img;
        break;
      }
    }
    if (currentFoundImage) {
      foundImage = currentFoundImage;
    }
  });

  container.addEventListener("touchend", () => {
    if (foundImage) {
      modal.style.display = "flex";
      modalContent.style.display = "grid";
      button.style.display = "block";
      modal.style.animation = "modalAppearing 1s ease-in-out forwards";
      const canvasElement = modal.getElementsByTagName("canvas")[0];
      if (canvasElement) {
        canvasElement.style.animation =
          "modalAppearing 1s ease-in-out forwards";
      }
      setTimeout(() => {
        button.style.animation =
          "modalCloseButtonAppearing 1s ease-in-out forwards";
        modalContent.style.animation =
          "contentAppearing 1s ease-in-out forwards";
      }, 1000);
    }
  });

  container.addEventListener("click", () => {
    if (foundImage) {
      container.style.pointerEvents = "none";
      const imageId = foundImage.id;
      let modalInfo = modalData[imageId];
      let modalSectors = modalInfo.slice(0, -1);
      let modalFinal = modalInfo[modalInfo.length - 1];
      console.log(modalFinal);
      const canvas = modal.getElementsByTagName("canvas")[0];
      modalContent.innerHTML = "";
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const contentSector = entry.target;

            if (entry.isIntersecting) {
              gsap.fromTo(
                contentSector,
                {
                  opacity: 0,
                  y: 50,
                },
                {
                  opacity: 1,
                  y: 0,
                  duration: 1,
                  ease: "power1.out",
                }
              );
            } else {
              gsap.fromTo(
                contentSector,
                {
                  opacity: 1,
                },
                {
                  opacity: 0,
                  duration: 1,
                  ease: "power1.out",
                }
              );
            }
          });
        },
        {
          threshold: 0.4,
          root: null,
        }
      );
      if (modalSectors) {
        modalSectors.forEach((item, index) => {
          const contentSector = document.createElement("div");
          contentSector.classList.add("content-sector");
          contentSector.id = `content-sector-${index}`;

          const imageSector = document.createElement("div");
          imageSector.classList.add("modal-sector");
          const img = document.createElement("img");
          img.classList.add("modal-image");
          img.src = item.image;
          img.alt = item.title ? item.title : "Imagen del modal";
          imageSector.appendChild(img);

          const textSector = document.createElement("div");
          textSector.classList.add("modal-sector");
          const textContainer = document.createElement("div");
          textContainer.classList.add("modal-text-sector");

          if (item.title) {
            const h1 = document.createElement("h1");
            h1.classList.add("modal-title");
            h1.id = `modal-title-${imageId}`;
            h1.textContent = item.title;
            textContainer.appendChild(h1);
          }

          const p = document.createElement("p");
          p.classList.add("modal-text");
          p.innerHTML = item.description;
          textContainer.appendChild(p);
          textSector.appendChild(textContainer);

          contentSector.appendChild(imageSector);
          contentSector.appendChild(textSector);

          modalContent.appendChild(contentSector);

          setTimeout(() => {
            observer.observe(contentSector);
          }, 10);
        });
      }
      if (modalFinal) {
        const contentSector = document.createElement("div");
        contentSector.classList.add("content-final");
        contentSector.id = `content-final-${modalInfo.length}`;

        const imageSector = document.createElement("div");
        imageSector.classList.add("modal-sector-final");
        const img = document.createElement("img");
        img.classList.add("modal-image-final");
        img.src = modalFinal.image;
        img.alt = modalFinal.title ? modalFinal.title : "Imagen del modal";
        imageSector.appendChild(img);

        const textSector = document.createElement("div");
        textSector.classList.add("modal-text-final");
        const textContainer = document.createElement("div");
        textContainer.classList.add("modal-text-sector");
        const p = document.createElement("p");
        p.classList.add("text-final");
        p.innerHTML = modalFinal.description;
        textContainer.appendChild(p);
        textSector.appendChild(textContainer);

        contentSector.appendChild(imageSector);
        contentSector.appendChild(textSector);

        modalContent.appendChild(contentSector);
        setTimeout(() => {
          observer.observe(contentSector);
        }, 10);
      }
      modal.classList.add("show");
      gsap.fromTo(
        canvas,
        { opacity: 0, scale: 0, borderRadius: "100%" },
        {
          opacity: 1,
          scale: 1,
          borderRadius: "0%",
          duration: 1,
          ease: "ease-in-out",
        }
      );
      gsap.fromTo(
        modal,
        { opacity: 0, scale: 0, borderRadius: "100%" },
        {
          opacity: 1,
          scale: 1,
          borderRadius: "0%",
          duration: 1,
          ease: "ease-in-out",
        }
      );

      setTimeout(() => {
        gsap.fromTo(
          modalContent,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1, stagger: 0.5, ease: "power2.out" }
        );
      }, 700);

      setTimeout(() => {
        gsap.fromTo(
          button,
          { opacity: 0, scale: 0 },
          { opacity: 1, scale: 1, duration: 1, ease: "ease-in-out" }
        );
      }, 1000);
    }
  });
});
