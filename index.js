
document.addEventListener("DOMContentLoaded", () => {
  const images = Array.from(document.querySelectorAll(".hoverImage"));
  const container = document.querySelector(".image_container");
  const modal = document.querySelector(".modal");
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

  container.addEventListener("click", () => {
    if (foundImage) {
      modal.classList.toggle("hidden");
    }
  });
});
