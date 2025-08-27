import { Injectable } from '@nestjs/common';
import { MetadataScanner } from '@nestjs/core';
import { AUTO_EVENT_HANDLER_METADATA } from '../decorators/auto-event-handler.decorator';

export interface EventHandlerMetadata {
  methodKey: string;
  targetCallback: Function;
  eventType: string;
  options?: any;
}

@Injectable()
export class EventMetadataExplorer {
  private readonly metadataScanner = new MetadataScanner();

  /**
   * Explore an instance for event handler methods
   * Based on NestJS microservices ListenerMetadataExplorer pattern
   */
  explore(instance: any): EventHandlerMetadata[] {
    const instancePrototype = Object.getPrototypeOf(instance);
    
    return this.metadataScanner
      .getAllMethodNames(instancePrototype)
      .map(method => this.exploreMethodMetadata(instancePrototype, method))
      .filter(metadata => metadata !== null);
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
   * Check if an instance has any event handlers
   */
  hasEventHandlers(instance: any): boolean {
    return this.explore(instance).length > 0;
  }

  /**
   * Get all event types that an instance handles
   */
  getEventTypes(instance: any): string[] {
    return this.explore(instance).map(handler => handler.eventType);
  }
}
