# Performance Optimizations & Monitoring

This document provides comprehensive information about the performance optimizations and monitoring capabilities built into `@logistically/events-nestjs`.

## Overview

The library includes enterprise-grade performance optimizations designed for production environments with high event throughput and low latency requirements. These optimizations are automatically enabled when `autoDiscovery: true` is configured.

## Built-in Performance Features

### 1. Intelligent Discovery Loop

**Problem Solved**: Continuous polling timers running every second, even when idle.

**Solution**: Event-driven processing with conditional timers.

```typescript
// Before: Continuous timer running every 1000ms
setInterval(async () => {
  await this.processDiscoveryQueue();
}, 1000);

// After: Conditional timer only when there's work
private startDiscoveryLoop(): void {
  if (this.discoveryQueue.length > 0 && !this.discoveryTimer) {
    this.discoveryTimer = setInterval(async () => {
      if (this.discoveryQueue.length > 0 && !this.isProcessing) {
        await this.processDiscoveryQueue();
      }
    }, 1000);
  }
}
```

**Benefits**:
- Eliminates unnecessary CPU cycles during idle periods
- Automatic cleanup when queue is empty
- Prevents resource waste in long-running applications

### 2. Metadata Caching System

**Problem Solved**: Repeated scanning of ALL methods on every call.

**Solution**: TTL-based caching with WeakMap implementation.

```typescript
// Cache configuration
private readonly metadataCache = new WeakMap<any, CachedMetadata>();
private readonly cacheTTL = 5 * 60 * 1000; // 5 minutes

// Cache structure
interface CachedMetadata {
  handlers: EventHandlerMetadata[];
  hasHandlers: boolean;
  eventTypes: string[];
  timestamp: number;
}
```

**Features**:
- **5-minute TTL** for automatic cache expiration
- **WeakMap implementation** for automatic memory management
- **Cache hit rate tracking** for performance monitoring
- **Graceful degradation** when cache is invalid

**Performance Impact**:
- **First call**: Full method scanning (cache miss)
- **Subsequent calls**: Instant metadata retrieval (cache hit)
- **Typical improvement**: 10-100x faster for repeated operations

### 3. Batch Processing

**Problem Solved**: Processing discovery queue items one by one.

**Solution**: Configurable batch processing with chunking.

```typescript
// Batch processing configuration
private readonly batchSize = 10;

// Process items in batches
private async processDiscoveryQueue(): Promise<void> {
  const items = this.discoveryQueue.splice(0, this.batchSize);
  const chunks = this.chunkArray(items, this.batchSize);
  
  for (const chunk of chunks) {
    await Promise.all(chunk.map(item => this.processDiscoveryItem(item)));
  }
}
```

**Benefits**:
- More efficient resource utilization
- Reduced overhead per operation
- Better handling of large discovery queues
- Configurable batch sizes for different environments

### 4. Exponential Backoff Retry Strategy

**Problem Solved**: Fixed delay retries causing thundering herd problems.

**Solution**: Intelligent exponential backoff with configurable limits.

```typescript
// Retry configuration
private readonly maxRetries = 3;
private readonly baseRetryDelay = 100; // ms

// Exponential backoff calculation
private calculateRetryDelay(attempt: number): number {
  return Math.min(
    this.baseRetryDelay * Math.pow(2, attempt),
    5000 // Max 5 seconds
  );
}
```

**Benefits**:
- Prevents cascading failures in distributed systems
- Reduces system load during temporary outages
- Configurable retry limits and delays
- Better error recovery patterns

### 5. Resource Management

**Problem Solved**: Potential memory leaks with timers and intervals.

**Solution**: Proper lifecycle management with NestJS hooks.

```typescript
export class EventDiscoveryService implements OnModuleInit, OnModuleDestroy {
  private discoveryTimer?: NodeJS.Timeout;
  
  onModuleDestroy() {
    if (this.discoveryTimer) {
      clearInterval(this.discoveryTimer);
      this.discoveryTimer = undefined;
    }
  }
}
```

