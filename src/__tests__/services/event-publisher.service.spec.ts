import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisherService } from '../../services/event-publisher.service';
import { EventSystemService } from '../../services/event-system.service';
import { NestJSEvent } from '../../types/event.types';

// Mock the core library
jest.mock('@logistically/events', () => ({
  createEventEnvelope: jest.fn((eventType, origin, data) => ({
    header: {
      id: 'mock-id',
      type: eventType,
      timestamp: new Date().toISOString(),
      origin: origin,
      hash: 'mock-hash',
      version: '1.0.0'
    },
    body: data
  }))
}));

describe('EventPublisherService', () => {
  let service: EventPublisherService;
  let mockEventSystemService: jest.Mocked<EventSystemService>;
  let mockPublisher: any;
  let mockEventSystem: any;

  const mockEvent: NestJSEvent = {
    header: {
      id: 'test-event-id',
      type: 'user.created',
      timestamp: new Date().toISOString(),
      origin: 'test-service',
      hash: 'test-hash',
      version: '1.0.0'
    },
    body: { userId: '123', email: 'test@example.com' },
    nestjsMetadata: {
      correlationId: 'corr-123',
      userId: 'user-123'
    }
  };

  beforeEach(async () => {
    mockPublisher = {
      publish: jest.fn().mockResolvedValue(undefined),
      publishBatch: jest.fn().mockResolvedValue(undefined),
      forceFlush: jest.fn().mockResolvedValue(undefined),
      getStats: jest.fn().mockReturnValue({ published: 10, failed: 0 })
    };

    mockEventSystem = {
      publisher: mockPublisher
    };

    mockEventSystemService = {
      getEventSystem: jest.fn().mockReturnValue(mockEventSystem),
      getServiceName: jest.fn().mockReturnValue('test-service'),
      isConnected: jest.fn().mockReturnValue(true),
      onModuleInit: jest.fn(),
      onModuleDestroy: jest.fn(),
      getAdvancedConfig: jest.fn().mockReturnValue({}),
      hasAdvancedFeatures: jest.fn().mockReturnValue(false)
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventPublisherService,
        {
          provide: EventSystemService,
          useValue: mockEventSystemService
        }
      ],
    }).compile();

    service = module.get<EventPublisherService>(EventPublisherService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('publish', () => {
    it('should publish a single event successfully', async () => {
      const eventType = 'user.created';
      const data = { userId: '123', email: 'test@example.com' };
      const options = {
        partitionKey: 'user-123',
        priority: 1,
        ttl: 3600000,
        nestjsMetadata: { correlationId: 'corr-123' }
      };

      await service.publish(eventType, data, options);

      expect(mockPublisher.publish).toHaveBeenCalledWith(eventType, data, options);
    });

    it('should publish event without options', async () => {
      const eventType = 'user.created';
      const data = { userId: '123', email: 'test@example.com' };

      await service.publish(eventType, data);

      expect(mockPublisher.publish).toHaveBeenCalledWith(eventType, data, undefined);
    });

    it('should throw error when publisher is not initialized', async () => {
      mockEventSystem.publisher = null;

      await expect(service.publish('test.event', {}))
        .rejects.toThrow('Event publisher not initialized');
    });

    it('should handle publisher errors gracefully', async () => {
      const publishError = new Error('Publish failed');
      mockPublisher.publish.mockRejectedValue(publishError);

      await expect(service.publish('test.event', {}))
        .rejects.toThrow('Publish failed');
    });
  });

  describe('publishBatch', () => {
    it('should publish multiple events in batch', async () => {
      const eventType = 'user.created';
      const data = [
        { userId: '123', email: 'test@example.com' },
        { userId: '456', email: 'test2@example.com' }
      ];
      const options = {
        partitionKey: 'batch-123',
        priority: 1,
        ttl: 3600000
      };

      await service.publishBatch(eventType, data, options);

      expect(mockPublisher.publishBatch).toHaveBeenCalledWith(
        eventType, 
        data, 
        expect.objectContaining({
          ...options,
          maxSize: 100,
          maxWaitMs: 1000,
          maxConcurrentBatches: 1
        })
      );
    });

    it('should publish batch without options', async () => {
      const eventType = 'user.created';
      const data = [{ userId: '123', email: 'test@example.com' }];

      await service.publishBatch(eventType, data);

      expect(mockPublisher.publishBatch).toHaveBeenCalledWith(
        eventType, 
        data, 
        expect.objectContaining({
          maxSize: 100,
          maxWaitMs: 1000,
          maxConcurrentBatches: 1
        })
      );
    });

    it('should handle batch publishing errors', async () => {
      const eventType = 'user.created';
      const data = [{ userId: '123', email: 'test@example.com' }];

      const batchError = new Error('Batch publish failed');
      mockPublisher.publishBatch.mockRejectedValue(batchError);

      await expect(service.publishBatch(eventType, data))
        .rejects.toThrow('Batch publish failed');
    });

    it('should throw error when publisher is not initialized', async () => {
      mockEventSystem.publisher = null;

      await expect(service.publishBatch('test.event', [{}]))
        .rejects.toThrow('Event publisher not initialized');
    });

    it('should handle large batch sizes', async () => {
      const eventType = 'user.created';
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        userId: `user-${i}`,
        email: `user${i}@example.com`
      }));

      await service.publishBatch(eventType, largeData);

      expect(mockPublisher.publishBatch).toHaveBeenCalledWith(
        eventType, 
        largeData, 
        expect.any(Object)
      );
    });

    it('should handle concurrent batch publishing', async () => {
      const eventType = 'user.created';
      const data1 = Array.from({ length: 100 }, (_, i) => ({
        userId: `user-${i}`,
        email: `user${i}@example.com`
      }));
      const data2 = Array.from({ length: 100 }, (_, i) => ({
        userId: `user-${i + 100}`,
        email: `user${i + 100}@example.com`
      }));

      await Promise.all([
        service.publishBatch(eventType, data1),
        service.publishBatch(eventType, data2)
      ]);

      expect(mockPublisher.publishBatch).toHaveBeenCalledTimes(2);
    });
  });

  describe('publishEvent', () => {
    it('should publish a NestJS event successfully', async () => {
      await service.publishEvent(mockEvent);

      expect(mockPublisher.publish).toHaveBeenCalledWith(
        mockEvent.header.type, 
        mockEvent.body
      );
    });

    it('should throw error when publisher is not initialized', async () => {
      mockEventSystem.publisher = null;

      await expect(service.publishEvent(mockEvent))
        .rejects.toThrow('Event publisher not initialized');
    });

    it('should handle publisher errors gracefully', async () => {
      const publishError = new Error('Publish failed');
      mockPublisher.publish.mockRejectedValue(publishError);

      await expect(service.publishEvent(mockEvent))
        .rejects.toThrow('Publish failed');
    });
  });

  describe('forceFlush', () => {
    it('should force flush pending events', async () => {
      await service.forceFlush();

      expect(mockPublisher.forceFlush).toHaveBeenCalled();
    });

    it('should throw error when publisher is not initialized', async () => {
      mockEventSystem.publisher = null;

      await expect(service.forceFlush())
        .rejects.toThrow('Event publisher not initialized');
    });

    it('should handle flush errors gracefully', async () => {
      const flushError = new Error('Flush failed');
      mockPublisher.forceFlush.mockRejectedValue(flushError);

      await expect(service.forceFlush())
        .rejects.toThrow('Flush failed');
    });
  });

  describe('getStats', () => {
    it('should return publisher statistics', () => {
      const stats = service.getStats();

      expect(mockPublisher.getStats).toHaveBeenCalled();
      expect(stats).toEqual({ published: 10, failed: 0 });
    });

    it('should return null when publisher is not initialized', () => {
      mockEventSystem.publisher = null;

      const stats = service.getStats();

      expect(stats).toBeNull();
    });

    it('should handle stats errors gracefully', () => {
      const statsError = new Error('Stats failed');
      mockPublisher.getStats.mockImplementation(() => {
        throw statsError;
      });

      const stats = service.getStats();

      expect(stats).toBeNull();
    });
  });

  describe('isConnected', () => {
    it('should return connection status from EventSystemService', () => {
      const isConnected = service.isConnected();

      expect(mockEventSystemService.isConnected).toHaveBeenCalled();
      expect(isConnected).toBe(true);
    });

    it('should return false when EventSystemService is not connected', () => {
      mockEventSystemService.isConnected.mockReturnValue(false);

      const isConnected = service.isConnected();

      expect(isConnected).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing event data gracefully', async () => {
      const invalidEvent = {} as any;

      await expect(service.publishEvent(invalidEvent))
        .rejects.toThrow();
    });

    it('should handle missing event header gracefully', async () => {
      const invalidEvent = {
        body: { data: 'test' }
      } as any;

      await expect(service.publishEvent(invalidEvent))
        .rejects.toThrow();
    });

    it('should handle missing event type gracefully', async () => {
      const invalidEvent = {
        header: {
          id: 'test-id',
          timestamp: new Date().toISOString(),
          origin: 'test-service'
        },
        body: { data: 'test' }
      } as any;

      // The publishEvent method doesn't validate event structure, so it should succeed
      // and pass undefined as the event type to the publisher
      await service.publishEvent(invalidEvent);

      expect(mockPublisher.publish).toHaveBeenCalledWith(undefined, { data: 'test' });
    });
  });

  describe('Integration with EventSystemService', () => {
    it('should use EventSystemService for publisher access', () => {
      service.isConnected();

      expect(mockEventSystemService.isConnected).toHaveBeenCalled();
    });

    it('should use EventSystemService for service name', async () => {
      await service.publish('test.event', {});

      expect(mockEventSystemService.getServiceName).toHaveBeenCalled();
    });
  });

  describe('Performance and Batching', () => {
    it('should handle large batches efficiently', async () => {
      const eventType = 'user.created';
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        userId: `user-${i}`,
        email: `user${i}@example.com`
      }));
      const startTime = Date.now();

      await service.publishBatch(eventType, largeData);

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle concurrent batch publishing', async () => {
      const eventType = 'user.created';
      const data1 = Array.from({ length: 50 }, (_, i) => ({
        userId: `user-${i}`,
        email: `user${i}@example.com`
      }));
      const data2 = Array.from({ length: 50 }, (_, i) => ({
        userId: `user-${i + 50}`,
        email: `user${i + 50}@example.com`
      }));

      await Promise.all([
        service.publishBatch(eventType, data1),
        service.publishBatch(eventType, data2)
      ]);

      expect(mockPublisher.publishBatch).toHaveBeenCalledTimes(2);
    });
  });
});
