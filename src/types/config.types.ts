import { EventSystemConfig, PublisherConfig, ConsumerConfig } from '@logistically/events';

export interface NestJSEventsModuleOptions extends EventSystemConfig {
  /**
   * Whether to make the module global
   */
  global?: boolean;
  
  /**
   * Whether to automatically discover and register event handlers
   */
  autoDiscovery?: boolean;
  
  /**
   * Custom event handler discovery options
   */
  discovery?: {
    /**
     * Whether to scan controllers for event handlers
     */
    scanControllers?: boolean;
    
    /**
     * Whether to scan providers for event handlers
     */
    scanProviders?: boolean;
    
    /**
     * Custom metadata keys to scan for
     */
    metadataKeys?: string[];
  };
  
  /**
   * Event interceptor options
   */
  interceptor?: {
    /**
     * Whether to enable automatic event publishing for HTTP requests
     */
    enableRequestEvents?: boolean;
    
    /**
     * Whether to enable automatic event publishing for HTTP responses
     */
    enableResponseEvents?: boolean;
    
    /**
     * Custom correlation ID header name
     */
    correlationIdHeader?: string;
    
    /**
     * Custom causation ID header name
     */
    causationIdHeader?: string;
  };
}

export interface NestJSEventHandlerOptions {
  /**
   * The event type to handle
   */
  eventType: string;
  
  /**
   * Priority for this handler (lower numbers = higher priority)
   */
  priority?: number;
  
  /**
   * Whether to handle events asynchronously
   */
  async?: boolean;
  
  /**
   * Retry configuration for failed event handling
   */
  retry?: {
    maxAttempts: number;
    backoffMs: number;
  };
  
  /**
   * Custom metadata for the handler
   */
  metadata?: Record<string, any>;
}

export interface NestJSEventPublisherOptions {
  /**
   * The event type to publish
   */
  eventType: string;
  
  /**
   * Whether to wait for the event to be published
   */
  waitForPublish?: boolean;
  
  /**
   * Custom publish options
   */
  publishOptions?: {
    /**
     * Custom origin for the event
     */
    origin?: string;
    
    /**
     * Custom timestamp for the event
     */
    timestamp?: Date;
    
    /**
     * Custom correlation ID
     */
    correlationId?: string;
    
    /**
     * Custom causation ID
     */
    causationId?: string;
  };
}

export interface NestJSEventSubscriberOptions {
  /**
   * The event type to subscribe to
   */
  eventType: string;
  
  /**
   * Custom subscription options
   */
  subscriptionOptions?: {
    /**
     * Custom consumer group ID
     */
    groupId?: string;
    
    /**
     * Custom consumer ID
     */
    consumerId?: string;
    
    /**
     * Whether to enable pattern matching
     */
    pattern?: boolean;
  };
}