**Benefits**:
- Automatic cleanup on module destruction
- Prevents memory leaks in long-running applications
- Proper resource lifecycle management
- Integration with NestJS application lifecycle

## Performance Monitoring Service

The `PerformanceMonitorService` provides comprehensive real-time monitoring and automatic performance warnings.

### Service Overview

```typescript
@Injectable()
export class PerformanceMonitorService implements OnModuleInit {
  constructor(
    private readonly metadataExplorer: EventMetadataExplorer,
    private readonly eventDiscoveryService: EventDiscoveryService,
  ) {}
}
```

**Availability**: Automatically included when `autoDiscovery: true` is configured.

### Performance Metrics

#### Cache Performance
```typescript
cache: {
  hits: number;      // Successful cache retrievals
  misses: number;    // Cache misses requiring fresh scans
  hitRate: number;   // Percentage of cache hits (0-100)
}
```

#### Discovery Efficiency
```typescript
discovery: {
  pending: number;           // Items waiting in discovery queue
  registered: number;        // Successfully registered event handlers
  retryCount: number;        // Total retry attempts
  processingTime: number;    // Average processing time per batch (ms)
}
```

#### Memory Usage
```typescript
memory: {
  heapUsed: number;   // Current heap usage in MB
  heapTotal: number;  // Total heap allocated in MB
  external: number;   // External memory usage in MB
}
```

#### Timing Information
```typescript
timing: {
  lastDiscoveryRun: number;      // Timestamp of last discovery run
  averageProcessingTime: number; // Average processing time in ms
  totalRuns: number;            // Total discovery runs completed
}
```

### Performance Warnings

The service automatically logs warnings for potential performance issues:

#### Low Cache Hit Rate
```typescript
// Warning when cache hit rate < 50%
if (metrics.cache.hitRate < 50) {
  this.logger.warn(`Low cache hit rate: ${metrics.cache.hitRate}%`);
}
```

#### High Memory Usage
```typescript
// Warning when heap usage > 100MB
if (metrics.memory.heapUsed > 100) {
  this.logger.warn(`High memory usage: ${metrics.memory.heapUsed}MB`);
}
```

#### Slow Discovery Processing
```typescript
// Warning when processing time > 1000ms
if (metrics.discovery.processingTime > 1000) {
  this.logger.warn(`Slow discovery processing: ${metrics.discovery.processingTime}ms`);
}
```

#### Excessive Retry Attempts
```typescript
// Warning when retry count > 10
if (metrics.discovery.retryCount > 10) {
  this.logger.warn(`High retry count: ${metrics.discovery.retryCount}`);
}
```

### Usage Examples

#### Basic Monitoring
```typescript
@Injectable()
export class MyService {
  constructor(private readonly performanceMonitor: PerformanceMonitorService) {}
  
  async checkPerformance() {
    const metrics = this.performanceMonitor.getMetrics();
    console.log('Cache hit rate:', metrics.cache.hitRate + '%');
    console.log('Memory usage:', metrics.memory.heapUsed + 'MB');
  }
}
```

#### Performance Recommendations
```typescript
async getOptimizationTips() {
  const recommendations = this.performanceMonitor.getRecommendations();
  recommendations.forEach(tip => console.log('Tip:', tip));
}
```

#### Performance Summary
```typescript
async logPerformanceSummary() {
  const summary = this.performanceMonitor.getPerformanceSummary();
  this.logger.log(summary);
}
```

## Configuration for Performance

### Enable Performance Monitoring

```typescript
EventsModule.forRoot({
  service: 'high-performance-app',
  autoDiscovery: true, // Required for performance monitoring
  
  // Performance-focused transport configuration
  transports: new Map([
    ['redis', new RedisStreamsPlugin().createTransport({
      enablePublisherBatching: true,
      maxBatchSize: 1000,
      maxWaitMs: 50
    })]
  ])
})
```

### Publisher Performance Settings

```typescript
publisher: {
  batching: {
    enabled: true,
    maxSize: 1000,    // Maximum events per batch
    maxWaitMs: 50     // Maximum wait time for batch completion
  },
  retry: {
    enabled: true,
    maxAttempts: 3    // Maximum retry attempts
  }
}
```

