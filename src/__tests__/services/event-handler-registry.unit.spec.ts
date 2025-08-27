import { EventHandlerRegistryService } from '../../services/event-handler-registry.service';

describe('EventHandlerRegistryService - Unit Tests', () => {
  let service: EventHandlerRegistryService;
  let mockEventSystemService: any;

  beforeEach(() => {
    mockEventSystemService = {
      getEventSystem: jest.fn().mockReturnValue({
        consumer: {
          subscribe: jest.fn().mockResolvedValue(undefined)
        }
      })
    };

    service = new EventHandlerRegistryService(mockEventSystemService);
  });

  describe('registerEventHandler method', () => {
    it('should register event handler with valid data', async () => {
      const handler = jest.fn();
      const registration = {
        eventType: 'test.event',
        handler,
        options: {
          priority: 1,
          async: true
        }
      };

      await expect(service.registerEventHandler(registration)).resolves.not.toThrow();
    });

    it('should register event handler without options', async () => {
      const handler = jest.fn();
      const registration = {
        eventType: 'test.event',
        handler
      };

      await expect(service.registerEventHandler(registration)).resolves.not.toThrow();
    });

    it('should handle null event type', async () => {
      const handler = jest.fn();
      const registration = {
        eventType: null as any,
        handler
      };

      await expect(service.registerEventHandler(registration)).resolves.not.toThrow();
    });

    it('should handle undefined event type', async () => {
      const handler = jest.fn();
      const registration = {
        eventType: undefined as any,
        handler
      };

      await expect(service.registerEventHandler(registration)).resolves.not.toThrow();
    });

    it('should handle empty string event type', async () => {
      const handler = jest.fn();
      const registration = {
        eventType: '',
        handler
      };

      await expect(service.registerEventHandler(registration)).resolves.not.toThrow();
    });

    it('should handle null handler', async () => {
      const registration = {
        eventType: 'test.event',
        handler: null as any
      };

      await expect(service.registerEventHandler(registration)).resolves.not.toThrow();
    });

    it('should handle undefined handler', async () => {
      const registration = {
        eventType: 'test.event',
        handler: undefined as any
      };

      await expect(service.registerEventHandler(registration)).resolves.not.toThrow();
    });

    it('should handle non-function handler', async () => {
      const registration = {
        eventType: 'test.event',
        handler: 'not a function' as any
      };

      await expect(service.registerEventHandler(registration)).resolves.not.toThrow();
    });

    it('should handle complex options', async () => {
      const handler = jest.fn();
      const registration = {
        eventType: 'test.event',
        handler,
        options: {
          priority: 999,
          async: false,
          retry: {
            maxAttempts: 5,
            backoffMs: 2000
          }
        }
      };

      await expect(service.registerEventHandler(registration)).resolves.not.toThrow();
    });

    it('should handle multiple registrations for same event type', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      const registration1 = {
        eventType: 'test.event',
        handler: handler1
      };
      
      const registration2 = {
        eventType: 'test.event',
        handler: handler2
      };

      await expect(service.registerEventHandler(registration1)).resolves.not.toThrow();
      await expect(service.registerEventHandler(registration2)).resolves.not.toThrow();
    });

    it('should handle rapid registrations', async () => {
      const registrations = [];
      
      for (let i = 0; i < 10; i++) {
        registrations.push({
          eventType: `test.event.${i}`,
          handler: jest.fn()
        });
      }

      const promises = registrations.map(reg => service.registerEventHandler(reg));
      await expect(Promise.all(promises)).resolves.not.toThrow();
    });
  });

  describe('getHandlers method', () => {
    it('should return empty array for unknown event type', () => {
      const result = service.getHandlers('unknown.event');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should return empty array for null event type', () => {
      const result = service.getHandlers(null as any);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should return empty array for undefined event type', () => {
      const result = service.getHandlers(undefined as any);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should return empty array for empty string event type', () => {
      const result = service.getHandlers('');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should return handlers for registered event type', async () => {
      const handler = jest.fn();
      const registration = {
        eventType: 'test.event',
        handler
      };

      await service.registerEventHandler(registration);
      
      const result = service.getHandlers('test.event');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0]).toEqual(registration);
    });

    it('should return multiple handlers for same event type', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      const registration1 = {
        eventType: 'test.event',
        handler: handler1
      };
      
      const registration2 = {
        eventType: 'test.event',
        handler: handler2
      };

      await service.registerEventHandler(registration1);
      await service.registerEventHandler(registration2);
      
      const result = service.getHandlers('test.event');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(result).toContain(registration1);
      expect(result).toContain(registration2);
    });
  });

  describe('onModuleInit lifecycle', () => {
    it('should initialize consumer successfully', async () => {
      await expect(service.onModuleInit()).resolves.not.toThrow();
    });

    it('should handle initialization error gracefully', async () => {
      // Mock the event system to throw an error
      mockEventSystemService.getEventSystem.mockImplementation(() => {
        throw new Error('Event system error');
      });

      await expect(service.onModuleInit()).resolves.not.toThrow();
    });

    it('should handle consumer initialization error gracefully', async () => {
      // Mock the consumer to be null
      mockEventSystemService.getEventSystem.mockReturnValue({
        consumer: null
      });

      await expect(service.onModuleInit()).resolves.not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle registration with special characters in event type', async () => {
      const specialEventTypes = [
        'test.event-with-dash',
        'test.event_with_underscore',
        'test.event.with.dot',
        'test.event:with:colon',
        'test.event/with/slash',
        'test.event\\with\\backslash',
        'test.event[with]brackets',
        'test.event{with}braces',
        'test.event(with)parentheses'
      ];

      for (const eventType of specialEventTypes) {
        const registration = {
          eventType,
          handler: jest.fn()
        };

        await expect(service.registerEventHandler(registration)).resolves.not.toThrow();
      }
    });

    it('should handle registration with very long event type', async () => {
      const longEventType = 'a'.repeat(1000);
      const registration = {
        eventType: longEventType,
        handler: jest.fn()
      };

      await expect(service.registerEventHandler(registration)).resolves.not.toThrow();
    });

    it('should handle registration with unicode event type', async () => {
      const unicodeEventTypes = [
        'test.événement',
        'test.事件',
        'test.событие',
        'test.حدث',
        'test.🎉',
        'test.🚀',
        'test.🔥'
      ];

      for (const eventType of unicodeEventTypes) {
        const registration = {
          eventType,
          handler: jest.fn()
        };

        await expect(service.registerEventHandler(registration)).resolves.not.toThrow();
      }
    });

    it('should handle registration with numeric event type', async () => {
      const numericEventTypes = [
        '123',
        '0',
        '-1',
        '999999999'
      ];

      for (const eventType of numericEventTypes) {
        const registration = {
          eventType,
          handler: jest.fn()
        };

        await expect(service.registerEventHandler(registration)).resolves.not.toThrow();
      }
    });
  });
});
