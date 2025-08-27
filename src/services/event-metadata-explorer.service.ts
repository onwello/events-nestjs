import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { MetadataScanner } from '@nestjs/core';
import { AUTO_EVENT_HANDLER_METADATA } from '../decorators/auto-event-handler.decorator';

export interface EventHandlerMetadata {
  methodKey: string;
  targetCallback: Function;
  eventType: string;
  options?: any;
}

@Injectable()
export class EventMetadataExplorer implements OnModuleDestroy {
  private readonly metadataScanner = new MetadataScanner();
  
  // Cache for metadata scanning results to avoid repeated scans
  private metadataCache = new WeakMap<any, {
    handlers: EventHandlerMetadata[];
    hasHandlers: boolean;
    eventTypes: string[];
    timestamp: number;
  }>();
  
  // Cache TTL in milliseconds (5 minutes)
  private readonly cacheTTL = 5 * 60 * 1000;
  
  // Track cache statistics
  private cacheHits = 0;
  private cacheMisses = 0;

  /**
   * Explore an instance for event handler methods with caching
   * Based on NestJS microservices ListenerMetadataExplorer pattern
   */
  explore(instance: any): EventHandlerMetadata[] {
    if (!instance) {
      return [];
    }

    // Check cache first
    const cached = this.metadataCache.get(instance);
    if (cached && this.isCacheValid(cached.timestamp)) {
      this.cacheHits++;
      return cached.handlers;
    }

    this.cacheMisses++;
    
    // Perform fresh scan
    const instancePrototype = Object.getPrototypeOf(instance);
    if (!instancePrototype) {
      return [];
    }
    
    const handlers = this.metadataScanner
      .getAllMethodNames(instancePrototype)
      .map(method => this.exploreMethodMetadata(instancePrototype, method))
      .filter(metadata => metadata !== null);
    
    // Cache the results
    this.metadataCache.set(instance, {
      handlers,
      hasHandlers: handlers.length > 0,
      eventTypes: handlers.map(h => h.eventType),
      timestamp: Date.now()
    });
    
    return handlers;
  }

  /**
   * Explore a single method for event handler metadata
   */
  private exploreMethodMetadata(instancePrototype: any, methodKey: string): EventHandlerMetadata | null {
    const targetCallback = instancePrototype[methodKey];
    
    // Check if method has @AutoEventHandler decorator
    const metadata = Reflect.getMetadata(AUTO_EVENT_HANDLER_METADATA, targetCallback);
    
    if (!metadata) {
      return null;
    }

    return {
      methodKey,
      targetCallback,
      eventType: metadata.eventType,
      options: metadata
    };
  }

  /**
   * Check if an instance has any event handlers with caching
   */
  hasEventHandlers(instance: any): boolean {
    if (!instance) {
      return false;
    }

    const cached = this.metadataCache.get(instance);
    if (cached && this.isCacheValid(cached.timestamp)) {
      this.cacheHits++;
      return cached.hasHandlers;
    }

    this.cacheMisses++;
    const result = this.explore(instance).length > 0;
    
    // Update cache if not already cached
    if (!cached) {
      const handlers = this.explore(instance);
      this.metadataCache.set(instance, {
        handlers,
        hasHandlers: result,
        eventTypes: handlers.map(h => h.eventType),
        timestamp: Date.now()
      });
    }
    
    return result;
  }

  /**
   * Get all event types that an instance handles with caching
   */
  getEventTypes(instance: any): string[] {
    if (!instance) {
      return [];
    }

    const cached = this.metadataCache.get(instance);
    if (cached && this.isCacheValid(cached.timestamp)) {
      this.cacheHits++;
      return cached.eventTypes;
    }

    this.cacheMisses++;
    const handlers = this.explore(instance);
    
    // Update cache if not already cached
    if (!cached) {
      this.metadataCache.set(instance, {
        handlers,
        hasHandlers: handlers.length > 0,
        eventTypes: handlers.map(h => h.eventType),
        timestamp: Date.now()
      });
    }
    
    return handlers.map(h => h.eventType);
  }

  /**
   * Check if cached data is still valid
   */
  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheTTL;
  }

  /**
   * Invalidate cache for a specific instance
   * Useful when instance methods are modified at runtime
   */
  invalidateCache(instance: any): void {
    if (instance) {
      this.metadataCache.delete(instance);
    }
  }

  /**
   * Clear all cached data
   * Useful for testing or when memory usage is a concern
   */
  clearCache(): void {
    this.metadataCache = new WeakMap();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  /**
   * Get cache statistics for monitoring
   */
  getCacheStats(): { hits: number; misses: number; hitRate: number; cacheSize: number } {
    const total = this.cacheHits + this.cacheMisses;
    const hitRate = total > 0 ? (this.cacheHits / total) * 100 : 0;
    
    // Estimate cache size (WeakMap doesn't provide size, so we estimate)
    let cacheSize = 0;
    // Note: WeakMap size cannot be determined, this is an approximation
    // In practice, the WeakMap will automatically clean up when instances are garbage collected
    
    return {
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate: Math.round(hitRate * 100) / 100,
      cacheSize
    };
  }

  /**
   * Cleanup on module destroy
   */
  onModuleDestroy() {
    this.clearCache();
  }

  /**
   * Pre-warm cache for known instances
   * Useful for frequently accessed services
   */
  preWarmCache(instances: any[]): void {
    for (const instance of instances) {
      if (instance) {
        this.explore(instance);
      }
    }
  }
}
