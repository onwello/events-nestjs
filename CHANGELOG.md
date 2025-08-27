# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-01-27

### 🚀 **Major Release: Enterprise Performance Optimizations**

This major release introduces enterprise-grade performance optimizations and comprehensive monitoring capabilities, transforming the library into a production-ready solution for high-throughput event processing.

### ⚠️ **Breaking Changes**

- **PerformanceMonitorService** is now conditionally included only when `autoDiscovery: true` is configured
- **Module provider/export counts** have changed due to conditional service inclusion
- **Base providers**: Reduced from 11 to 10 (PerformanceMonitorService moved to autoDiscovery)
- **Base exports**: Reduced from 9 to 8 (PerformanceMonitorService moved to autoDiscovery)

### ✨ **New Features**

#### **Performance Optimizations**
- **Intelligent Discovery Loop**: Event-driven processing instead of continuous polling
- **Metadata Caching System**: TTL-based caching (5-minute expiration) with WeakMap implementation
- **Batch Processing**: Configurable batch processing for discovery queue items
- **Exponential Backoff Retry Strategy**: Smart retry logic with configurable limits
- **Resource Management**: Proper lifecycle management with NestJS hooks

#### **Performance Monitoring Service**
- **Real-time Metrics**: Cache performance, discovery efficiency, memory usage, timing information
- **Automatic Warnings**: Low cache hit rates, high memory usage, slow processing, excessive retries
- **Performance Recommendations**: Actionable insights for optimization
- **Comprehensive Reporting**: Detailed performance summaries and statistics

#### **Enhanced Module Configuration**
- **Conditional Service Inclusion**: Performance monitoring only when autoDiscovery is enabled
- **Optimized Provider Structure**: Better resource management and service availability
- **Flexible Configuration**: Support for both basic and performance-focused setups

### 🔧 **Improvements**

- **Event Discovery Service**: Replaced polling with event-driven loop
- **Metadata Explorer**: Added caching with TTL and hit rate tracking
- **Module Scanner**: Improved resource cleanup and lifecycle management
- **Test Coverage**: Enhanced unit tests for performance optimizations
- **Documentation**: Comprehensive performance documentation and examples

### 📚 **Documentation**

- **New PERFORMANCE.md**: Complete guide to performance optimizations and monitoring
- **Enhanced README.md**: Updated features, API reference, and troubleshooting
- **Professional Tone**: Enterprise-grade documentation throughout
- **Usage Examples**: Real-world configuration and monitoring examples

### 🧪 **Testing**

- **Performance Unit Tests**: Comprehensive test suite for all optimizations
- **Integration Tests**: Redis integration and module configuration tests
- **Test Fixes**: Resolved timing assertions and provider count expectations
- **Coverage Improvements**: Better branch coverage for performance-critical services

### 🏗️ **Architecture Changes**

- **Service Dependencies**: PerformanceMonitorService requires EventMetadataExplorer and EventDiscoveryService
- **Module Structure**: Conditional inclusion of performance services based on configuration
- **Resource Lifecycle**: Proper cleanup and memory management throughout
- **Error Handling**: Graceful degradation and intelligent retry strategies

### 📦 **Files Added**

- `PERFORMANCE.md` - Comprehensive performance documentation
- `src/services/performance-monitor.service.ts` - Performance monitoring service
- `src/__tests__/services/performance-optimizations.unit.spec.ts` - Performance test suite

### 📝 **Files Modified**

- `package.json` - Version bump to 2.0.0
- `README.md` - Enhanced with performance features and monitoring
- `src/modules/events.module.ts` - Conditional service inclusion
- `src/services/event-discovery.service.ts` - Performance optimizations
- `src/services/event-metadata-explorer.service.ts` - Caching implementation
- Test files updated for new functionality

### 🎯 **Migration Notes**

Since this is the first major release with no existing users, no migration is required. New users can start directly with v2.0.0 and its performance optimizations.

### 🚀 **Getting Started with v2.0.0**

```typescript
import { Module } from '@nestjs/common';
import { EventsModule } from '@logistically/events-nestjs';

@Module({
  imports: [
    EventsModule.forRoot({
      service: 'my-app',
      autoDiscovery: true, // Required for performance monitoring
      global: true
    })
  ]
})
export class AppModule {}
```

### 🔍 **Performance Monitoring**

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

---

## [1.1.0] - 2025-01-27

### ✨ **Features**
- Initial release with basic NestJS integration
- Automatic event handler discovery
- Redis Streams and Memory transport support
- Pattern-based event routing
- TypeScript support and decorators

### 🔧 **Improvements**
- Basic module configuration
- Service injection and lifecycle management
- Error handling and validation
- Testing infrastructure

### 📚 **Documentation**
- Basic README and API reference
- Quick start guide and examples
- Configuration documentation
