import { Module } from '@nestjs/common';
import { EventsModule } from '@logistically/events-nestjs';
import { RedisStreamsPlugin, MemoryTransportPlugin } from '@logistically/events';
import { ConfigFactory } from '@logistically/events-nestjs';

@Module({
  imports: [
    // Use environment-based configuration with minimal user config
    EventsModule.forRoot({
      // Only specify what's different from environment defaults
      transports: new Map([
        ['redis', new RedisStreamsPlugin().createTransport({
          url: process.env.REDIS_URL || 'redis://localhost:6379',
          groupId: process.env.REDIS_GROUP_ID || 'nestjs-group',
          batchSize: parseInt(process.env.REDIS_BATCH_SIZE || '100'),
          enableDLQ: process.env.REDIS_ENABLE_DLQ !== 'false',
          dlqStreamPrefix: process.env.REDIS_DLQ_STREAM_PREFIX || 'dlq:',
          maxRetries: parseInt(process.env.REDIS_MAX_RETRIES || '3'),
        })],
        ['memory', new MemoryTransportPlugin().createTransport({
          originPrefix: process.env.MEMORY_ORIGIN_PREFIX,
          enablePatternMatching: process.env.MEMORY_PATTERN_MATCHING !== 'false',
        })]
      ]),
      
      // Override specific environment defaults
      service: process.env.SERVICE_NAME || 'my-service',
      originPrefix: process.env.EVENTS_ORIGIN_PREFIX || 'eu.de',
      
      // Custom publisher configuration
      publisher: {
        batching: {
          enabled: process.env.EVENTS_BATCHING_ENABLED !== 'false',
          maxSize: parseInt(process.env.EVENTS_BATCHING_MAX_SIZE || '1000'),
          maxWaitMs: parseInt(process.env.EVENTS_BATCHING_MAX_WAIT_MS || '100'),
          strategy: (process.env.EVENTS_BATCHING_STRATEGY as any) || 'size',
        },
        retry: {
          maxRetries: parseInt(process.env.EVENTS_RETRY_MAX_ATTEMPTS || '3'),
          backoffStrategy: (process.env.EVENTS_RETRY_BACKOFF_STRATEGY as any) || 'exponential',
        },
      },
      
      // Custom consumer configuration
      consumer: {
        enablePatternRouting: process.env.EVENTS_PATTERN_ROUTING === 'true',
        enableConsumerGroups: process.env.EVENTS_CONSUMER_GROUPS !== 'false',
      },
    }),
  ],
})
export class EnvironmentConfigModule {}

// Alternative: Use ConfigFactory directly for more control
@Module({
  imports: [
    EventsModule.forRoot(
      ConfigFactory.mergeWithDefaults({
        service: 'custom-service',
        transports: new Map([
          ['redis', new RedisStreamsPlugin().createTransport(
            ConfigFactory.createRedisConfig()
          )],
          ['memory', new MemoryTransportPlugin().createTransport(
            ConfigFactory.createMemoryConfig()
          )]
        ]),
        // Custom overrides
        validationMode: 'strict',
        global: false,
      })
    ),
  ],
})
export class CustomConfigModule {}

// Environment variables that can be set:
/*
# Required
SERVICE_NAME=my-service
REDIS_URL=redis://localhost:6379

# Optional with defaults
EVENTS_ORIGIN_PREFIX=eu.de
EVENTS_VALIDATION_MODE=warn
EVENTS_GLOBAL=true
EVENTS_AUTO_DISCOVERY=true

# Publisher configuration
EVENTS_BATCHING_ENABLED=true
EVENTS_BATCHING_MAX_SIZE=1000
EVENTS_BATCHING_MAX_WAIT_MS=100
EVENTS_BATCHING_STRATEGY=size
EVENTS_RETRY_MAX_ATTEMPTS=3
EVENTS_RETRY_BACKOFF_STRATEGY=exponential
EVENTS_RETRY_BASE_DELAY=1000
EVENTS_RETRY_MAX_DELAY=10000

# Consumer configuration
EVENTS_PATTERN_ROUTING=false
EVENTS_CONSUMER_GROUPS=true

# Discovery configuration
EVENTS_SCAN_CONTROLLERS=true
EVENTS_SCAN_PROVIDERS=true

# Interceptor configuration
EVENTS_REQUEST_EVENTS=true
EVENTS_RESPONSE_EVENTS=true
EVENTS_CORRELATION_ID_HEADER=x-correlation-id
EVENTS_CAUSATION_ID_HEADER=x-causation-id

# Redis transport configuration
REDIS_GROUP_ID=nestjs-group
REDIS_BATCH_SIZE=100
REDIS_ENABLE_DLQ=true
REDIS_DLQ_STREAM_PREFIX=dlq:
REDIS_MAX_RETRIES=3
REDIS_ENABLE_COMPRESSION=false
REDIS_ENABLE_PARTITIONING=false
REDIS_PARTITION_COUNT=1

# Memory transport configuration
MEMORY_ORIGIN_PREFIX=
MEMORY_PATTERN_MATCHING=true
MEMORY_MAX_MESSAGE_SIZE=1048576
*/
