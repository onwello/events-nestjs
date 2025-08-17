import { Module } from '@nestjs/common';
import { EventsModule } from '@logistically/events-nestjs';
import { RedisStreamsPlugin, MemoryTransportPlugin } from '@logistically/events';
import { UserService } from './user-service.example';

@Module({
  imports: [
    // Configure the events module with Redis Streams transport
    EventsModule.forRoot({
      service: 'user-service',
      originPrefix: 'eu.de',
      transports: new Map([
        ['redis', new RedisStreamsPlugin().createTransport({
          url: 'redis://localhost:6379',
          groupId: 'user-service-group',
          batchSize: 100,
          enableDLQ: true,
          dlqStreamPrefix: 'dlq:',
          maxRetries: 3
        })],
        // Fallback to memory transport for testing
        ['memory', new MemoryTransportPlugin().createTransport({})]
      ]),
      // Enable publisher batching for high throughput
      publisher: {
        batching: {
          enabled: true,
          maxSize: 1000,
          maxWaitMs: 100,
          maxConcurrentBatches: 5,
          strategy: 'size'
        },
        retry: {
          maxRetries: 3,
          backoffStrategy: 'exponential',
          baseDelay: 1000,
          maxDelay: 10000
        }
      },
      // Enable consumer features
      consumer: {
        enablePatternRouting: true,
        enableConsumerGroups: true,
        validationMode: 'warn'
      },
      // Set validation mode
      validationMode: 'strict',
      // Enable auto-discovery of event handlers
      autoDiscovery: true,
      // Make the module global
      global: true
    }),
  ],
  providers: [UserService],
  exports: [UserService],
})
export class AppModule {}

// Alternative configuration for development/testing
@Module({
  imports: [
    EventsModule.forRoot({
      service: 'user-service-dev',
      transports: new Map([
        ['memory', new MemoryTransportPlugin().createTransport({})]
      ]),
      validationMode: 'warn',
      autoDiscovery: true,
      global: true
    }),
  ],
  providers: [UserService],
  exports: [UserService],
})
export class DevAppModule {}

// Feature module example
@Module({
  imports: [
    // Import only the feature services (publisher/consumer)
    EventsModule.forFeature(),
  ],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
