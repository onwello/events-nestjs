import { Test, TestingModule } from '@nestjs/testing';
import { EventConsumerService } from '../../services/event-consumer.service';
import { EventSystemService } from '../../services/event-system.service';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { NestJSEventHandler } from '../../types/handler.types';

// Mock the core library
jest.mock('@logistically/events', () => ({
  // Mock implementations will be defined in tests
}));

describe('EventConsumerService', () => {
  let service: EventConsumerService;
  let mockEventSystemService: jest.Mocked<EventSystemService>;
  let mockConsumer: any;
  let mockEventSystem: any;
  let mockDiscoveryService: jest.Mocked<DiscoveryService>;
  let mockMetadataScanner: jest.Mocked<MetadataScanner>;
  let mockReflector: jest.Mocked<Reflector>;

  const mockHandler: NestJSEventHandler = jest.fn().mockResolvedValue(undefined);

  beforeEach(async () => {
    mockConsumer = {
      subscribe: jest.fn().mockResolvedValue(undefined),
      subscribePattern: jest.fn().mockResolvedValue(undefined),
      unsubscribe: jest.fn().mockResolvedValue(undefined),
      unsubscribePattern: jest.fn().mockResolvedValue(undefined),
      getSubscriptions: jest.fn().mockReturnValue([]),
      getStats: jest.fn().mockReturnValue({ consumed: 10, failed: 0 })
    };

    mockEventSystem = {
      consumer: mockConsumer
    };

    mockEventSystemService = {
      getEventSystem: jest.fn().mockReturnValue(mockEventSystem),
      isConnected: jest.fn().mockReturnValue(true),
      onModuleInit: jest.fn(),
      onModuleDestroy: jest.fn(),
      getAdvancedConfig: jest.fn().mockReturnValue({}),
      hasAdvancedFeatures: jest.fn().mockReturnValue(false)
    } as any;

    mockDiscoveryService = {
      getProviders: jest.fn().mockReturnValue([]),
      getControllers: jest.fn().mockReturnValue([])
    } as any;

    mockMetadataScanner = {
      scanFromPrototype: jest.fn()
    } as any;

    mockReflector = {
      get: jest.fn()
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventConsumerService,
        {
          provide: EventSystemService,
          useValue: mockEventSystemService
        },
        {
          provide: DiscoveryService,
          useValue: mockDiscoveryService
        },
        {
          provide: MetadataScanner,
          useValue: mockMetadataScanner
        },
        {
          provide: Reflector,
          useValue: mockReflector
        }
      ],
    }).compile();

    service = module.get<EventConsumerService>(EventConsumerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('should discover event handlers on module initialization', async () => {
      await service.onModuleInit();
      
      expect(mockDiscoveryService.getProviders).toHaveBeenCalled();
      expect(mockDiscoveryService.getControllers).toHaveBeenCalled();
    });
  });

  describe('subscribe', () => {
    it('should subscribe to an event type successfully', async () => {
      const eventType = 'user.created';
      const options = { groupId: 'test-group' };

      await service.subscribe(eventType, mockHandler, options);

      expect(mockConsumer.subscribe).toHaveBeenCalledWith(
        eventType,
        expect.any(Function),
        options
      );
      expect(service['subscriptions'].get(eventType)).toBe(mockHandler);
    });

    it('should subscribe without options', async () => {
      const eventType = 'user.created';

      await service.subscribe(eventType, mockHandler);

      expect(mockConsumer.subscribe).toHaveBeenCalledWith(
        eventType,
        expect.any(Function),
        undefined
      );
    });

    it('should throw error when consumer is not initialized', async () => {
      mockEventSystem.consumer = null;

      await expect(service.subscribe('test.event', mockHandler))
        .rejects.toThrow('Event consumer not initialized');
    });

    it('should handle subscription errors gracefully', async () => {
      const subscribeError = new Error('Subscribe failed');
      mockConsumer.subscribe.mockRejectedValue(subscribeError);

      await expect(service.subscribe('test.event', mockHandler))
        .rejects.toThrow('Subscribe failed');
    });
  });

  describe('subscribePattern', () => {
    it('should subscribe to a pattern successfully', async () => {
      const pattern = 'user.*';
      const options = { groupId: 'test-group' };

      await service.subscribePattern(pattern, mockHandler, options);

      expect(mockConsumer.subscribePattern).toHaveBeenCalledWith(
        pattern,
        expect.any(Function),
        options
      );
      expect(service['subscriptions'].get(`pattern:${pattern}`)).toBe(mockHandler);
    });

    it('should subscribe to pattern without options', async () => {
      const pattern = 'user.*';

      await service.subscribePattern(pattern, mockHandler);

      expect(mockConsumer.subscribePattern).toHaveBeenCalledWith(
        pattern,
        expect.any(Function),
        undefined
      );
    });

    it('should throw error when consumer is not initialized', async () => {
      mockEventSystem.consumer = null;

      await expect(service.subscribePattern('test.*', mockHandler))
        .rejects.toThrow('Event consumer not initialized');
    });

    it('should handle pattern subscription errors gracefully', async () => {
      const subscribeError = new Error('Pattern subscribe failed');
      mockConsumer.subscribePattern.mockRejectedValue(subscribeError);

      await expect(service.subscribePattern('test.*', mockHandler))
        .rejects.toThrow('Pattern subscribe failed');
    });
  });

  describe('unsubscribe', () => {
    it('should unsubscribe from an event type successfully', async () => {
      const eventType = 'user.created';
      
      // First subscribe
      await service.subscribe(eventType, mockHandler);
      expect(service['subscriptions'].has(eventType)).toBe(true);

      // Then unsubscribe
      await service.unsubscribe(eventType);

      expect(mockConsumer.unsubscribe).toHaveBeenCalledWith(eventType);
      expect(service['subscriptions'].has(eventType)).toBe(false);
    });

    it('should throw error when consumer is not initialized', async () => {
      mockEventSystem.consumer = null;

      await expect(service.unsubscribe('test.event'))
        .rejects.toThrow('Event consumer not initialized');
    });

    it('should handle unsubscribe errors gracefully', async () => {
      const unsubscribeError = new Error('Unsubscribe failed');
      mockConsumer.unsubscribe.mockRejectedValue(unsubscribeError);

      await expect(service.unsubscribe('test.event'))
        .rejects.toThrow('Unsubscribe failed');
    });
  });

  describe('unsubscribePattern', () => {
    it('should unsubscribe from a pattern successfully', async () => {
      const pattern = 'user.*';
      
      // First subscribe
      await service.subscribePattern(pattern, mockHandler);
      expect(service['subscriptions'].has(`pattern:${pattern}`)).toBe(true);

      // Then unsubscribe
      await service.unsubscribePattern(pattern);

      expect(mockConsumer.unsubscribePattern).toHaveBeenCalledWith(pattern);
      expect(service['subscriptions'].has(`pattern:${pattern}`)).toBe(false);
    });

    it('should throw error when consumer is not initialized', async () => {
      mockEventSystem.consumer = null;

      await expect(service.unsubscribePattern('test.*'))
        .rejects.toThrow('Event consumer not initialized');
    });

    it('should handle pattern unsubscribe errors gracefully', async () => {
      const unsubscribeError = new Error('Pattern unsubscribe failed');
      mockConsumer.unsubscribePattern.mockRejectedValue(unsubscribeError);

      await expect(service.unsubscribePattern('test.*'))
        .rejects.toThrow('Pattern unsubscribe failed');
    });
  });

  describe('getSubscriptions', () => {
    it('should return consumer subscriptions', () => {
      const subscriptions = service.getSubscriptions();

      expect(mockConsumer.getSubscriptions).toHaveBeenCalled();
      expect(subscriptions).toEqual([]);
    });

    it('should return empty array when consumer is not initialized', () => {
      mockEventSystem.consumer = null;

      const subscriptions = service.getSubscriptions();

      expect(subscriptions).toEqual([]);
    });

    it('should handle getSubscriptions errors gracefully', () => {
      const error = new Error('Get subscriptions failed');
      mockConsumer.getSubscriptions.mockImplementation(() => {
        throw error;
      });

      const subscriptions = service.getSubscriptions();

      expect(subscriptions).toEqual([]);
    });
  });

  describe('getStats', () => {
    it('should return consumer statistics', () => {
      const stats = service.getStats();

      expect(mockConsumer.getStats).toHaveBeenCalled();
      expect(stats).toEqual({ consumed: 10, failed: 0 });
    });

    it('should return null when consumer is not initialized', () => {
      mockEventSystem.consumer = null;

      const stats = service.getStats();

      expect(stats).toBeNull();
    });

    it('should handle getStats errors gracefully', () => {
      const error = new Error('Get stats failed');
      mockConsumer.getStats.mockImplementation(() => {
        throw error;
      });

      const stats = service.getStats();

      expect(stats).toBeNull();
    });
  });

  describe('discoverEventHandlers', () => {
    it('should discover event handlers from providers and controllers', async () => {
      const mockProvider = {
        instance: {
          handleUserCreated: jest.fn(),
          handleUserUpdated: jest.fn()
        }
      } as any;

      const mockController = {
        instance: {
          handleOrderCreated: jest.fn()
        }
      } as any;

      mockDiscoveryService.getProviders.mockReturnValue([mockProvider]);
      mockDiscoveryService.getControllers.mockReturnValue([mockController]);

      // Mock the scan methods
      service['scanInstanceForEventHandlers'] = jest.fn();
      service['scanInstanceForEventSubscribers'] = jest.fn();

      await service['discoverEventHandlers']();

      expect(service['scanInstanceForEventHandlers']).toHaveBeenCalledWith(mockProvider.instance);
      expect(service['scanInstanceForEventHandlers']).toHaveBeenCalledWith(mockController.instance);
      expect(service['scanInstanceForEventSubscribers']).toHaveBeenCalledWith(mockProvider.instance);
      expect(service['scanInstanceForEventSubscribers']).toHaveBeenCalledWith(mockController.instance);
    });

    it('should handle instances without instance property', async () => {
      const mockProvider = {} as any;

      mockDiscoveryService.getProviders.mockReturnValue([mockProvider]);
      mockDiscoveryService.getControllers.mockReturnValue([]);

      service['scanInstanceForEventHandlers'] = jest.fn();
      service['scanInstanceForEventSubscribers'] = jest.fn();

      await service['discoverEventHandlers']();

      expect(service['scanInstanceForEventHandlers']).not.toHaveBeenCalled();
      expect(service['scanInstanceForEventSubscribers']).not.toHaveBeenCalled();
    });
  });

  describe('scanInstanceForEventHandlers', () => {
    it('should scan instance for event handlers', () => {
      const mockInstance = {
        handleUserCreated: jest.fn(),
        handleUserUpdated: jest.fn()
      };

      const mockPrototype = Object.getPrototypeOf(mockInstance);
      
      // Mock the metadata scanner to call our callback
      mockMetadataScanner.scanFromPrototype.mockImplementation(
        (instance, prototype, callback) => {
          callback('handleUserCreated');
          callback('handleUserUpdated');
          return [];
        }
      );

      // Mock reflector to return metadata for one method
      mockReflector.get.mockReturnValueOnce({
        eventType: 'user.created',
        subscriptionOptions: { groupId: 'test-group' }
      });

      service['registerEventHandler'] = jest.fn();

      service['scanInstanceForEventHandlers'](mockInstance);

      expect(mockMetadataScanner.scanFromPrototype).toHaveBeenCalledWith(
        mockInstance,
        mockPrototype,
        expect.any(Function)
      );
      expect(service['registerEventHandler']).toHaveBeenCalledWith(
        { eventType: 'user.created', subscriptionOptions: { groupId: 'test-group' } },
        mockInstance,
        'handleUserCreated'
      );
    });
  });

  describe('scanInstanceForEventSubscribers', () => {
    it('should scan instance for event subscribers', () => {
      const mockInstance = {
        handleAllUserEvents: jest.fn()
      };

      const mockPrototype = Object.getPrototypeOf(mockInstance);
      
      mockMetadataScanner.scanFromPrototype.mockImplementation(
        (instance, prototype, callback) => {
          callback('handleAllUserEvents');
          return [];
        }
      );

      mockReflector.get.mockReturnValueOnce({
        eventType: 'user.*',
        subscriptionOptions: { pattern: true, groupId: 'test-group' }
      });

      service['registerEventSubscriber'] = jest.fn();

      service['scanInstanceForEventSubscribers'](mockInstance);

      expect(mockMetadataScanner.scanFromPrototype).toHaveBeenCalledWith(
        mockInstance,
        mockPrototype,
        expect.any(Function)
      );
      expect(service['registerEventSubscriber']).toHaveBeenCalledWith(
        { eventType: 'user.*', subscriptionOptions: { pattern: true, groupId: 'test-group' } },
        mockInstance,
        'handleAllUserEvents'
      );
    });
  });

  describe('registerEventHandler', () => {
    it('should register an event handler successfully', async () => {
      const metadata = {
        eventType: 'user.created',
        subscriptionOptions: { groupId: 'test-group', consumerId: 'test-consumer' }
      };

      const mockInstance = {
        handleUserCreated: jest.fn()
      };

      service['subscribe'] = jest.fn().mockResolvedValue(undefined);

      await service['registerEventHandler'](metadata, mockInstance, 'handleUserCreated');

      expect(service['subscribe']).toHaveBeenCalledWith(
        'user.created',
        expect.any(Function),
        { groupId: 'test-group', consumerId: 'test-consumer' }
      );
    });

    it('should handle registration errors gracefully', async () => {
      const metadata = {
        eventType: 'user.created',
        subscriptionOptions: { groupId: 'test-group' }
      };

      const mockInstance = {
        handleUserCreated: jest.fn()
      };

      service['subscribe'] = jest.fn().mockRejectedValue(new Error('Registration failed'));

      await service['registerEventHandler'](metadata, mockInstance, 'handleUserCreated');

      // Should not throw, just log error
      expect(service['subscribe']).toHaveBeenCalled();
    });
  });

  describe('registerEventSubscriber', () => {
    it('should register pattern-based event subscriber', async () => {
      const metadata = {
        eventType: 'user.*',
        subscriptionOptions: { pattern: true, groupId: 'test-group' }
      };

      const mockInstance = {
        handleAllUserEvents: jest.fn()
      };

      service['subscribePattern'] = jest.fn().mockResolvedValue(undefined);

      await service['registerEventSubscriber'](metadata, mockInstance, 'handleAllUserEvents');

      expect(service['subscribePattern']).toHaveBeenCalledWith(
        'user.*',
        expect.any(Function),
        { groupId: 'test-group' }
      );
    });

    it('should register regular event subscriber when pattern is false', async () => {
      const metadata = {
        eventType: 'user.created',
        subscriptionOptions: { pattern: false, groupId: 'test-group' }
      };

      const mockInstance = {
        handleUserCreated: jest.fn()
      };

      service['subscribe'] = jest.fn().mockResolvedValue(undefined);

      await service['registerEventSubscriber'](metadata, mockInstance, 'handleUserCreated');

      expect(service['subscribe']).toHaveBeenCalledWith(
        'user.created',
        expect.any(Function),
        { groupId: 'test-group' }
      );
    });

    it('should handle registration errors gracefully', async () => {
      const metadata = {
        eventType: 'user.*',
        subscriptionOptions: { pattern: true, groupId: 'test-group' }
      };

      const mockInstance = {
        handleAllUserEvents: jest.fn()
      };

      service['subscribePattern'] = jest.fn().mockRejectedValue(new Error('Registration failed'));

      await service['registerEventSubscriber'](metadata, mockInstance, 'handleAllUserEvents');

      // Should not throw, just log error
      expect(service['subscribePattern']).toHaveBeenCalled();
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
    it('should handle missing consumer gracefully', async () => {
      mockEventSystem.consumer = null;

      await expect(service.subscribe('test.event', mockHandler))
        .rejects.toThrow('Event consumer not initialized');
    });

    it('should handle consumer errors gracefully', async () => {
      const consumerError = new Error('Consumer error');
      mockConsumer.subscribe.mockRejectedValue(consumerError);

      await expect(service.subscribe('test.event', mockHandler))
        .rejects.toThrow('Consumer error');
    });
  });
});
