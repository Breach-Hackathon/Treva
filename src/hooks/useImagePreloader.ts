import { useEffect, useState } from "react";

export const useImagePreloader = (path: string, totalFrames: number) => {
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const loadedImages: HTMLImageElement[] = new Array(totalFrames);
    let loadedCount = 0;

    const loadBatch = async (start: number, batchSize: number) => {
      const promises = [];
      for (let i = start; i < start + batchSize && i <= totalFrames; i++) {
        promises.push(
          new Promise<void>((resolve) => {
            const img = new Image();
            
            const onload = () => {
              if (cancelled) return resolve();
              loadedImages[i - 1] = img;
              loadedCount++;
              resolve();
            };

            const onerror = () => {
              if (cancelled) return resolve();
              // Still resolve to keep moving forward even if an image fails
              loadedCount++;
              resolve();
            };

            img.onload = onload;
            img.onerror = onerror;
            img.src = `${path}/${i.toString().padStart(3, "0")}.jpg`;
          })
        );
      }

      await Promise.all(promises);
      
      if (cancelled) return;
      
      setProgress(Math.floor((loadedCount / totalFrames) * 100));
      setImages([...loadedImages.filter(Boolean)]);

      if (start + batchSize <= totalFrames) {
        // Load next batch smoothly
        requestAnimationFrame(() => loadBatch(start + batchSize, batchSize));
      }
    };

    // Load in batches of 15 to stay within browser concurrent limit rules
    loadBatch(1, 15);

    return () => {
      cancelled = true;
    };
  }, [path, totalFrames]);

  return { images, progress };
};