### Consumer Performance Settings

```typescript
consumer: {
  enablePatternRouting: true,    // Enable pattern-based routing
  enableConsumerGroups: true,    // Enable consumer groups for scaling
  batchSize: 100,               // Events per consumer batch
  maxWaitMs: 100                // Maximum wait for batch completion
}
```

## Performance Tuning

### Cache TTL Adjustment

For applications with frequent service restarts, consider reducing cache TTL:

```typescript
// In EventMetadataExplorer
private readonly cacheTTL = 2 * 60 * 1000; // 2 minutes instead of 5
```

### Batch Size Optimization

Adjust batch sizes based on your event volume:

```typescript
// High volume: Larger batches
private readonly batchSize = 50;

// Low volume: Smaller batches
private readonly batchSize = 5;
```

### Retry Strategy Tuning

Customize retry behavior for your environment:

```typescript
// Aggressive retries for development
private readonly maxRetries = 5;
private readonly baseRetryDelay = 50;

// Conservative retries for production
private readonly maxRetries = 3;
private readonly baseRetryDelay = 200;
```

## Monitoring in Production

### Log Aggregation

The performance monitoring service logs metrics every 5 minutes. Ensure these logs are captured by your logging infrastructure:

```typescript
// Example log output
[PerformanceMonitorService] Performance Summary (uptime: 3600s):
  Cache: 85% hit rate (850/1000)
  Discovery: 150 registered, 0 pending
  Memory: 45.2MB used / 64MB total
  Processing: 12.5ms average (120 runs)
```

### Metrics Collection

Consider integrating with external monitoring systems:

```typescript
// Export metrics to Prometheus, DataDog, etc.
setInterval(() => {
  const metrics = this.performanceMonitor.getMetrics();
  this.metricsExporter.record('cache_hit_rate', metrics.cache.hitRate);
  this.metricsExporter.record('memory_usage_mb', metrics.memory.heapUsed);
}, 60000); // Every minute
```

### Alerting

Set up alerts based on performance thresholds:

```typescript
// Alert on critical performance issues
if (metrics.cache.hitRate < 20) {
  await this.alertingService.sendAlert('Critical: Very low cache hit rate');
}

if (metrics.memory.heapUsed > 500) {
  await this.alertingService.sendAlert('Critical: High memory usage');
}
```

## Best Practices

### 1. Enable Performance Monitoring
Always set `autoDiscovery: true` in production to get performance insights.

### 2. Monitor Cache Performance
Low cache hit rates indicate inefficient metadata scanning or frequent service restarts.

### 3. Set Appropriate Batch Sizes
Balance between memory usage and processing efficiency based on your event volume.

### 4. Configure Retry Strategies
Use conservative retry settings in production to prevent cascading failures.

### 5. Regular Performance Reviews
Monitor performance metrics regularly and adjust configuration as needed.

### 6. Resource Cleanup
Ensure proper cleanup in your application lifecycle to prevent memory leaks.

## Troubleshooting Performance Issues

### High Memory Usage
1. Check if cache TTL is appropriate for your restart frequency
2. Monitor for memory leaks in long-running services
3. Consider reducing batch sizes if memory is constrained

### Low Cache Hit Rate
1. Verify services aren't being recreated unnecessarily
2. Check if cache TTL is too short for your use case
3. Monitor service lifecycle and dependency injection patterns

### Slow Discovery Processing
1. Review batch size configuration
2. Check for blocking operations in event handlers
3. Monitor system resources (CPU, memory, I/O)

### High Retry Counts
1. Investigate underlying transport issues
2. Adjust retry strategy parameters
3. Check network connectivity and transport health

## Conclusion

The performance optimizations in `@logistically/events-nestjs` provide enterprise-grade performance characteristics suitable for high-throughput production environments. By enabling performance monitoring and following the best practices outlined in this document, you can achieve optimal performance and maintain system health in production.

For additional performance optimization strategies and benchmarks, refer to the core `@logistically/events` library documentation.
