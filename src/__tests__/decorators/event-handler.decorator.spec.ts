import { EventHandler } from '../../decorators/event-handler.decorator';
import { getEventHandlerMetadata } from '../../decorators/event-handler.decorator';

describe('EventHandler Decorator', () => {
  class TestService {
    @EventHandler({ 
      eventType: 'user.created',
      priority: 1,
      async: true,
      retry: {
        maxAttempts: 3,
        backoffMs: 1000
      }
    })
    async handleUserCreated(event: any): Promise<void> {
      // Test implementation
    }

    @EventHandler({ 
      eventType: 'user.updated',
      priority: 2
    })
    handleUserUpdated(event: any): void {
      // Test implementation
    }

    @EventHandler({ 
      eventType: 'user.*',
      priority: 0
    })
    handleAllUserEvents(event: any): void {
      // Test implementation
    }
  }

  let testService: TestService;

  beforeEach(() => {
    testService = new TestService();
  });

  describe('Metadata Registration', () => {
    it('should register event handler metadata correctly', () => {
      const metadata = getEventHandlerMetadata(testService, 'handleUserCreated');
      
      expect(metadata).toBeDefined();
      expect(metadata?.eventType).toBe('user.created');
      expect(metadata?.priority).toBe(1);
      expect(metadata?.async).toBe(true);
      expect(metadata?.retry).toEqual({
        maxAttempts: 3,
        backoffMs: 1000
      });
    });

    it('should register event handler without optional options', () => {
      const metadata = getEventHandlerMetadata(testService, 'handleUserUpdated');
      
      expect(metadata).toBeDefined();
      expect(metadata?.eventType).toBe('user.updated');
      expect(metadata?.priority).toBe(2);
      expect(metadata?.async).toBeUndefined();
      expect(metadata?.retry).toBeUndefined();
    });

    it('should register pattern-based event handler', () => {
      const metadata = getEventHandlerMetadata(testService, 'handleAllUserEvents');
      
      expect(metadata).toBeDefined();
      expect(metadata?.eventType).toBe('user.*');
      expect(metadata?.priority).toBe(0);
    });
  });

  describe('Method Preservation', () => {
    it('should preserve original method functionality', () => {
      const originalMethod = testService.handleUserCreated;
      expect(typeof originalMethod).toBe('function');
      
      // Method should still be callable
      expect(() => originalMethod({ test: 'data' })).not.toThrow();
    });

    it('should preserve method context', () => {
      const boundMethod = testService.handleUserCreated.bind(testService);
      expect(() => boundMethod({ test: 'data' })).not.toThrow();
    });
  });

  describe('Multiple Handlers', () => {
    it('should allow multiple handlers on the same class', () => {
      const userCreatedMetadata = getEventHandlerMetadata(testService, 'handleUserCreated');
      const userUpdatedMetadata = getEventHandlerMetadata(testService, 'handleUserUpdated');
      
      expect(userCreatedMetadata).toBeDefined();
      expect(userUpdatedMetadata).toBeDefined();
      expect(userCreatedMetadata?.eventType).not.toBe(userUpdatedMetadata?.eventType);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid metadata gracefully', () => {
      const metadata = getEventHandlerMetadata(testService, 'nonExistentMethod');
      expect(metadata).toBeUndefined();
    });
  });
});
