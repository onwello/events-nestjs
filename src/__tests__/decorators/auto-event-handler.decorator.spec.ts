import { AutoEventHandler, getAutoEventHandlerMetadata, AUTO_EVENT_HANDLER_METADATA } from '../../decorators/auto-event-handler.decorator';

describe('AutoEventHandler Decorator', () => {
  describe('Basic Functionality', () => {
    class TestService {
      @AutoEventHandler({ 
        eventType: 'test.event',
        priority: 5,
        async: false,
        retry: { maxAttempts: 3, backoffMs: 1000 }
      })
      handleTest() {}
    }

    let testService: TestService;

    beforeEach(() => {
      testService = new TestService();
    });

    it('should store metadata correctly', () => {
      const metadata = getAutoEventHandlerMetadata(testService, 'handleTest');
      
      expect(metadata).toBeDefined();
      expect(metadata?.eventType).toBe('test.event');
      expect(metadata?.priority).toBe(5);
      expect(metadata?.async).toBe(false);
      expect(metadata?.retry).toEqual({
        maxAttempts: 3,
        backoffMs: 1000
      });
    });

    it('should use default values when options not provided', () => {
      class DefaultService {
        @AutoEventHandler({ eventType: 'test.event' })
        handleTest() {}
      }

      const metadata = getAutoEventHandlerMetadata(DefaultService.prototype, 'handleTest');
      expect(metadata?.priority).toBe(0);        // Default
      expect(metadata?.async).toBe(true);        // Default
    });

    it('should handle partial retry configuration', () => {
      class PartialRetryService {
        @AutoEventHandler({ 
          eventType: 'test.event',
          retry: { maxAttempts: 2 }
        })
        handleTest() {}
      }

      const metadata = getAutoEventHandlerMetadata(PartialRetryService.prototype, 'handleTest');
      expect(metadata?.retry?.maxAttempts).toBe(2);
      expect(metadata?.retry?.backoffMs).toBeUndefined();
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle empty string eventType', () => {
      class TestService {
        @AutoEventHandler({ eventType: '' })
        handleEmpty() {}
      }
      
      const metadata = getAutoEventHandlerMetadata(TestService.prototype, 'handleEmpty');
      expect(metadata?.eventType).toBe('');
    });

    it('should handle numeric property keys', () => {
      class TestService {
        @AutoEventHandler({ eventType: 'test.event' })
        [123]() {} // Numeric property key
      }
      
      const metadata = getAutoEventHandlerMetadata(TestService.prototype, '123');
      expect(metadata?.eventType).toBe('test.event');
    });

    it('should handle symbol property keys', () => {
      const methodSymbol = Symbol('method');
      
      class TestService {
        @AutoEventHandler({ eventType: 'test.event' })
        [methodSymbol]() {}
      }
      
      const metadata = getAutoEventHandlerMetadata(TestService.prototype, methodSymbol);
      expect(metadata?.eventType).toBe('test.event');
    });

    it('should handle zero priority', () => {
      class TestService {
        @AutoEventHandler({ eventType: 'test.event', priority: 0 })
        handleTest() {}
      }
      
      const metadata = getAutoEventHandlerMetadata(TestService.prototype, 'handleTest');
      expect(metadata?.priority).toBe(0);
    });

    it('should handle negative priority', () => {
      class TestService {
        @AutoEventHandler({ eventType: 'test.event', priority: -5 })
        handleTest() {}
      }
      
      const metadata = getAutoEventHandlerMetadata(TestService.prototype, 'handleTest');
      expect(metadata?.priority).toBe(-5);
    });

    it('should handle very high priority', () => {
      class TestService {
        @AutoEventHandler({ eventType: 'test.event', priority: 999999 })
        handleTest() {}
      }
      
      const metadata = getAutoEventHandlerMetadata(TestService.prototype, 'handleTest');
      expect(metadata?.priority).toBe(999999);
    });
  });

  describe('Multiple Handlers and Inheritance', () => {
    it('should allow multiple handlers on the same class', () => {
      class TestService {
        @AutoEventHandler({ eventType: 'event.1', priority: 1 })
        handleEvent1() {}
        
        @AutoEventHandler({ eventType: 'event.2', priority: 2 })
        handleEvent2() {}
        
        @AutoEventHandler({ eventType: 'event.3', priority: 3 })
        handleEvent3() {}
      }
      
      const metadata1 = getAutoEventHandlerMetadata(TestService.prototype, 'handleEvent1');
      const metadata2 = getAutoEventHandlerMetadata(TestService.prototype, 'handleEvent2');
      const metadata3 = getAutoEventHandlerMetadata(TestService.prototype, 'handleEvent3');
      
      expect(metadata1?.eventType).toBe('event.1');
      expect(metadata2?.eventType).toBe('event.2');
      expect(metadata3?.eventType).toBe('event.3');
      expect(metadata1?.priority).toBe(1);
      expect(metadata2?.priority).toBe(2);
      expect(metadata3?.priority).toBe(3);
    });

    it('should work with inheritance', () => {
      class BaseService {
        @AutoEventHandler({ eventType: 'base.event' })
        handleBaseEvent() {}
      }
      
      class ExtendedService extends BaseService {
        @AutoEventHandler({ eventType: 'extended.event' })
        handleExtendedEvent() {}
      }
      
      const baseMetadata = getAutoEventHandlerMetadata(BaseService.prototype, 'handleBaseEvent');
      const extendedMetadata = getAutoEventHandlerMetadata(ExtendedService.prototype, 'handleExtendedEvent');
      
      expect(baseMetadata?.eventType).toBe('base.event');
      expect(extendedMetadata?.eventType).toBe('extended.event');
    });

    it('should handle method overrides correctly', () => {
      class BaseService {
        @AutoEventHandler({ eventType: 'base.event' })
        handleEvent() {}
      }
      
      class OverrideService extends BaseService {
        @AutoEventHandler({ eventType: 'override.event' })
        handleEvent() {}
      }
      
      const baseMetadata = getAutoEventHandlerMetadata(BaseService.prototype, 'handleEvent');
      const overrideMetadata = getAutoEventHandlerMetadata(OverrideService.prototype, 'handleEvent');
      
      expect(baseMetadata?.eventType).toBe('base.event');
      expect(overrideMetadata?.eventType).toBe('override.event');
    });
  });

  describe('Metadata Retrieval Edge Cases', () => {
    it('should return undefined for non-existent methods', () => {
      class TestService {
        @AutoEventHandler({ eventType: 'test.event' })
        handleTest() {}
      }
      
      const metadata = getAutoEventHandlerMetadata(TestService.prototype, 'nonExistentMethod');
      expect(metadata).toBeUndefined();
    });

    it('should return undefined for methods without decorators', () => {
      class TestService {
        @AutoEventHandler({ eventType: 'test.event' })
        handleTest() {}
        
        plainMethod() {} // No decorator
      }
      
      const metadata = getAutoEventHandlerMetadata(TestService.prototype, 'plainMethod');
      expect(metadata).toBeUndefined();
    });

    it('should handle null target', () => {
      const metadata = getAutoEventHandlerMetadata(null as any, 'method');
      expect(metadata).toBeUndefined();
    });

    it('should handle undefined target', () => {
      const metadata = getAutoEventHandlerMetadata(undefined as any, 'method');
      expect(metadata).toBeUndefined();
    });

    it('should handle null propertyKey', () => {
      class TestService {
        @AutoEventHandler({ eventType: 'test.event' })
        handleTest() {}
      }
      
      const metadata = getAutoEventHandlerMetadata(TestService.prototype, null as any);
      expect(metadata).toBeUndefined();
    });

    it('should handle undefined propertyKey', () => {
      class TestService {
        @AutoEventHandler({ eventType: 'test.event' })
        handleTest() {}
      }
      
      const metadata = getAutoEventHandlerMetadata(TestService.prototype, undefined as any);
      expect(metadata).toBeUndefined();
    });
  });

  describe('Method Preservation', () => {
    it('should preserve original method functionality', () => {
      class TestService {
        @AutoEventHandler({ eventType: 'test.event' })
        handleTest(data: any) {
          return `processed: ${data}`;
        }
      }
      
      const instance = new TestService();
      const result = instance.handleTest('test data');
      
      expect(result).toBe('processed: test data');
    });

    it('should preserve method context', () => {
      class TestService {
        private value = 'test';
        
        @AutoEventHandler({ eventType: 'test.event' })
        handleTest() {
          return this.value;
        }
      }
      
      const instance = new TestService();
      const boundMethod = instance.handleTest.bind(instance);
      const result = boundMethod();
      
      expect(result).toBe('test');
    });

    it('should preserve method parameters', () => {
      class TestService {
        @AutoEventHandler({ eventType: 'test.event' })
        handleTest(param1: string, param2: number, param3?: boolean) {
          return { param1, param2, param3 };
        }
      }
      
      const instance = new TestService();
      const result = instance.handleTest('hello', 42, true);
      
      expect(result).toEqual({ param1: 'hello', param2: 42, param3: true });
    });

    it('should preserve async methods', async () => {
      class TestService {
        @AutoEventHandler({ eventType: 'test.event' })
        async handleTest(data: string): Promise<string> {
          return new Promise(resolve => {
            setTimeout(() => resolve(`async: ${data}`), 10);
          });
        }
      }
      
      const instance = new TestService();
      const result = await instance.handleTest('test data');
      
      expect(result).toBe('async: test data');
    });
  });

  describe('Complex Retry Configurations', () => {
    it('should handle full retry configuration', () => {
      class TestService {
        @AutoEventHandler({ 
          eventType: 'test.event',
          retry: {
            maxAttempts: 5,
            backoffMs: 2000
          }
        })
        handleTest() {}
      }
      
      const metadata = getAutoEventHandlerMetadata(TestService.prototype, 'handleTest');
      expect(metadata?.retry?.maxAttempts).toBe(5);
      expect(metadata?.retry?.backoffMs).toBe(2000);
    });

    it('should handle retry with only maxAttempts', () => {
      class TestService {
        @AutoEventHandler({ 
          eventType: 'test.event',
          retry: { maxAttempts: 3 }
        })
        handleTest() {}
      }
      
      const metadata = getAutoEventHandlerMetadata(TestService.prototype, 'handleTest');
      expect(metadata?.retry?.maxAttempts).toBe(3);
      expect(metadata?.retry?.backoffMs).toBeUndefined();
    });

    it('should handle retry with only backoffMs', () => {
      class TestService {
        @AutoEventHandler({ 
          eventType: 'test.event',
          retry: { backoffMs: 1000 }
        })
        handleTest() {}
      }
      
      const metadata = getAutoEventHandlerMetadata(TestService.prototype, 'handleTest');
      expect(metadata?.retry?.backoffMs).toBe(1000);
      expect(metadata?.retry?.maxAttempts).toBeUndefined();
    });
  });

  describe('Async Configuration', () => {
    it('should handle async: true explicitly', () => {
      class TestService {
        @AutoEventHandler({ eventType: 'test.event', async: true })
        handleTest() {}
      }
      
      const metadata = getAutoEventHandlerMetadata(TestService.prototype, 'handleTest');
      expect(metadata?.async).toBe(true);
    });

    it('should handle async: false explicitly', () => {
      class TestService {
        @AutoEventHandler({ eventType: 'test.event', async: false })
        handleTest() {}
      }
      
      const metadata = getAutoEventHandlerMetadata(TestService.prototype, 'handleTest');
      expect(metadata?.async).toBe(false);
    });

    it('should default to async: true when not specified', () => {
      class TestService {
        @AutoEventHandler({ eventType: 'test.event' })
        handleTest() {}
      }
      
      const metadata = getAutoEventHandlerMetadata(TestService.prototype, 'handleTest');
      expect(metadata?.async).toBe(true);
    });
  });

  describe('Metadata Structure Validation', () => {
    it('should include all required metadata fields', () => {
      class TestService {
        @AutoEventHandler({ eventType: 'test.event' })
        handleTest() {}
      }
      
      const metadata = getAutoEventHandlerMetadata(TestService.prototype, 'handleTest');
      
      expect(metadata).toHaveProperty('eventType');
      expect(metadata).toHaveProperty('priority');
      expect(metadata).toHaveProperty('async');
      expect(metadata).toHaveProperty('retry');
    });

    it('should set correct event type', () => {
      class TestService {
        @AutoEventHandler({ eventType: 'custom.event' })
        handleTest() {}
      }
      
      const metadata = getAutoEventHandlerMetadata(TestService.prototype, 'handleTest');
      expect(metadata?.eventType).toBe('custom.event');
    });

    it('should set correct priority', () => {
      class TestService {
        @AutoEventHandler({ eventType: 'test.event', priority: 42 })
        handleTest() {}
      }
      
      const metadata = getAutoEventHandlerMetadata(TestService.prototype, 'handleTest');
      expect(metadata?.priority).toBe(42);
    });

    it('should set correct async flag', () => {
      class TestService {
        @AutoEventHandler({ eventType: 'test.event', async: false })
        handleTest() {}
      }
      
      const metadata = getAutoEventHandlerMetadata(TestService.prototype, 'handleTest');
      expect(metadata?.async).toBe(false);
    });
  });
});
