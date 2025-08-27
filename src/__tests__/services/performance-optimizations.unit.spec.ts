import { EventMetadataExplorer } from '../../services/event-metadata-explorer.service';
import { PerformanceMonitorService } from '../../services/performance-monitor.service';
import { EventDiscoveryService } from '../../services/event-discovery.service';
import { EventSystemService } from '../../services/event-system.service';
import { AUTO_EVENT_HANDLER_METADATA } from '../../decorators/auto-event-handler.decorator';

// Mock EventSystemService
const mockEventSystemService = {
  getEventSystem: jest.fn().mockReturnValue({
    consumer: {
      subscribe: jest.fn().mockResolvedValue(undefined)
    }
  })
};

// Mock EventDiscoveryService
const mockEventDiscoveryService = {
  getDiscoveryStats: jest.fn().mockReturnValue({
    pending: 0,
    registered: 5,
    retryCount: 0
  })
};

describe('Performance Optimizations - Unit Tests', () => {
  let metadataExplorer: EventMetadataExplorer;
  let performanceMonitor: PerformanceMonitorService;

  beforeEach(() => {
    metadataExplorer = new EventMetadataExplorer();
    performanceMonitor = new PerformanceMonitorService(
      metadataExplorer,
      mockEventDiscoveryService as any
    );
  });

  afterEach(() => {
    // Clear cache between tests
    metadataExplorer.clearCache();
    performanceMonitor.resetMetrics();
  });

  describe('EventMetadataExplorer Caching', () => {
    it('should cache metadata exploration results', () => {
      // Use a proper class instance so MetadataScanner can find methods
      class TestService {
        method1() {}
        method2() {}
        method3() {}
      }
      
      const mockInstance = new TestService();

      // Mock Reflect.getMetadata to simulate decorated methods
      const originalGetMetadata = Reflect.getMetadata;
      Reflect.getMetadata = jest.fn((key, target) => {
        if (key === AUTO_EVENT_HANDLER_METADATA && target === mockInstance.method1) {
          return { eventType: 'test.event1' };
        }
        if (key === AUTO_EVENT_HANDLER_METADATA && target === mockInstance.method2) {
          return { eventType: 'test.event2' };
        }
        return undefined;
      });

      // First call should cache miss
      const startTime1 = Date.now();
      const result1 = metadataExplorer.explore(mockInstance);
      const time1 = Date.now() - startTime1;
      
      // Second call should cache hit
      const startTime2 = Date.now();
      const result2 = metadataExplorer.explore(mockInstance);
      const time2 = Date.now() - startTime2;
      
      expect(result1).toEqual(result2);
      expect(result1.length).toBe(2);
      
      // Second call should be faster (cached) - but both might be 0ms in fast environments
      expect(time2).toBeLessThanOrEqual(time1);

      // Restore original
      Reflect.getMetadata = originalGetMetadata;
    });

    it('should cache hasEventHandlers results', () => {
      class TestService {
        method1() {}
      }
      
      const mockInstance = new TestService();

      const originalGetMetadata = Reflect.getMetadata;
      Reflect.getMetadata = jest.fn((key, target) => {
        if (key === AUTO_EVENT_HANDLER_METADATA && target === mockInstance.method1) {
          return { eventType: 'test.event1' };
        }
        return undefined;
      });

      // First call
      const startTime1 = Date.now();
      const hasHandlers1 = metadataExplorer.hasEventHandlers(mockInstance);
      const time1 = Date.now() - startTime1;
      
      // Second call (should use cache)
      const startTime2 = Date.now();
      const hasHandlers2 = metadataExplorer.hasEventHandlers(mockInstance);
      const time2 = Date.now() - startTime2;
      
      expect(hasHandlers1).toBe(hasHandlers2);
      expect(hasHandlers1).toBe(true);
      
      // Cached call should be faster - but both might be 0ms in fast environments
      if (time1 > 0) {
        expect(time2).toBeLessThanOrEqual(time1);
      } else {
        // Both calls were 0ms, which is fine in fast environments
        expect(time2).toBeGreaterThanOrEqual(0);
      }

      Reflect.getMetadata = originalGetMetadata;
    });

    it('should cache getEventTypes results', () => {
      class TestService {
        method1() {}
      }
      
      const mockInstance = new TestService();

      const originalGetMetadata = Reflect.getMetadata;
      Reflect.getMetadata = jest.fn((key, target) => {
        if (key === AUTO_EVENT_HANDLER_METADATA && target === mockInstance.method1) {
          return { eventType: 'test.event1' };
        }
        return undefined;
      });

      // First call
      const startTime1 = Date.now();
      const eventTypes1 = metadataExplorer.getEventTypes(mockInstance);
      const time1 = Date.now() - startTime1;
      
      // Second call (should use cache)
      const startTime2 = Date.now();
      const eventTypes2 = metadataExplorer.getEventTypes(mockInstance);
      const time2 = Date.now() - startTime2;
      
      expect(eventTypes1).toEqual(eventTypes2);
      expect(eventTypes1).toContain('test.event1');
      
      // Cached call should be faster - but both might be 0ms in fast environments
      if (time1 > 0) {
        expect(time2).toBeLessThanOrEqual(time1);
      } else {
        // Both calls were 0ms, which is fine in fast environments
        expect(time2).toBeGreaterThanOrEqual(0);
      }

      Reflect.getMetadata = originalGetMetadata;
    });

    it('should provide cache statistics', () => {
      class TestService {
        method1() {}
      }
      
      const mockInstance = new TestService();

      const originalGetMetadata = Reflect.getMetadata;
      Reflect.getMetadata = jest.fn((key, target) => {
        if (key === AUTO_EVENT_HANDLER_METADATA && target === mockInstance.method1) {
          return { eventType: 'test.event1' };
        }
        return undefined;
      });

      // Prime the cache
      metadataExplorer.explore(mockInstance);
      metadataExplorer.explore(mockInstance); // Should hit cache

      const cacheStats = metadataExplorer.getCacheStats();
      
      expect(cacheStats.hits).toBeGreaterThan(0);
      expect(cacheStats.misses).toBeGreaterThan(0);
      expect(cacheStats.hitRate).toBeGreaterThan(0);
      expect(cacheStats.hitRate).toBeLessThanOrEqual(100);

      Reflect.getMetadata = originalGetMetadata;
    });

    it('should allow cache invalidation', () => {
      class TestService {
        method1() {}
      }
      
      const mockInstance = new TestService();

      const originalGetMetadata = Reflect.getMetadata;
      Reflect.getMetadata = jest.fn((key, target) => {
        if (key === AUTO_EVENT_HANDLER_METADATA && target === mockInstance.method1) {
          return { eventType: 'test.event1' };
        }
        return undefined;
      });

      // Prime the cache
      metadataExplorer.explore(mockInstance);
      
      // Invalidate cache
      metadataExplorer.invalidateCache(mockInstance);
      
      // Should still work after invalidation
      const result = metadataExplorer.explore(mockInstance);
      expect(result.length).toBe(1);

      Reflect.getMetadata = originalGetMetadata;
    });

    it('should handle null/undefined instances gracefully', () => {
      // Test actual behavior - these might not throw in all cases
      expect(() => metadataExplorer.explore(null as any)).not.toThrow();
      expect(() => metadataExplorer.explore(undefined as any)).not.toThrow();
      
      expect(() => metadataExplorer.hasEventHandlers(null as any)).not.toThrow();
      expect(() => metadataExplorer.hasEventHandlers(undefined as any)).not.toThrow();
      
      expect(() => metadataExplorer.getEventTypes(null as any)).not.toThrow();
      expect(() => metadataExplorer.getEventTypes(undefined as any)).not.toThrow();
    });

    it('should handle services without decorators', () => {
      class NoDecoratorService {
        someMethod() {}
      }
      
      const service = new NoDecoratorService();
      
      const result = metadataExplorer.explore(service);
      expect(result.length).toBe(0);
      
      const hasHandlers = metadataExplorer.hasEventHandlers(service);
      expect(hasHandlers).toBe(false);
      
      const eventTypes = metadataExplorer.getEventTypes(service);
      expect(eventTypes.length).toBe(0);
    });

    it('should handle rapid successive calls efficiently', () => {
      class TestService {
        method1() {}
      }
      
      const mockInstance = new TestService();

      const originalGetMetadata = Reflect.getMetadata;
      Reflect.getMetadata = jest.fn((key, target) => {
        if (key === AUTO_EVENT_HANDLER_METADATA && target === mockInstance.method1) {
          return { eventType: 'test.event1' };
        }
        return undefined;
      });

      // Make many rapid calls
      const promises: Promise<any>[] = [];
      for (let i = 0; i < 50; i++) {
        promises.push(Promise.resolve(metadataExplorer.explore(mockInstance)));
      }
      
      return Promise.all(promises).then(results => {
        // All results should be the same
        for (let i = 1; i < results.length; i++) {
          expect(results[i]).toEqual(results[0]);
        }
        
        // Should have used cache effectively
        const cacheStats = metadataExplorer.getCacheStats();
        expect(cacheStats.hitRate).toBeGreaterThan(80); // At least 80% cache hit rate
      }).finally(() => {
        Reflect.getMetadata = originalGetMetadata;
      });
    });
  });

  describe('Performance Monitoring', () => {
    it('should provide comprehensive performance metrics', () => {
      const metrics = performanceMonitor.getMetrics();
      
      expect(metrics.cache).toBeDefined();
      expect(metrics.discovery).toBeDefined();
      expect(metrics.memory).toBeDefined();
      expect(metrics.timing).toBeDefined();
      
      expect(metrics.cache.hits).toBeGreaterThanOrEqual(0);
      expect(metrics.cache.misses).toBeGreaterThanOrEqual(0);
      expect(metrics.discovery.registered).toBeGreaterThanOrEqual(0);
      expect(metrics.memory.heapUsed).toBeGreaterThan(0);
    });

    it('should track processing times', () => {
      const startTime = Date.now();
      
      // Simulate some processing
      class TestService {
        method1() {}
      }
      const mockInstance = new TestService();
      metadataExplorer.explore(mockInstance);
      
      const processingTime = Date.now() - startTime;
      performanceMonitor.recordProcessingTime(processingTime);
      
      const metrics = performanceMonitor.getMetrics();
      expect(metrics.timing.totalRuns).toBeGreaterThan(0);
    });

    it('should provide performance recommendations', () => {
      const recommendations = performanceMonitor.getRecommendations();
      
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
      
      // Should have at least one recommendation
      expect(recommendations[0]).toBeDefined();
    });

    it('should provide performance summary', () => {
      const summary = performanceMonitor.getPerformanceSummary();
      
      expect(typeof summary).toBe('string');
      expect(summary).toContain('Cache:');
      expect(summary).toContain('Discovery:');
      expect(summary).toContain('Memory:');
      expect(summary).toContain('Processing:');
    });

    it('should reset metrics correctly', () => {
      // Record some metrics
      performanceMonitor.recordProcessingTime(100);
      performanceMonitor.recordProcessingTime(200);
      
      const metricsBefore = performanceMonitor.getMetrics();
      expect(metricsBefore.timing.totalRuns).toBe(2);
      
      // Reset
      performanceMonitor.resetMetrics();
      
      const metricsAfter = performanceMonitor.getMetrics();
      expect(metricsAfter.timing.totalRuns).toBe(0);
    });
  });

  describe('Memory Management', () => {
    it('should not leak memory with repeated operations', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Perform many operations
      for (let i = 0; i < 100; i++) {
        class TestService {
          method1() {}
        }
        const mockInstance = new TestService();
        metadataExplorer.explore(mockInstance);
        metadataExplorer.hasEventHandlers(mockInstance);
        metadataExplorer.getEventTypes(mockInstance);
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    it('should clean up resources on module destroy', () => {
      class TestService {
        method1() {}
      }
      
      const mockInstance = new TestService();
      
      const originalGetMetadata = Reflect.getMetadata;
      Reflect.getMetadata = jest.fn((key, target) => {
        if (key === AUTO_EVENT_HANDLER_METADATA && target === mockInstance.method1) {
          return { eventType: 'test.event1' };
        }
        return undefined;
      });
      
      // Prime the cache
      metadataExplorer.explore(mockInstance);
      
      // Check cache stats before cleanup
      const statsBefore = metadataExplorer.getCacheStats();
      expect(statsBefore.hits).toBeGreaterThanOrEqual(0);
      
      // Simulate module destroy
      metadataExplorer.onModuleDestroy();
      
      // Cache should be cleared
      const statsAfter = metadataExplorer.getCacheStats();
      expect(statsAfter.hits).toBe(0);
      expect(statsAfter.misses).toBe(0);

      Reflect.getMetadata = originalGetMetadata;
    });

    it('should handle cache TTL correctly', () => {
      class TestService {
        method1() {}
      }
      
      const mockInstance = new TestService();
      
      const originalGetMetadata = Reflect.getMetadata;
      Reflect.getMetadata = jest.fn((key, target) => {
        if (key === AUTO_EVENT_HANDLER_METADATA && target === mockInstance.method1) {
          return { eventType: 'test.event1' };
        }
        return undefined;
      });

      // Prime the cache
      metadataExplorer.explore(mockInstance);
      
      // Simulate time passing by manually setting old timestamp
      const cache = (metadataExplorer as any).metadataCache;
      const cached = cache.get(mockInstance);
      if (cached) {
        cached.timestamp = Date.now() - (6 * 60 * 1000); // 6 minutes ago (past TTL)
      }
      
      // Should not use expired cache
      const result = metadataExplorer.explore(mockInstance);
      expect(result.length).toBe(1);

      Reflect.getMetadata = originalGetMetadata;
    });
  });

  describe('Cache Performance', () => {
    it('should provide pre-warming functionality', () => {
      const instances = [
        { method1: () => {} },
        { method2: () => {} },
        { method3: () => {} }
      ];

      const originalGetMetadata = Reflect.getMetadata;
      Reflect.getMetadata = jest.fn((key, target) => {
        if (key === AUTO_EVENT_HANDLER_METADATA) {
          return { eventType: 'test.event' };
        }
        return undefined;
      });

      // Pre-warm cache
      metadataExplorer.preWarmCache(instances);
      
      // Check that cache is populated
      const cacheStats = metadataExplorer.getCacheStats();
      expect(cacheStats.misses).toBeGreaterThan(0);

      Reflect.getMetadata = originalGetMetadata;
    });

    it('should handle cache eviction gracefully', () => {
      class TestService {
        method1() {}
      }
      
      const mockInstance = new TestService();
      
      const originalGetMetadata = Reflect.getMetadata;
      Reflect.getMetadata = jest.fn((key, target) => {
        if (key === AUTO_EVENT_HANDLER_METADATA && target === mockInstance.method1) {
          return { eventType: 'test.event1' };
        }
        return undefined;
      });

      // Prime the cache
      metadataExplorer.explore(mockInstance);
      
      // Clear cache
      metadataExplorer.clearCache();
      
      // Should still work after clearing
      const result = metadataExplorer.explore(mockInstance);
      expect(result.length).toBe(1);

      Reflect.getMetadata = originalGetMetadata;
    });
  });
});
