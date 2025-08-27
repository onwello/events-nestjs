# NestJS Events Example Application

This example demonstrates how to use the `@logistically/events-nestjs` library with NestJS to implement a robust event-driven architecture.

## 🚀 Features Demonstrated

- **Automatic Event Handler Discovery**: Using `@AutoEventHandler` decorators
- **Pattern-Based Event Routing**: Support for wildcard patterns like `user.*` and specific event types
- **Full Event Envelopes**: Complete event structure with headers, body, and metadata
- **Redis Transport Integration**: Production-ready event persistence
- **Hybrid Transport Configuration**: Memory and Redis transports working together
- **Event Handler Registration**: Manual registration using `EventDiscoveryService`

## 📋 Prerequisites

- Node.js 18+ and npm
- Redis (running via Docker or locally)
- Basic understanding of NestJS

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Build the application
npm run build
```

## ⚙️ Configuration

### Redis Setup

The application is configured to use Redis for event persistence. Redis should be running and accessible.

**Docker (Recommended):**
```bash
docker run -d --name redis-shared -p 6379:6379 redis:7-alpine
```

**Environment Variables:**
```bash
# Redis connection settings (optional - defaults shown)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### Application Configuration

The main configuration is in `src/app.module.ts`:

```typescript
EventsModule.forRoot({
  service: 'example-app',
  originPrefix: 'example',
  autoDiscovery: true, // Enable automatic event handler discovery
  transports: new Map([
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
      }
    ],
    validationMode: 'warn',
    originPrefix: 'example',
    topicMapping: {
      'user.*': 'user-events',
      'order.*': 'order-events'
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
})
```

#### Event Routing Configuration

The `routing` configuration determines which transport gets which messages using pattern-based routing:

- **User Events** (`user.*`): Routed to Redis for persistence
- **Order Events** (`order.*`): Routed to Redis for persistence

**Routing Configuration Features:**
- **Pattern Matching**: Uses wildcard patterns (`user.*`, `order.*`)
- **Transport Selection**: Routes events to specific transports based on patterns
- **Priority System**: Higher priority routes are evaluated first
- **Topic Mapping**: Maps patterns to specific topics for organization

**Topic Organization:**
- `user-events`: All user-related events
- `order-events`: All order-related events

This allows you to:
- ✅ **Persist Important Events**: User and order events are stored in Redis
- ✅ **Topic Organization**: Events are organized into logical topics
- ✅ **Pattern-Based Routing**: Flexible event routing with wildcard patterns

## 🏃‍♂️ Running the Application

```bash
# Start the development server
npm run start:dev
```

The application will start on `http://localhost:3009`.

## 🧪 Testing

### 1. Event Consumption Test

Test that events are being published and consumed correctly:

```bash
node test-event-consumption.js
```

**Expected Output:**
```
✅ User created: { id: 3, name: 'Event Test User', email: 'eventtest@example.com' }
✅ Order created: { id: 3, userId: 3, items: ['Event Test Item'], total: 199.99, status: 'pending' }
✅ User updated: { id: 3, name: 'Updated Event Test User', email: 'eventtest@example.com' }
✅ User deleted
```

**Check Server Logs For:**
- "All user events received" (from pattern handler)
- "User updated event received" (from specific handler)
- "Order created event received" (from specific handler)

### 2. Redis Transport Test

Test that events are being persisted in Redis:

```bash
node test-redis.js
```

**Verify Redis Storage:**
```bash
# Check if events are stored in Redis
docker exec redis-shared redis-cli xlen user-events
docker exec redis-shared redis-cli xlen order-events
```

## 📊 API Endpoints

### Users API

- `POST /users` - Create a user (triggers `user.created`)
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user (triggers `user.updated`)
- `DELETE /users/:id` - Delete user (triggers `user.deleted`)

### Orders API

- `POST /orders` - Create an order (triggers `order.created`)
- `GET /orders` - Get all orders
- `GET /orders/:id` - Get order by ID
- `PUT /orders/:id/status` - Update order status (triggers `order.updated`)

### Health Check

- `GET /health` - Application health status

## 🔧 Event Handler Implementation

### Automatic Event Handler Discovery

The `OrdersService` demonstrates automatic event handler discovery:

```typescript
@Injectable()
export class OrdersService implements OnModuleInit {
  constructor(
    private readonly eventPublisher: EventPublisherService,
    private readonly eventDiscoveryService: EventDiscoveryService,
  ) {}

  async onModuleInit() {
    // Register event handlers automatically
    await this.eventDiscoveryService.registerEventHandlers(this);
  }

  // Pattern-based handler for all user events
  @AutoEventHandler({ eventType: 'user.*' })
  async handleAllUserEvents(event: NestJSEvent<any>) {
    this.logger.log(`All user events received: ${JSON.stringify(event)}`);
  }

  // Specific handler for user updates
  @AutoEventHandler({ eventType: 'user.updated' })
  async handleUserUpdated(event: NestJSEvent<any>) {
    this.logger.log(`User updated event received: ${JSON.stringify(event)}`);
  }

  // Specific handler for order creation
  @AutoEventHandler({ eventType: 'order.created' })
  async handleOrderCreated(event: NestJSEvent<any>) {
    this.logger.log(`Order created event received: ${JSON.stringify(event)}`);
  }
}
```

### Event Structure

Events are published as complete envelopes with full metadata:

```typescript
{
  "header": {
    "id": "fb55637c-4c8c-4781-8700-5237fecc0dc2",
    "type": "user.created",
    "origin": "example-app",
    "originPrefix": "example",
    "timestamp": "2025-08-27T15:46:50.397Z",
    "hash": "873f6c9553a92b3c3a2d9531666a00e2c4be6dfa3c077180fc6784ab0c6ff6a6",
    "version": "1.0.0"
  },
  "body": {
    "user": {
      "id": 3,
      "name": "Event Test User",
      "email": "eventtest@example.com"
    },
    "timestamp": "2025-08-27T15:46:50.397Z"
  }
}
```

## 🎯 Key Features

1. **Automatic Discovery**: Event handlers are automatically discovered and registered
2. **Pattern Routing**: Support for wildcard patterns (`user.*`, `order.*`)
3. **Full Event Envelopes**: Complete event structure with headers and metadata
4. **Redis Persistence**: Events are stored in Redis for durability
5. **Topic Organization**: Events are organized into logical topics
6. **Batching Support**: Publisher batching for improved performance
7. **Error Handling**: Comprehensive error handling and logging

## 📝 Notes

- **Transport Names**: Use `'redis-streams'` as the transport name for Redis
- **Pattern Matching**: Wildcard patterns work for both publishing and subscribing
- **Event Handlers**: Receive complete event envelopes, not just the body
- **Topic Mapping**: Optional but recommended for organization
- **Priority Routing**: Higher priority routes are evaluated first

## 🚀 Production Considerations

- **Redis Configuration**: Configure Redis with appropriate persistence settings
- **Monitoring**: Add monitoring for event processing and Redis performance
- **Scaling**: Consider Redis clustering for high-throughput scenarios
- **Security**: Implement proper authentication and authorization
- **Backup**: Set up Redis backup and recovery procedures
