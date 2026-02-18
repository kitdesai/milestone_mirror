"use client";

import * as faceapi from "face-api.js";

let modelsLoaded = false;
let modelsLoading: Promise<void> | null = null;

// Load face detection models
export async function loadFaceDetectionModels(): Promise<void> {
  if (modelsLoaded) return;

  if (modelsLoading) {
    return modelsLoading;
  }

  modelsLoading = (async () => {
    try {
      // Load from public/models directory
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      modelsLoaded = true;
      console.log("Face detection models loaded successfully");
    } catch (error) {
      console.error("Failed to load face detection models:", error);
      throw error;
    }
  })();

  return modelsLoading;
}

// Detect if an image contains at least one face
export async function detectFaces(imageUrl: string): Promise<boolean> {
  await loadFaceDetectionModels();

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = async () => {
      try {
        const detections = await faceapi.detectAllFaces(
          img,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 320,
            scoreThreshold: 0.5,
          })
        );

        resolve(detections.length > 0);
      } catch (error) {
        console.error("Face detection error:", error);
        // If detection fails, assume no face (safer to exclude than include)
        resolve(false);
      }
    };

    img.onerror = () => {
      console.error("Failed to load image for face detection:", imageUrl);
      resolve(false);
    };

    img.src = imageUrl;
  });
}

// Get face count in an image
export async function getFaceCount(imageUrl: string): Promise<number> {
  await loadFaceDetectionModels();

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = async () => {
      try {
        const detections = await faceapi.detectAllFaces(
          img,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 320,
            scoreThreshold: 0.5,
          })
        );

        resolve(detections.length);
      } catch (error) {
        console.error("Face detection error:", error);
        resolve(0);
      }
    };

    img.onerror = () => {
      resolve(0);
    };

    img.src = imageUrl;
  });
}

// Check if models are ready
export function areModelsLoaded(): boolean {
  return modelsLoaded;
}
