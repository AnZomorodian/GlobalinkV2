// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private observers: PerformanceObserver[] = [];

  private constructor() {
    this.initializeObservers();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeObservers() {
    // Observe long tasks
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric('longTask', entry.duration);
          }
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
      } catch (error) {
        console.warn('Long task observer not supported');
      }

      // Observe layout shifts
      try {
        const layoutShiftObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if ((entry as any).value !== undefined) {
              this.recordMetric('layoutShift', (entry as any).value);
            }
          }
        });
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(layoutShiftObserver);
      } catch (error) {
        console.warn('Layout shift observer not supported');
      }
    }
  }

  public recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Keep only last 100 values
    if (values.length > 100) {
      values.shift();
    }
  }

  public getMetric(name: string): { avg: number; max: number; count: number } {
    const values = this.metrics.get(name) || [];
    if (values.length === 0) {
      return { avg: 0, max: 0, count: 0 };
    }

    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const max = Math.max(...values);
    
    return { avg, max, count: values.length };
  }

  public getAllMetrics() {
    const result: Record<string, any> = {};
    for (const [name] of this.metrics) {
      result[name] = this.getMetric(name);
    }
    return result;
  }

  public measureFunction<T>(name: string, fn: () => T): T {
    const start = performance.now();
    try {
      const result = fn();
      const end = performance.now();
      this.recordMetric(name, end - start);
      return result;
    } catch (error) {
      const end = performance.now();
      this.recordMetric(`${name}_error`, end - start);
      throw error;
    }
  }

  public async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const end = performance.now();
      this.recordMetric(name, end - start);
      return result;
    } catch (error) {
      const end = performance.now();
      this.recordMetric(`${name}_error`, end - start);
      throw error;
    }
  }

  public getMemoryUsage() {
    if ((performance as any).memory) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        percentage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100)
      };
    }
    return null;
  }

  public cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Helper hooks for React components
export function usePerformanceMetric(name: string) {
  const monitor = PerformanceMonitor.getInstance();
  
  return {
    record: (value: number) => monitor.recordMetric(name, value),
    measure: <T>(fn: () => T) => monitor.measureFunction(name, fn),
    measureAsync: <T>(fn: () => Promise<T>) => monitor.measureAsyncFunction(name, fn),
    getMetric: () => monitor.getMetric(name)
  };
}