import { Module, Global } from '@nestjs/common';
import { EventsModule } from '@logistically/events-nestjs';
import { MemoryTransportPlugin, RedisStreamsPlugin } from '@logistically/events';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';
import { HealthController } from './health/health.controller';

@Global()
@Module({
  imports: [
    // Configure the events module with both memory and Redis transports
    // Enable autoDiscovery to automatically discover @EventHandler decorators
    EventsModule.forRoot({
      service: 'example-app',
      originPrefix: 'example',
      autoDiscovery: true, // Enable automatic event handler discovery
      transports: new Map([
        // Memory transport for development/testing
        ['memory', new MemoryTransportPlugin().createTransport({})],
        // Redis transport for production-like testing
        ['redis-streams', new RedisStreamsPlugin().createTransport({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD,
          db: parseInt(process.env.REDIS_DB || '0'),
        })]
      ]),
      // Routing configuration to determine which transport gets which messages
      routing: {
        routes: [
          // Route user events to Redis for persistence
          {
            pattern: 'user.*',
            transport: 'redis-streams',
            priority: 1
          },
          // Route order events to Redis for persistence
          {
            pattern: 'order.*',
            transport: 'redis-streams',
            priority: 1
          },
          // Route all other events to memory for fast processing
          {
            pattern: '*',
            transport: 'memory',
            priority: 2
          }
        ],
        validationMode: 'warn',
        originPrefix: 'example',
        topicMapping: {
          
        },
        defaultTopicStrategy: 'namespace',
        enablePatternRouting: true,
        enableBatching: true,
        enablePartitioning: false,
        enableConsumerGroups: false
      },
      publisher: {
        batching: {
          enabled: true,
          maxSize: 100,
          strategy: 'time',
          maxWaitMs: 1000,
          maxConcurrentBatches: 5
        }
      },
      global: true
    }),
    UsersModule,
    OrdersModule
  ],
  controllers: [HealthController],
})
export class AppModule {}
