// Client-side canvas compositing for shareable frame images

interface CompositeOptions {
  images: { url: string }[];
  title: string;
  watermark: boolean;
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);

    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error(`Failed to load image: ${url}`));
      };
      img.src = objectUrl;
    });
  } catch {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }
}

export async function generateComposite(
  options: CompositeOptions
): Promise<Blob> {
  const { images, title, watermark } = options;

  const loadedImages = await Promise.all(
    images.map((img) => loadImage(img.url))
  );

  // Layout constants
  const titleBarHeight = 72;
  const padding = 16;
  const gap = 12;
  const maxImageHeight = 800;
  const aspectRatio = 3 / 4;

  const imageCount = loadedImages.length;
  const imageWidth = imageCount === 1 ? 600 : imageCount === 2 ? 500 : 400;
  const imageHeight = Math.min(
    Math.round(imageWidth / aspectRatio),
    maxImageHeight
  );
  const canvasWidth =
    padding * 2 + imageWidth * imageCount + gap * (imageCount - 1);
  const canvasHeight = titleBarHeight + imageHeight + padding;

  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = "#faf8f5";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Title
  ctx.fillStyle = "#1a1a1a";
  ctx.font = "bold 28px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(title, canvasWidth / 2, titleBarHeight - 20);

  // Draw images
  loadedImages.forEach((img, index) => {
    const x = padding + index * (imageWidth + gap);
    const y = titleBarHeight;

    // Rounded rect clip
    const radius = 12;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + imageWidth - radius, y);
    ctx.quadraticCurveTo(x + imageWidth, y, x + imageWidth, y + radius);
    ctx.lineTo(x + imageWidth, y + imageHeight - radius);
    ctx.quadraticCurveTo(
      x + imageWidth,
      y + imageHeight,
      x + imageWidth - radius,
      y + imageHeight
    );
    ctx.lineTo(x + radius, y + imageHeight);
    ctx.quadraticCurveTo(x, y + imageHeight, x, y + imageHeight - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.clip();

    // Object-cover behavior
    const imgAspect = img.width / img.height;
    const slotAspect = imageWidth / imageHeight;
    let sx = 0,
      sy = 0,
      sw = img.width,
      sh = img.height;

    if (imgAspect > slotAspect) {
      sw = img.height * slotAspect;
      sx = (img.width - sw) / 2;
    } else {
      sh = img.width / slotAspect;
      sy = (img.height - sh) / 2;
    }

    ctx.drawImage(img, sx, sy, sw, sh, x, y, imageWidth, imageHeight);
    ctx.restore();
  });

  // Watermark
  if (watermark) {
    ctx.font = "14px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.textAlign = "right";
    ctx.fillText(
      "milestonemirror.com",
      canvasWidth - padding - 4,
      canvasHeight - 8
    );
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to generate image"));
      },
      "image/jpeg",
      0.92
    );
  });
}
