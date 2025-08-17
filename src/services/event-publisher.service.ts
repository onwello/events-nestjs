import { Injectable, Logger } from '@nestjs/common';
import { EventPublisher as CoreEventPublisher } from '@logistically/events';
import { PublishOptions, BatchOptions } from '@logistically/events/dist/event-transport/transport.interface';
import { EventSystemService } from './event-system.service';
import { NestJSEvent, NestJSEventMetadata } from '../types/event.types';
import { createEventEnvelope } from '@logistically/events';

@Injectable()
export class EventPublisherService {
  private readonly logger = new Logger(EventPublisherService.name);
  private publisher: CoreEventPublisher | null = null;

  constructor(private readonly eventSystemService: EventSystemService) {}

  private getPublisher(): CoreEventPublisher {
    if (!this.publisher) {
      this.publisher = this.eventSystemService.getEventSystem().publisher;
    }
    if (!this.publisher) {
      throw new Error('Event publisher not initialized');
    }
    return this.publisher;
  }

  /**
   * Publish a single event
   */
  async publish<T = any>(
    eventType: string,
    data: T,
    options?: PublishOptions & { nestjsMetadata?: NestJSEventMetadata }
  ): Promise<void> {
    try {
      const publisher = this.getPublisher();
      
      // Create the event envelope using service name from config
      const serviceName = this.eventSystemService.getServiceName();
      const envelope = createEventEnvelope(eventType, serviceName, data);
      
      // Add NestJS metadata if provided
      if (options?.nestjsMetadata) {
        (envelope as any).nestjsMetadata = options.nestjsMetadata;
      }

      await publisher.publish(eventType, data, options);
      
      this.logger.debug(`Event published: ${eventType}`);
    } catch (error) {
      this.logger.error(`Failed to publish event ${eventType}:`, error);
      throw error;
    }
  }

  /**
   * Publish a batch of events
   */
  async publishBatch<T = any>(
    eventType: string,
    data: T[],
    options?: PublishOptions & { nestjsMetadata?: NestJSEventMetadata }
  ): Promise<void> {
    try {
      const publisher = this.getPublisher();
      
      // Extract PublishOptions and BatchOptions from the combined options
      const publishOptions: PublishOptions & BatchOptions = {
        partitionKey: options?.partitionKey,
        partition: options?.partition,
        headers: options?.headers,
        correlationId: options?.correlationId,
        traceId: options?.traceId,
        priority: options?.priority,
        ttl: options?.ttl,
        ordering: options?.ordering,
        batchKey: options?.batchKey,
        // BatchOptions required fields
        maxSize: 100,
        maxWaitMs: 1000,
        maxConcurrentBatches: 1,
      };
      
      await publisher.publishBatch(eventType, data, publishOptions);
      
      this.logger.debug(`Batch published: ${eventType} with ${data.length} events`);
    } catch (error) {
      this.logger.error(`Failed to publish batch for ${eventType}:`, error);
      throw error;
    }
  }

  /**
   * Publish a NestJS event
   */
  async publishEvent<T = any>(event: NestJSEvent<T>): Promise<void> {
    try {
      const publisher = this.getPublisher();
      
      await publisher.publish(event.header.type, event.body);
      
      this.logger.debug(`NestJS event published: ${event.header.type}`);
    } catch (error) {
      this.logger.error(`Failed to publish NestJS event ${event.header.type}:`, error);
      throw error;
    }
  }

  /**
   * Force flush any pending batched events
   */
  async forceFlush(): Promise<void> {
    try {
      const publisher = this.getPublisher();
      await publisher.forceFlush();
      this.logger.debug('Forced flush of pending events');
    } catch (error) {
      this.logger.error('Failed to force flush events:', error);
      throw error;
    }
  }

  /**
   * Get publisher statistics
   */
  getStats() {
    try {
      const publisher = this.getPublisher();
      return publisher.getStats();
    } catch (error) {
      this.logger.error('Failed to get publisher stats:', error);
      return null;
    }
  }

  /**
   * Check if the publisher is connected
   */
  isConnected(): boolean {
    return this.eventSystemService.isConnected();
  }
}
