interface PerformanceMetrics {
  totalImages: number;
  loadedImages: number;
  visibleImages: number;
  preloadedImages: number;
  averageLoadTime: number;
  loadTimes: number[];
  errors: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private startTime: number;
  private loadTimes: Map<string, number> = new Map();

  constructor(totalImages: number) {
    this.metrics = {
      totalImages,
      loadedImages: 0,
      visibleImages: 0,
      preloadedImages: 0,
      averageLoadTime: 0,
      loadTimes: [],
      errors: 0
    };
    this.startTime = performance.now();
  }

  startImageLoad(imageId: string): void {
    this.loadTimes.set(imageId, performance.now());
  }

  endImageLoad(imageId: string): void {
    const startTime = this.loadTimes.get(imageId);
    if (startTime) {
      const loadTime = performance.now() - startTime;
      this.metrics.loadTimes.push(loadTime);
      this.metrics.loadedImages++;
      this.updateAverageLoadTime();
      this.loadTimes.delete(imageId);
    }
  }

  setVisibleImages(count: number): void {
    this.metrics.visibleImages = count;
  }

  setPreloadedImages(count: number): void {
    this.metrics.preloadedImages = count;
  }

  recordError(): void {
    this.metrics.errors++;
  }

  private updateAverageLoadTime(): void {
    if (this.metrics.loadTimes.length > 0) {
      const sum = this.metrics.loadTimes.reduce((a, b) => a + b, 0);
      this.metrics.averageLoadTime = sum / this.metrics.loadTimes.length;
    }
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getPerformanceReport(): string {
    const totalTime = performance.now() - this.startTime;
    const loadPercentage = (this.metrics.loadedImages / this.metrics.totalImages) * 100;
    
    return `
Performance Report:
- Total Images: ${this.metrics.totalImages}
- Loaded Images: ${this.metrics.loadedImages} (${loadPercentage.toFixed(1)}%)
- Visible Images: ${this.metrics.visibleImages}
- Preloaded Images: ${this.metrics.preloadedImages}
- Average Load Time: ${this.metrics.averageLoadTime.toFixed(2)}ms
- Errors: ${this.metrics.errors}
- Total Time: ${totalTime.toFixed(2)}ms
    `.trim();
  }

  logReport(): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(this.getPerformanceReport());
    }
  }
}

export { PerformanceMonitor };
export type { PerformanceMetrics }; 