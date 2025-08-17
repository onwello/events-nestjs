import { NestJSEvent, NestJSEventMetadata } from '../types/event.types';
import { createEventEnvelope } from '@logistically/events';
import { generateEventId, generateEventHash } from '@logistically/events/dist/event-types';

export class EventUtils {
  /**
   * Creates a new NestJS event with the given type and data
   */
  static createEvent<T = any>(
    eventType: string,
    data: T,
    origin: string,
    metadata: Partial<NestJSEventMetadata> = {},
    originPrefix?: string
  ): NestJSEvent<T> {
    const envelope = createEventEnvelope(eventType, origin, data, originPrefix);
    
    return {
      ...envelope,
      nestjsMetadata: {
        correlationId: metadata.correlationId,
        causationId: metadata.causationId,
        ...metadata,
      },
    };
  }

  /**
   * Generates a unique event ID
   */
  static generateEventId(): string {
    return generateEventId();
  }

  /**
   * Generates a hash for event data
   */
  static generateEventHash(data: any): string {
    return generateEventHash(data);
  }

  /**
   * Generates a correlation ID for tracking related events
   */
  static generateCorrelationId(): string {
    return `corr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Creates a causation ID from a correlation ID
   */
  static createCausationId(correlationId: string): string {
    return `caus-${correlationId}`;
  }

  /**
   * Validates if an event object is properly formatted
   */
  static validateEvent(event: any): event is NestJSEvent {
    const isValid = (
      event &&
      typeof event === 'object' &&
      event.header &&
      typeof event.header === 'object' &&
      typeof event.header.id === 'string' &&
      typeof event.header.type === 'string' &&
      typeof event.header.origin === 'string' &&
      typeof event.header.timestamp === 'string' &&
      event.body !== undefined
    );
    
    return Boolean(isValid);
  }

  /**
   * Clones an event with new metadata
   */
  static cloneEvent<T = any>(
    event: NestJSEvent<T>,
    newMetadata: Partial<NestJSEventMetadata> = {},
  ): NestJSEvent<T> {
    const newEnvelope = createEventEnvelope(
      event.header.type,
      event.header.origin,
      event.body,
      event.header.originPrefix
    );

    return {
      ...newEnvelope,
      nestjsMetadata: {
        ...event.nestjsMetadata,
        ...newMetadata,
      },
    };
  }

  /**
   * Creates a batch of events with shared correlation ID
   */
  static createEventBatch<T = any>(
    events: Array<{ type: string; data: T; metadata?: Partial<NestJSEventMetadata> }>,
    origin: string,
    correlationId?: string,
    originPrefix?: string
  ): NestJSEvent<T>[] {
    const sharedCorrelationId = correlationId || this.generateCorrelationId();
    
    return events.map((eventData, index) => {
      const causationId = index === 0 
        ? sharedCorrelationId 
        : this.createCausationId(sharedCorrelationId);
      
      return this.createEvent(eventData.type, eventData.data, origin, {
        ...eventData.metadata,
        correlationId: sharedCorrelationId,
        causationId,
      }, originPrefix);
    });
  }

  /**
   * Extracts correlation ID from event metadata
   */
  static getCorrelationId(event: NestJSEvent): string | undefined {
    return event.nestjsMetadata?.correlationId;
  }

  /**
   * Extracts causation ID from event metadata
   */
  static getCausationId(event: NestJSEvent): string | undefined {
    return event.nestjsMetadata?.causationId;
  }

  /**
   * Checks if two events are related (same correlation ID)
   */
  static areEventsRelated(event1: NestJSEvent, event2: NestJSEvent): boolean {
    const corrId1 = this.getCorrelationId(event1);
    const corrId2 = this.getCorrelationId(event2);
    
    return corrId1 !== undefined && corrId1 === corrId2;
  }

  /**
   * Creates a domain event with aggregate information
   */
  static createDomainEvent<T = any>(
    eventType: string,
    data: T,
    origin: string,
    aggregateId: string,
    version: number,
    metadata: Partial<NestJSEventMetadata> = {},
    originPrefix?: string
  ): NestJSEvent<T> {
    return this.createEvent(eventType, data, origin, {
      ...metadata,
      aggregateId,
      version,
    }, originPrefix);
  }

  /**
   * Serializes an event for storage or transmission
   */
  static serializeEvent(event: NestJSEvent): string {
    return JSON.stringify(event, (key, value) => {
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    });
  }

  /**
   * Deserializes an event from storage or transmission
   */
  static deserializeEvent<T = any>(serialized: string): NestJSEvent<T> {
    const parsed = JSON.parse(serialized);
    
    // Convert timestamp back to string if it was converted to Date
    if (parsed.header?.timestamp instanceof Date) {
      parsed.header.timestamp = parsed.header.timestamp.toISOString();
    }
    
    return parsed;
  }

  /**
   * Creates a request event for HTTP requests
   */
  static createRequestEvent(
    method: string,
    path: string,
    correlationId: string,
    causationId?: string,
    origin: string = 'nestjs',
    metadata: Partial<NestJSEventMetadata> = {}
  ): NestJSEvent {
    return this.createEvent('http.request', {
      method,
      path,
      timestamp: new Date().toISOString(),
    }, origin, {
      correlationId,
      causationId,
      ...metadata,
    });
  }

  /**
   * Creates a response event for HTTP responses
   */
  static createResponseEvent(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    correlationId: string,
    causationId?: string,
    origin: string = 'nestjs',
    metadata: Partial<NestJSEventMetadata> = {}
  ): NestJSEvent {
    return this.createEvent('http.response', {
      method,
      path,
      statusCode,
      duration,
      timestamp: new Date().toISOString(),
    }, origin, {
      correlationId,
      causationId,
      ...metadata,
    });
  }
}
