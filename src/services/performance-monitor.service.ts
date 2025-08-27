import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventMetadataExplorer } from './event-metadata-explorer.service';
import { EventDiscoveryService } from './event-discovery.service';

export interface PerformanceMetrics {
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
  };
  discovery: {
    pending: number;
    registered: number;
    retryCount: number;
    processingTime: number;
  };
  memory: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  timing: {
    lastDiscoveryRun: number;
    averageProcessingTime: number;
    totalRuns: number;
  };
}

@Injectable()
export class PerformanceMonitorService implements OnModuleInit {
  private readonly logger = new Logger(PerformanceMonitorService.name);
  private readonly startTime = Date.now();
  private processingTimes: number[] = [];
  private lastDiscoveryRun = 0;

  constructor(
    private readonly metadataExplorer: EventMetadataExplorer,
    private readonly eventDiscoveryService: EventDiscoveryService,
  ) {}

  async onModuleInit() {
    this.logger.log('PerformanceMonitorService initialized');
    
    // Start periodic performance reporting
    this.startPerformanceReporting();
  }

  /**
   * Get comprehensive performance metrics
   */
  getMetrics(): PerformanceMetrics {
    const cacheStats = this.metadataExplorer.getCacheStats();
    const discoveryStats = this.eventDiscoveryService.getDiscoveryStats();
    const memoryUsage = process.memoryUsage();
    
    const avgProcessingTime = this.processingTimes.length > 0 
      ? this.processingTimes.reduce((a, b) => a + b, 0) / this.processingTimes.length 
      : 0;

    return {
      cache: {
        hits: cacheStats.hits,
        misses: cacheStats.misses,
        hitRate: cacheStats.hitRate,
      },
      discovery: {
        pending: discoveryStats.pending,
        registered: discoveryStats.registered,
        retryCount: discoveryStats.retryCount,
        processingTime: avgProcessingTime,
      },
      memory: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100, // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100, // MB
        external: Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100, // MB
      },
      timing: {
        lastDiscoveryRun: this.lastDiscoveryRun,
        averageProcessingTime: Math.round(avgProcessingTime * 100) / 100,
        totalRuns: this.processingTimes.length,
      },
    };
  }

  /**
   * Record processing time for performance tracking
   */
  recordProcessingTime(processingTime: number): void {
    this.processingTimes.push(processingTime);
    
    // Keep only last 100 measurements to prevent memory bloat
    if (this.processingTimes.length > 100) {
      this.processingTimes = this.processingTimes.slice(-100);
    }
  }

  /**
   * Record discovery run completion
   */
  recordDiscoveryRun(): void {
    this.lastDiscoveryRun = Date.now();
  }

  /**
   * Get performance summary for logging
   */
  getPerformanceSummary(): string {
    const metrics = this.getMetrics();
    const uptime = Math.round((Date.now() - this.startTime) / 1000);
    
    return `Performance Summary (uptime: ${uptime}s):
  Cache: ${metrics.cache.hitRate}% hit rate (${metrics.cache.hits}/${metrics.cache.hits + metrics.cache.misses})
  Discovery: ${metrics.discovery.registered} registered, ${metrics.discovery.pending} pending
  Memory: ${metrics.memory.heapUsed}MB used / ${metrics.memory.heapTotal}MB total
  Processing: ${metrics.timing.averageProcessingTime}ms average (${metrics.timing.totalRuns} runs)`;
  }

  /**
   * Start periodic performance reporting
   */
  private startPerformanceReporting(): void {
    // Report performance every 5 minutes
    setInterval(() => {
      const summary = this.getPerformanceSummary();
      this.logger.log(summary);
      
      // Log warnings for potential performance issues
      this.checkPerformanceWarnings();
    }, 5 * 60 * 1000);
  }

  /**
   * Check for performance warnings and log them
   */
  private checkPerformanceWarnings(): void {
    const metrics = this.getMetrics();
    
    // Cache hit rate warning
    if (metrics.cache.hitRate < 50) {
      this.logger.warn(`Low cache hit rate: ${metrics.cache.hitRate}%. Consider pre-warming cache for frequently accessed services.`);
    }
    
    // Memory usage warning
    if (metrics.memory.heapUsed > metrics.memory.heapTotal * 0.8) {
      this.logger.warn(`High memory usage: ${metrics.memory.heapUsed}MB / ${metrics.memory.heapTotal}MB. Consider monitoring for memory leaks.`);
    }
    
    // Processing time warning
    if (metrics.discovery.processingTime > 1000) {
      this.logger.warn(`Slow discovery processing: ${metrics.discovery.processingTime}ms average. Consider optimizing service registration.`);
    }
    
    // Retry count warning
    if (metrics.discovery.retryCount > 10) {
      this.logger.warn(`High retry count: ${metrics.discovery.retryCount}. Check for service registration issues.`);
    }
  }

  /**
   * Reset performance metrics (useful for testing)
   */
  resetMetrics(): void {
    this.processingTimes = [];
    this.lastDiscoveryRun = 0;
    this.logger.log('Performance metrics reset');
  }

  /**
   * Get performance recommendations based on current metrics
   */
  getRecommendations(): string[] {
    const metrics = this.getMetrics();
    const recommendations: string[] = [];
    
    if (metrics.cache.hitRate < 50) {
      recommendations.push('Consider pre-warming cache for frequently accessed services');
    }
    
    if (metrics.discovery.processingTime > 1000) {
      recommendations.push('Consider optimizing service registration with batching');
    }
    
    if (metrics.discovery.retryCount > 10) {
      recommendations.push('Investigate service registration failures and retry logic');
    }
    
    if (metrics.memory.heapUsed > metrics.memory.heapTotal * 0.8) {
      recommendations.push('Monitor memory usage and consider implementing memory cleanup');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Performance is within acceptable ranges');
    }
    
    return recommendations;
  }
}
