import { EventSubscriber, getEventSubscriberMetadata } from '../../decorators/event-subscriber.decorator';
import { NestJSEventSubscriberOptions } from '../../types/config.types';

describe('EventSubscriber Decorator', () => {
  let testService: any;

  beforeEach(() => {
    testService = {
      handleUserCreated: jest.fn(),
      handleUserUpdated: jest.fn(),
      handleWithOptions: jest.fn(),
      handlePatternBased: jest.fn()
    };

    // Apply decorators
    EventSubscriber({ eventType: 'user.created' })(
      testService,
      'handleUserCreated',
      Object.getOwnPropertyDescriptor(testService, 'handleUserCreated') || {}
    );

    EventSubscriber({ 
      eventType: 'user.updated',
      subscriptionOptions: { groupId: 'user-group' }
    })(
      testService,
      'handleUserUpdated',
      Object.getOwnPropertyDescriptor(testService, 'handleUserUpdated') || {}
    );

    EventSubscriber({ 
      eventType: 'order.created',
      subscriptionOptions: { 
        groupId: 'order-group',
        consumerId: 'order-consumer',
        pattern: false
      }
    })(
      testService,
      'handleWithOptions',
      Object.getOwnPropertyDescriptor(testService, 'handleWithOptions') || {}
    );

    EventSubscriber({ 
      eventType: 'user.*',
      subscriptionOptions: { 
        groupId: 'user-pattern-group',
        pattern: true
      }
    })(
      testService,
      'handlePatternBased',
      Object.getOwnPropertyDescriptor(testService, 'handlePatternBased') || {}
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Metadata Registration', () => {
    it('should register event subscriber metadata correctly', () => {
      const metadata = getEventSubscriberMetadata(testService, 'handleUserCreated');
      
      expect(metadata).toBeDefined();
      expect(metadata?.eventType).toBe('user.created');
      expect(metadata?.subscriptionOptions).toBeUndefined();
    });

    it('should register event subscriber with subscription options', () => {
      const metadata = getEventSubscriberMetadata(testService, 'handleUserUpdated');
      
      expect(metadata).toBeDefined();
      expect(metadata?.eventType).toBe('user.updated');
      expect(metadata?.subscriptionOptions).toEqual({ groupId: 'user-group' });
    });

    it('should register event subscriber with complex subscription options', () => {
      const metadata = getEventSubscriberMetadata(testService, 'handleWithOptions');
      
      expect(metadata).toBeDefined();
      expect(metadata?.eventType).toBe('order.created');
      expect(metadata?.subscriptionOptions).toEqual({ 
        groupId: 'order-group',
        consumerId: 'order-consumer',
        pattern: false
      });
    });

    it('should register pattern-based event subscriber', () => {
      const metadata = getEventSubscriberMetadata(testService, 'handlePatternBased');
      
      expect(metadata).toBeDefined();
      expect(metadata?.eventType).toBe('user.*');
      expect(metadata?.subscriptionOptions?.pattern).toBe(true);
    });
  });

  describe('Method Preservation', () => {
    it('should preserve original method functionality', () => {
      const originalMethod = testService.handleUserCreated;
      
      expect(typeof originalMethod).toBe('function');
      expect(originalMethod).toBe(testService.handleUserCreated);
    });

    it('should preserve method context', () => {
      const context = { test: true };
      testService.handleUserCreated.call(context);
      
      expect(testService.handleUserCreated).toHaveBeenCalled();
    });
  });

  describe('Multiple Subscribers', () => {
    it('should allow multiple subscribers on the same class', () => {
      const userCreatedMetadata = getEventSubscriberMetadata(testService, 'handleUserCreated');
      const userUpdatedMetadata = getEventSubscriberMetadata(testService, 'handleUserUpdated');
      
      expect(userCreatedMetadata).toBeDefined();
      expect(userUpdatedMetadata).toBeDefined();
      expect(userCreatedMetadata?.eventType).not.toBe(userUpdatedMetadata?.eventType);
    });

    it('should handle different subscription options for each subscriber', () => {
      const userCreatedMetadata = getEventSubscriberMetadata(testService, 'handleUserCreated');
      const userUpdatedMetadata = getEventSubscriberMetadata(testService, 'handleUserUpdated');
      
      expect(userCreatedMetadata?.subscriptionOptions).toBeUndefined();
      expect(userUpdatedMetadata?.subscriptionOptions?.groupId).toBe('user-group');
    });
  });

  describe('Metadata Structure', () => {
    it('should include all required metadata fields', () => {
      const metadata = getEventSubscriberMetadata(testService, 'handleUserCreated');
      
      expect(metadata).toHaveProperty('eventType');
      expect(metadata).toHaveProperty('subscriber');
      expect(metadata).toHaveProperty('method');
      expect(metadata).toHaveProperty('target');
      expect(metadata).toHaveProperty('subscriptionOptions');
    });

    it('should set correct subscriber and method names', () => {
      const metadata = getEventSubscriberMetadata(testService, 'handleUserCreated') as any;
      
      expect(metadata?.subscriber).toBe('Object');
      expect(metadata?.method).toBe('handleUserCreated');
    });

    it('should set correct target constructor', () => {
      const metadata = getEventSubscriberMetadata(testService, 'handleUserCreated') as any;
      
      expect(metadata?.target).toBe(Object);
    });
  });

  describe('Subscription Options', () => {
    it('should handle undefined subscription options', () => {
      const metadata = getEventSubscriberMetadata(testService, 'handleUserCreated');
      
      expect(metadata?.subscriptionOptions).toBeUndefined();
    });

    it('should handle basic subscription options', () => {
      const metadata = getEventSubscriberMetadata(testService, 'handleUserUpdated');
      
      expect(metadata?.subscriptionOptions?.groupId).toBe('user-group');
    });

    it('should handle complex subscription options', () => {
      const metadata = getEventSubscriberMetadata(testService, 'handleWithOptions');
      
      expect(metadata?.subscriptionOptions?.groupId).toBe('order-group');
      expect(metadata?.subscriptionOptions?.consumerId).toBe('order-consumer');
      expect(metadata?.subscriptionOptions?.pattern).toBe(false);
    });

    it('should handle pattern-based subscription options', () => {
      const metadata = getEventSubscriberMetadata(testService, 'handlePatternBased');
      
      expect(metadata?.subscriptionOptions?.pattern).toBe(true);
      expect(metadata?.subscriptionOptions?.groupId).toBe('user-pattern-group');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid metadata gracefully', () => {
      const metadata = getEventSubscriberMetadata(testService, 'nonExistentMethod');
      
      expect(metadata).toBeUndefined();
    });

    it('should handle missing options gracefully', () => {
      // Test with minimal options
      const minimalService = {
        minimalMethod: jest.fn()
      };

      EventSubscriber({ eventType: 'minimal.event' })(
        minimalService,
        'minimalMethod',
        Object.getOwnPropertyDescriptor(minimalService, 'minimalMethod') || {}
      );

      const metadata = getEventSubscriberMetadata(minimalService, 'minimalMethod');
      
      expect(metadata).toBeDefined();
      expect(metadata?.eventType).toBe('minimal.event');
      expect(metadata?.subscriptionOptions).toBeUndefined();
    });
  });

  describe('Integration with NestJS', () => {
    it('should work with NestJS SetMetadata', () => {
      const metadata = getEventSubscriberMetadata(testService, 'handleUserCreated');
      
      // Verify that the metadata was properly stored and can be retrieved
      expect(metadata).toBeDefined();
      expect(metadata?.eventType).toBe('user.created');
    });

    it('should support method decorator pattern', () => {
      // Verify that the decorator returns a function (method decorator pattern)
      const decorator = EventSubscriber({ eventType: 'test.event' });
      
      expect(typeof decorator).toBe('function');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string event types', () => {
      const emptyService = {
        emptyMethod: jest.fn()
      };

      EventSubscriber({ eventType: '' })(
        emptyService,
        'emptyMethod',
        Object.getOwnPropertyDescriptor(emptyService, 'emptyMethod') || {}
      );

      const metadata = getEventSubscriberMetadata(emptyService, 'emptyMethod');
      
      expect(metadata?.eventType).toBe('');
    });

    it('should handle complex subscription options with all fields', () => {
      const complexOptions = {
        groupId: 'complex-group',
        consumerId: 'complex-consumer',
        pattern: true,
        priority: 1,
        maxRetries: 3,
        timeout: 5000
      };

      const complexService = {
        complexMethod: jest.fn()
      };

      EventSubscriber({ 
        eventType: 'complex.event',
        subscriptionOptions: complexOptions
      })(
        complexService,
        'complexMethod',
        Object.getOwnPropertyDescriptor(complexService, 'complexMethod') || {}
      );

      const metadata = getEventSubscriberMetadata(complexService, 'complexMethod');
      
      expect(metadata?.subscriptionOptions).toEqual(complexOptions);
    });

    it('should handle wildcard event types', () => {
      const wildcardService = {
        wildcardMethod: jest.fn()
      };

      EventSubscriber({ eventType: '*.*' })(
        wildcardService,
        'wildcardMethod',
        Object.getOwnPropertyDescriptor(wildcardService, 'wildcardMethod') || {}
      );

      const metadata = getEventSubscriberMetadata(wildcardService, 'wildcardMethod');
      
      expect(metadata?.eventType).toBe('*.*');
    });

    it('should handle numeric event types', () => {
      const numericService = {
        numericMethod: jest.fn()
      };

      EventSubscriber({ eventType: '123.456' })(
        numericService,
        'numericMethod',
        Object.getOwnPropertyDescriptor(numericService, 'numericMethod') || {}
      );

      const metadata = getEventSubscriberMetadata(numericService, 'numericMethod');
      
      expect(metadata?.eventType).toBe('123.456');
    });
  });

  describe('Metadata Retrieval', () => {
    it('should retrieve metadata for existing methods', () => {
      const metadata = getEventSubscriberMetadata(testService, 'handleUserCreated');
      
      expect(metadata).toBeDefined();
      expect(metadata?.eventType).toBe('user.created');
    });

    it('should return undefined for non-existent methods', () => {
      const metadata = getEventSubscriberMetadata(testService, 'nonExistentMethod');
      
      expect(metadata).toBeUndefined();
    });

    it('should return undefined for methods without decorators', () => {
      const undecoratedService = {
        undecoratedMethod: jest.fn()
      };

      const metadata = getEventSubscriberMetadata(undecoratedService, 'undecoratedMethod');
      
      expect(metadata).toBeUndefined();
    });
  });
});
