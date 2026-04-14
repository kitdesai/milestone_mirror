// Client-side canvas compositing for shareable frame images

interface CompositeOptions {
  images: { url: string; childName: string }[];
  title: string;
  watermark: boolean;
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  // Try fetching as blob first (works if CORS is configured on R2)
  // Fall back to loading via img tag with crossOrigin
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
    // Fallback: load image directly (may taint canvas on some origins)
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

  // Load all images
  const loadedImages = await Promise.all(
    images.map((img) => loadImage(img.url))
  );

  // Layout constants
  const titleBarHeight = 72;
  const padding = 16;
  const gap = 12;
  const maxImageHeight = 800;
  const aspectRatio = 3 / 4; // Match the app's 3:4 aspect

  // Calculate dimensions
  const imageCount = loadedImages.length;
  const imageWidth = imageCount === 1 ? 600 : 500;
  const imageHeight = Math.min(
    Math.round(imageWidth / aspectRatio),
    maxImageHeight
  );
  const canvasWidth =
    padding * 2 + imageWidth * imageCount + gap * (imageCount - 1);
  const canvasHeight = titleBarHeight + imageHeight + padding;

  // Create canvas
  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = "#faf8f5"; // cream
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Title bar
  ctx.fillStyle = "#1a1a1a";
  ctx.font = "bold 28px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(title, canvasWidth / 2, titleBarHeight - 20);

  // Draw images
  loadedImages.forEach((img, index) => {
    const x = padding + index * (imageWidth + gap);
    const y = titleBarHeight;

    // Draw rounded rect clip
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

    // Draw image with object-cover behavior
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

    // Child name label
    const childName = images[index].childName;
    ctx.font = "500 16px system-ui, -apple-system, sans-serif";
    const textWidth = ctx.measureText(childName).width;
    const labelX = x + 16;
    const labelY = y + imageHeight - 20;
    const labelPadX = 12;
    const labelPadY = 6;

    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    const labelRadius = 14;
    const lx = labelX - labelPadX;
    const ly = labelY - 14 - labelPadY;
    const lw = textWidth + labelPadX * 2;
    const lh = 14 + labelPadY * 2;

    ctx.beginPath();
    ctx.moveTo(lx + labelRadius, ly);
    ctx.lineTo(lx + lw - labelRadius, ly);
    ctx.quadraticCurveTo(lx + lw, ly, lx + lw, ly + labelRadius);
    ctx.lineTo(lx + lw, ly + lh - labelRadius);
    ctx.quadraticCurveTo(lx + lw, ly + lh, lx + lw - labelRadius, ly + lh);
    ctx.lineTo(lx + labelRadius, ly + lh);
    ctx.quadraticCurveTo(lx, ly + lh, lx, ly + lh - labelRadius);
    ctx.lineTo(lx, ly + labelRadius);
    ctx.quadraticCurveTo(lx, ly, lx + labelRadius, ly);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.fillText(childName, labelX, labelY);
  });

  // Watermark for free users
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

  // Export as JPEG
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
