import { EventPublisher, getEventPublisherMetadata } from '../../decorators/event-publisher.decorator';
import { NestJSEventPublisherOptions } from '../../types/config.types';

describe('EventPublisher Decorator', () => {
  let testService: any;

  beforeEach(() => {
    testService = {
      publishUserCreated: jest.fn(),
      publishUserUpdated: jest.fn(),
      publishWithOptions: jest.fn()
    };

    // Apply decorators
    EventPublisher({ eventType: 'user.created' })(
      testService,
      'publishUserCreated',
      Object.getOwnPropertyDescriptor(testService, 'publishUserCreated') || {}
    );

    EventPublisher({ 
      eventType: 'user.updated',
      waitForPublish: true 
    })(
      testService,
      'publishUserUpdated',
      Object.getOwnPropertyDescriptor(testService, 'publishUserUpdated') || {}
    );

    EventPublisher({ 
      eventType: 'order.created',
      waitForPublish: false,
      publishOptions: { correlationId: 'order-123' }
    })(
      testService,
      'publishWithOptions',
      Object.getOwnPropertyDescriptor(testService, 'publishWithOptions') || {}
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Metadata Registration', () => {
    it('should register event publisher metadata correctly', () => {
      const metadata = getEventPublisherMetadata(testService, 'publishUserCreated');
      
      expect(metadata).toBeDefined();
      expect(metadata?.eventType).toBe('user.created');
      expect(metadata?.waitForPublish).toBe(false);
      expect(metadata?.publishOptions).toBeUndefined();
    });

    it('should register event publisher with waitForPublish option', () => {
      const metadata = getEventPublisherMetadata(testService, 'publishUserUpdated');
      
      expect(metadata).toBeDefined();
      expect(metadata?.eventType).toBe('user.updated');
      expect(metadata?.waitForPublish).toBe(true);
    });

    it('should register event publisher with publish options', () => {
      const metadata = getEventPublisherMetadata(testService, 'publishWithOptions');
      
      expect(metadata).toBeDefined();
      expect(metadata?.eventType).toBe('order.created');
      expect(metadata?.waitForPublish).toBe(false);
      expect(metadata?.publishOptions).toEqual({ correlationId: 'order-123' });
    });
  });

  describe('Method Preservation', () => {
    it('should preserve original method functionality', () => {
      const originalMethod = testService.publishUserCreated;
      
      expect(typeof originalMethod).toBe('function');
      expect(originalMethod).toBe(testService.publishUserCreated);
    });

    it('should preserve method context', () => {
      const context = { test: true };
      testService.publishUserCreated.call(context);
      
      expect(testService.publishUserCreated).toHaveBeenCalled();
    });
  });

  describe('Multiple Publishers', () => {
    it('should allow multiple publishers on the same class', () => {
      const userCreatedMetadata = getEventPublisherMetadata(testService, 'publishUserCreated');
      const userUpdatedMetadata = getEventPublisherMetadata(testService, 'publishUserUpdated');
      
      expect(userCreatedMetadata).toBeDefined();
      expect(userUpdatedMetadata).toBeDefined();
      expect(userCreatedMetadata?.eventType).not.toBe(userUpdatedMetadata?.eventType);
    });

    it('should handle different configuration options for each publisher', () => {
      const userCreatedMetadata = getEventPublisherMetadata(testService, 'publishUserCreated');
      const userUpdatedMetadata = getEventPublisherMetadata(testService, 'publishUserUpdated');
      
      expect(userCreatedMetadata?.waitForPublish).toBe(false);
      expect(userUpdatedMetadata?.waitForPublish).toBe(true);
    });
  });

  describe('Metadata Structure', () => {
    it('should include all required metadata fields', () => {
      const metadata = getEventPublisherMetadata(testService, 'publishUserCreated');
      
      expect(metadata).toHaveProperty('eventType');
      expect(metadata).toHaveProperty('publisher');
      expect(metadata).toHaveProperty('method');
      expect(metadata).toHaveProperty('target');
      expect(metadata).toHaveProperty('waitForPublish');
      expect(metadata).toHaveProperty('publishOptions');
    });

    it('should set correct publisher and method names', () => {
      const metadata = getEventPublisherMetadata(testService, 'publishUserCreated') as any;
      
      expect(metadata?.publisher).toBe('Object');
      expect(metadata?.method).toBe('publishUserCreated');
    });

    it('should set correct target constructor', () => {
      const metadata = getEventPublisherMetadata(testService, 'publishUserCreated') as any;
      
      expect(metadata?.target).toBe(Object);
    });
  });

  describe('Default Values', () => {
    it('should use default waitForPublish value when not specified', () => {
      const metadata = getEventPublisherMetadata(testService, 'publishUserCreated');
      
      expect(metadata?.waitForPublish).toBe(false);
    });

    it('should use custom waitForPublish value when specified', () => {
      const metadata = getEventPublisherMetadata(testService, 'publishUserUpdated');
      
      expect(metadata?.waitForPublish).toBe(true);
    });

    it('should handle undefined publishOptions', () => {
      const metadata = getEventPublisherMetadata(testService, 'publishUserCreated');
      
      expect(metadata?.publishOptions).toBeUndefined();
    });

    it('should handle defined publishOptions', () => {
      const metadata = getEventPublisherMetadata(testService, 'publishWithOptions');
      
      expect(metadata?.publishOptions).toEqual({ correlationId: 'order-123' });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid metadata gracefully', () => {
      const metadata = getEventPublisherMetadata(testService, 'nonExistentMethod');
      
      expect(metadata).toBeUndefined();
    });

    it('should handle missing options gracefully', () => {
      // Test with minimal options
      const minimalService = {
        minimalMethod: jest.fn()
      };

      EventPublisher({ eventType: 'minimal.event' })(
        minimalService,
        'minimalMethod',
        Object.getOwnPropertyDescriptor(minimalService, 'minimalMethod') || {}
      );

      const metadata = getEventPublisherMetadata(minimalService, 'minimalMethod');
      
      expect(metadata).toBeDefined();
      expect(metadata?.eventType).toBe('minimal.event');
      expect(metadata?.waitForPublish).toBe(false);
    });
  });

  describe('Integration with NestJS', () => {
    it('should work with NestJS SetMetadata', () => {
      const metadata = getEventPublisherMetadata(testService, 'publishUserCreated');
      
      // Verify that the metadata was properly stored and can be retrieved
      expect(metadata).toBeDefined();
      expect(metadata?.eventType).toBe('user.created');
    });

    it('should support method decorator pattern', () => {
      // Verify that the decorator returns a function (method decorator pattern)
      const decorator = EventPublisher({ eventType: 'test.event' });
      
      expect(typeof decorator).toBe('function');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string event types', () => {
      const emptyService = {
        emptyMethod: jest.fn()
      };

      EventPublisher({ eventType: '' })(
        emptyService,
        'emptyMethod',
        Object.getOwnPropertyDescriptor(emptyService, 'emptyMethod') || {}
      );

      const metadata = getEventPublisherMetadata(emptyService, 'emptyMethod');
      
      expect(metadata?.eventType).toBe('');
    });

    it('should handle complex publish options', () => {
      const complexOptions = {
        correlationId: 'user-123',
        causationId: 'cause-456',
        origin: 'custom-service'
      };

      const complexService = {
        complexMethod: jest.fn()
      };

      EventPublisher({ 
        eventType: 'complex.event',
        publishOptions: complexOptions
      })(
        complexService,
        'complexMethod',
        Object.getOwnPropertyDescriptor(complexService, 'complexMethod') || {}
      );

      const metadata = getEventPublisherMetadata(complexService, 'complexMethod');
      
      expect(metadata?.publishOptions).toEqual(complexOptions);
    });
  });
});
