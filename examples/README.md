# Examples

This directory contains working examples demonstrating how to use `@logistically/events-nestjs` in real applications.

## Getting Started

### Prerequisites

- Node.js 18+
- Redis (optional, for Redis Streams examples)

### Installation

```bash
cd examples
npm install
```

### Running the Examples

```bash
# Start the example application
npm run start:dev

# The application will be available at:
# - Main app: http://localhost:3009
# - Health check: http://localhost:3009/health
# - Users API: http://localhost:3009/users
# - Orders API: http://localhost:3009/orders
```

## Example Structure

### Application Architecture

```
src/
├── app.module.ts           # Main application module with EventsModule configuration
├── main.ts                 # Application entry point
├── health/                 # Health check controller
│   └── health.controller.ts
├── users/                  # User management module
│   ├── users.module.ts     # User module configuration
│   ├── users.service.ts    # User service with event handlers
│   └── users.controller.ts # User REST API
└── orders/                 # Order management module
    ├── orders.module.ts    # Order module configuration
    ├── orders.service.ts   # Order service with event handlers
    └── orders.controller.ts # Order REST API
```

### Key Features Demonstrated

1. **Automatic Event Handler Discovery** - Services automatically register their event handlers
2. **Cross-Service Event Handling** - Services can handle events from other services
3. **Pattern-Based Event Routing** - Events routed to appropriate transports
4. **Multiple Transport Support** - Redis Streams and Memory transport examples
5. **Event Publishing** - Services publish events during business operations

## Example Services

### User Service

The `UserService` demonstrates:

- **Event Handler Registration**: Automatically registers handlers using `@AutoEvents()`
- **User Creation Events**: Publishes `user.registered` events when users are created
- **Cross-Service Event Handling**: Handles order-related events from other services

```typescript
@Injectable()
@AutoEvents()
export class UsersService {
  @AutoEventHandler({ eventType: 'user.registered' })
  async handleUserRegistered(event: NestJSEvent<User>) {
    // Handle user registration events
  }

  @AutoEventHandler({ eventType: 'order.created' })
  async handleOrderCreated(event: NestJSEvent<Order>) {
    // Handle order creation events
  }
}
```

### Order Service

The `OrderService` demonstrates:

- **Event Publishing**: Publishes `order.created` events when orders are created
- **Event Handler Registration**: Automatically registers order-related handlers
- **Business Logic Integration**: Events published as part of business operations

```typescript
@Injectable()
@AutoEvents()
export class OrdersService {
  async createOrder(userId: number, items: string[], total: number) {
    // Business logic
    const order = { /* order data */ };
    
    // Publish event
    await this.eventPublisher.publish('order.created', order);
    
    return order;
  }
}
```

## Configuration Examples

### Basic Configuration

```typescript
EventsModule.forRoot({
  service: 'example-app',
  originPrefix: 'example',
  autoDiscovery: true,
  global: true
})
```

### Advanced Configuration with Redis

```typescript
EventsModule.forRoot({
  service: 'example-app',
  originPrefix: 'example',
  autoDiscovery: true,
  global: true,
  
  transports: new Map([
    ['redis', new RedisStreamsPlugin().createTransport({
      url: 'redis://localhost:6379',
      groupId: 'example-app-group',
      batchSize: 100,
      enableDLQ: true,
      maxRetries: 3
    })],
    ['memory', new MemoryTransportPlugin().createTransport()]
  ]),
  
  routing: {
    routes: [
      { pattern: 'user.*', transport: 'redis' },
      { pattern: 'order.*', transport: 'redis' },
      { pattern: 'system.*', transport: 'memory' }
    ]
  }
})
```

## Testing the Examples

### Create a User

```bash
curl -X POST http://localhost:3009/users \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "name": "Test User"}'
```

**Expected Result**: User created and `user.registered` event published

### Create an Order

```bash
curl -X POST http://localhost:3009/orders \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "items": ["Laptop"], "total": 999.99}'
```

**Expected Result**: Order created and `order.created` event published

### View Data

```bash
# Get all users
curl http://localhost:3009/users

# Get all orders
curl http://localhost:3009/orders
```

## Event Flow

1. **User Creation**: `POST /users` → `user.registered` event published
2. **Order Creation**: `POST /orders` → `order.created` event published
3. **Event Handling**: Both services automatically handle relevant events
4. **Cross-Service Communication**: Services react to events from other services

## Monitoring and Debugging

### Enable Debug Logging

```typescript
EventsModule.forRoot({
  // ... other config
  debug: true
})
```

### Check Event Handler Registration

Look for logs like:
```
[EventDiscoveryService] Registered auto event handler: UsersService.handleUserRegistered for user.registered
[EventDiscoveryService] Registered auto event handler: OrdersService.handleOrderCreated for order.created
```

### Verify Event Consumption

Look for logs like:
```
🎉 Auto-handler: User registered event received: {...}
🎉 Auto-handler: Order created event received: {...}
```

## Customization

### Adding New Event Types

1. **Define the event type** in your service
2. **Add the handler** with `@AutoEventHandler()`
3. **Publish the event** using `EventPublisherService`

### Adding New Services

1. **Create the service** with `@AutoEvents()` decorator
2. **Inject EventDiscoveryService** for automatic registration
3. **Add event handlers** as needed
4. **Register in your module**

### Custom Transport Configuration

```typescript
const customTransport = new CustomTransportPlugin().createTransport({
  // Your custom configuration
});

transports: new Map([
  ['custom', customTransport]
])
```

## Troubleshooting

### Common Issues

1. **Handlers not registered**: Check `@AutoEvents()` decorator and `EventDiscoveryService` injection
2. **Events not received**: Verify transport configuration and event routing
3. **Redis connection issues**: Check Redis server status and connection parameters

### Debug Steps

1. Enable debug logging
2. Check service initialization logs
3. Verify event handler registration
4. Test event publishing and consumption
5. Check transport-specific logs

## Next Steps

After running these examples:

1. **Explore the code** to understand the implementation
2. **Modify the examples** to test different scenarios
3. **Add your own services** with event handlers
4. **Configure Redis** for production-like testing
5. **Implement your own event types** and handlers

For more information, see the main [README.md](../README.md) and [Quick Start Guide](../QUICKSTART.md).
