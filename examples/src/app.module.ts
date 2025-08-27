import { Module } from '@nestjs/common';
import { EventsModule } from '@logistically/events-nestjs';
import { RedisStreamsPlugin } from '@logistically/events';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    EventsModule.forRoot({
      service: 'example-app',
      originPrefix: 'example',
      transports: new Map([
        ['redis', new RedisStreamsPlugin().createTransport({
          url: 'redis://localhost:6379',
          groupId: 'example-app-group',
          batchSize: 100,
          enableDLQ: true,
          dlqStreamPrefix: 'dlq:',
          maxRetries: 3
        })],
        ['memory', new (require('@logistically/events').MemoryTransportPlugin)().createTransport({})]
      ]),
      routing: {
        routes: [
          { pattern: 'user.*', transport: 'redis' },
          { pattern: 'order.*', transport: 'redis' },
          { pattern: 'system.*', transport: 'memory' }
        ],
        validationMode: 'warn',
        topicMapping: {},
        defaultTopicStrategy: 'namespace'
      },
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
      consumer: {
        enablePatternRouting: true,
        enableConsumerGroups: true,
        validationMode: 'warn'
      },
      validationMode: 'strict',
      autoDiscovery: true,
      global: true
    }),
    UsersModule,
    OrdersModule
  ],
  controllers: [HealthController],
  providers: []
})
export class AppModule {}
