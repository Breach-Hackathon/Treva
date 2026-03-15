export interface ReelSlide {
  name: string;
  photoUrl: string;
  caption: string;
  stickers: string[];
  transition: string;
}

export async function generateReelVideo(
  slides: ReelSlide[],
  onProgress?: (p: number) => void
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d")!;

  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, {
    mimeType: "video/webm;codecs=vp9",
    videoBitsPerSecond: 5000000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };

  const done = new Promise<Blob>((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));
  });

  recorder.start();

  // Load all images + logo
  const loadImg = (src: string): Promise<HTMLImageElement> => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    return new Promise((res, rej) => {
      img.onload = () => res(img);
      img.onerror = () => rej(new Error(`Failed to load image`));
      img.src = src;
    });
  };

  const [trevaLogo, ...images] = await Promise.all([
    loadImg("/treva-logo.png"),
    ...slides.map((s) => loadImg(s.photoUrl)),
  ]);

  const fps = 30;
  const slideDuration = 3; // seconds per slide
  const transitionDuration = 0.8; // seconds

  for (let si = 0; si < slides.length; si++) {
    const slide = slides[si];
    const img = images[si];
    const nextImg = si < slides.length - 1 ? images[si + 1] : null;
    const totalFrames = slideDuration * fps;

    if (!slide || !img) continue;

    for (let f = 0; f < totalFrames; f++) {
      const t = f / totalFrames;
      const transT = Math.max(0, (t - (1 - transitionDuration / slideDuration)) / (transitionDuration / slideDuration));

      // Clear
      ctx.fillStyle = "#0d1117";
      ctx.fillRect(0, 0, 1080, 1920);

      // Draw current image with Ken Burns
      const scale = 1 + t * 0.08;
      drawImageCover(ctx, img, 1080, 1920, scale, 1 - transT);

      // Draw transition to next
      if (nextImg && transT > 0) {
        const eased = easeInOutCubic(transT);
        if (slide.transition === "slide-left") {
          ctx.save();
          ctx.translate(-1080 * eased, 0);
          drawImageCover(ctx, img, 1080, 1920, scale, 1);
          ctx.restore();
          ctx.save();
          ctx.translate(1080 * (1 - eased), 0);
          drawImageCover(ctx, nextImg, 1080, 1920, 1, 1);
          ctx.restore();
        } else if (slide.transition === "zoom-in") {
          const zoomScale = 1 + eased * 0.5;
          drawImageCover(ctx, nextImg, 1080, 1920, zoomScale, eased);
        } else if (slide.transition === "scale-up") {
          ctx.globalAlpha = eased;
          const s = 0.8 + eased * 0.2;
          ctx.save();
          ctx.translate(540 * (1 - s), 960 * (1 - s));
          ctx.scale(s, s);
          drawImageCover(ctx, nextImg, 1080, 1920, 1, 1);
          ctx.restore();
          ctx.globalAlpha = 1;
        } else {
          // fade default
          drawImageCover(ctx, nextImg, 1080, 1920, 1, eased);
        }
      }

      // Overlay gradient
      const grad = ctx.createLinearGradient(0, 1920 * 0.5, 0, 1920);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, "rgba(0,0,0,0.7)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1920);

      // Text (only during main display, not transition)
      if (transT < 0.5) {
        const textAlpha = transT < 0.3 ? 1 : 1 - (transT - 0.3) / 0.2;
        ctx.globalAlpha = Math.min(1, t * 5) * textAlpha;

        // Destination name
        ctx.font = "bold 72px 'Syne', sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "left";
        ctx.fillText(slide.name, 80, 1620);

        // Caption
        ctx.font = "italic 36px 'Space Grotesk', sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.fillText(`"${slide.caption}"`, 80, 1680);

        // Stickers
        ctx.font = "28px sans-serif";
        slide.stickers.forEach((sticker, si) => {
          ctx.fillStyle = "rgba(255,255,255,0.5)";
          ctx.fillText(sticker, 80 + si * 200, 1740);
        });

        ctx.globalAlpha = 1;
      }

      // Watermark
      ctx.globalAlpha = 0.15;
      ctx.font = "bold 28px 'Syne', sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "right";
      ctx.fillText("TREVA", 1000, 100);
      ctx.globalAlpha = 1;
      ctx.textAlign = "left";

      // Frame delay
      await new Promise((r) => setTimeout(r, 1000 / fps));
      onProgress?.(((si * totalFrames + f) / (slides.length * totalFrames)) * 100);
    }
  }

  // Outro frame with Treva logo
  for (let f = 0; f < 3 * fps; f++) {
    ctx.fillStyle = "#0d1117";
    ctx.fillRect(0, 0, 1080, 1920);

    const t = f / (3 * fps);
    ctx.globalAlpha = Math.min(1, t * 3);

    // Draw logo centered
    const logoMaxW = 600;
    const logoRatio = trevaLogo.height / trevaLogo.width;
    const logoW = logoMaxW;
    const logoH = logoW * logoRatio;
    const logoX = (1080 - logoW) / 2;
    const logoY = (1920 - logoH) / 2;
    ctx.drawImage(trevaLogo, logoX, logoY, logoW, logoH);

    ctx.globalAlpha = 1;
    await new Promise((r) => setTimeout(r, 1000 / fps));
  }

  onProgress?.(100);
  recorder.stop();
  return done;
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cw: number,
  ch: number,
  scale: number,
  alpha: number
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const ratio = Math.max(cw / img.width, ch / img.height) * scale;
  const w = img.width * ratio;
  const h = img.height * ratio;
  ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  ctx.restore();
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
