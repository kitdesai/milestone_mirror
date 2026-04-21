// Client-side image resizing before upload
// Reduces file size from 2-10MB to ~100-300KB

export async function resizeImage(
  file: File,
  maxDimension = 1200,
  quality = 0.85
): Promise<File> {
  // Only resize image files
  if (!file.type.startsWith("image/")) return file;

  // Load the image
  const img = await loadImageFromFile(file);

  // If already small enough, return original
  if (img.width <= maxDimension && img.height <= maxDimension) return file;

  // Calculate new dimensions maintaining aspect ratio
  let width = img.width;
  let height = img.height;

  if (width > height) {
    height = Math.round((height / width) * maxDimension);
    width = maxDimension;
  } else {
    width = Math.round((width / height) * maxDimension);
    height = maxDimension;
  }

  // Draw to canvas at new size
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, width, height);

  // Export as JPEG blob
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Failed to resize image"))),
      "image/jpeg",
      quality
    );
  });

  // Return as File with original name (but .jpg extension)
  const name = file.name.replace(/\.[^.]+$/, ".jpg");
  return new File([blob], name, { type: "image/jpeg" });
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}
