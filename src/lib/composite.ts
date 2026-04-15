// Client-side canvas compositing for shareable frame images
// Matches the FrameCard design: pink gradient header, white card, rounded images

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

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export async function generateComposite(
  options: CompositeOptions
): Promise<Blob> {
  const { images, title, watermark } = options;

  const loadedImages = await Promise.all(
    images.map((img) => loadImage(img.url))
  );

  // Layout
  const imageCount = loadedImages.length;
  const imageWidth = imageCount === 1 ? 600 : imageCount === 2 ? 480 : 380;
  const aspectRatio = 3 / 4;
  const imageHeight = Math.round(imageWidth / aspectRatio);
  const imageGap = 10;
  const cardPadding = 16;
  const headerHeight = 56;
  const cardRadius = 20;
  const imageRadius = 12;
  const outerPadding = 24;

  const cardInnerWidth =
    imageWidth * imageCount + imageGap * (imageCount - 1) + cardPadding * 2;
  const cardInnerHeight = headerHeight + imageHeight + cardPadding;
  const canvasWidth = cardInnerWidth + outerPadding * 2;
  const canvasHeight = cardInnerHeight + outerPadding * 2;

  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d")!;

  // Page background (sand)
  ctx.fillStyle = "#f5f0eb";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Card background (white with border)
  const cardX = outerPadding;
  const cardY = outerPadding;
  ctx.save();
  roundRect(ctx, cardX, cardY, cardInnerWidth, cardInnerHeight, cardRadius);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "#faf4e8"; // cream-200
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  // Header gradient (peach-100 to rose-100)
  // Clip to top of card with rounded top corners
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cardX + cardRadius, cardY);
  ctx.lineTo(cardX + cardInnerWidth - cardRadius, cardY);
  ctx.quadraticCurveTo(
    cardX + cardInnerWidth,
    cardY,
    cardX + cardInnerWidth,
    cardY + cardRadius
  );
  ctx.lineTo(cardX + cardInnerWidth, cardY + headerHeight);
  ctx.lineTo(cardX, cardY + headerHeight);
  ctx.lineTo(cardX, cardY + cardRadius);
  ctx.quadraticCurveTo(cardX, cardY, cardX + cardRadius, cardY);
  ctx.closePath();

  const gradient = ctx.createLinearGradient(
    cardX,
    cardY,
    cardX + cardInnerWidth,
    cardY
  );
  gradient.addColorStop(0, "#fdeee8"); // peach-100
  gradient.addColorStop(1, "#fce8ed"); // rose-100
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.restore();

  // Title text (left aligned in header)
  ctx.fillStyle = "#1f2937"; // gray-800
  ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(
    title,
    cardX + cardPadding + 4,
    cardY + headerHeight / 2 + 8
  );

  // Draw images
  loadedImages.forEach((img, index) => {
    const x = cardX + cardPadding + index * (imageWidth + imageGap);
    const y = cardY + headerHeight;

    // Rounded rect clip for image
    ctx.save();
    roundRect(ctx, x, y, imageWidth, imageHeight, imageRadius);
    ctx.clip();

    // Object-cover
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
    ctx.font = "13px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.textAlign = "right";
    ctx.fillText(
      "milestonemirror.com",
      cardX + cardInnerWidth - cardPadding,
      cardY + cardInnerHeight - 6
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
