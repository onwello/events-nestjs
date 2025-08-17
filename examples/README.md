# Examples Directory

This directory contains comprehensive examples demonstrating how to use `@logistically/events-nestjs` in various scenarios. Each example showcases different aspects of the library and provides practical implementation patterns.

## 📁 Example Files

### 1. **Basic Examples**

#### `app.module.example.ts`
- **Purpose**: Basic module configuration and setup
- **Features**: Simple Redis Streams and Memory transport configuration
- **Use Case**: Getting started with the library, basic event publishing/consuming
- **Complexity**: ⭐ Beginner

#### `user-service.example.ts`
- **Purpose**: Basic service implementation with events
- **Features**: Event handlers, publishers, and utility methods
- **Use Case**: Understanding basic event-driven service patterns
- **Complexity**: ⭐ Beginner

#### `environment-config.example.ts`
- **Purpose**: Environment-based configuration management
- **Features**: Environment variables, ConfigFactory usage, flexible configuration
- **Use Case**: Production deployments, configuration management
- **Complexity**: ⭐⭐ Intermediate

### 2. **Advanced Examples**

#### `advanced-features.example.ts`
- **Purpose**: Showcase all advanced features of the library
- **Features**: 
  - Redis Cluster/Sentinel support
  - Advanced partitioning strategies
  - Message ordering and schema management
  - Content-based routing and metrics
  - Dead Letter Queues and message replay
- **Use Case**: Production systems, high-scale applications
- **Complexity**: ⭐⭐⭐⭐⭐ Expert

#### `microservices.example.ts`
- **Purpose**: Distributed system architecture with events
- **Features**: 
  - Multiple service modules
  - Cross-service event communication
  - Service-specific configurations
  - Event correlation and causation
- **Use Case**: Microservices architecture, distributed systems
- **Complexity**: ⭐⭐⭐⭐ Advanced

#### `testing-development.example.ts`
- **Purpose**: Testing strategies and development workflows
- **Features**: 
  - Test configurations
  - Development vs production setups
  - Performance testing
  - Integration testing patterns
- **Use Case**: Development workflows, testing strategies
- **Complexity**: ⭐⭐⭐ Intermediate

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Redis server (for Redis Streams examples)
- NestJS 10+ project

### Installation
```bash
# Install the library
npm install @logistically/events-nestjs

# Install core events library
npm install @logistically/events
```

### Quick Start
1. **Copy the basic examples** (`app.module.example.ts`, `user-service.example.ts`)
2. **Adapt to your project structure**
3. **Configure your Redis connection**
4. **Start with simple event publishing/consuming**

## 📚 Learning Path

### **Phase 1: Basics** (Beginner)
1. Start with `app.module.example.ts` to understand module configuration
2. Implement `user-service.example.ts` to learn event handling
3. Experiment with basic event publishing and consuming

### **Phase 2: Configuration** (Intermediate)
1. Study `environment-config.example.ts` for configuration management
2. Learn about different transport configurations
3. Understand validation modes and auto-discovery

### **Phase 3: Advanced Features** (Advanced)
1. Explore `advanced-features.example.ts` for production features
2. Implement Redis Cluster/Sentinel for high availability
3. Configure advanced partitioning and message ordering

### **Phase 4: Architecture** (Expert)
1. Study `microservices.example.ts` for distributed systems
2. Implement cross-service event communication
3. Design event-driven microservices architecture

### **Phase 5: Quality Assurance** (All Levels)
1. Use `testing-development.example.ts` for testing strategies
2. Implement proper testing patterns
3. Set up development vs production configurations

## 🔧 Configuration Examples

### Basic Configuration
```typescript
EventsModule.forRoot({
  service: 'my-service',
  transports: new Map([
    ['redis', new RedisStreamsPlugin().createTransport({
      url: 'redis://localhost:6379',
      groupId: 'my-group'
    })]
  ])
})
```

### Advanced Configuration
```typescript
EventsModule.forRoot({
  service: 'advanced-service',
  transports: new Map([
    ['redis', new RedisStreamsPlugin().createTransport({
      url: 'redis://localhost:6379',
      cluster: { enabled: true, nodes: ['redis://localhost:7000'] },
      partitioning: { enabled: true, strategy: 'hash', partitionCount: 8 },
      ordering: { enabled: true, strategy: 'global-sequence' }
    })]
  ]),
  publisher: {
    batching: { enabled: true, strategy: 'partition' },
    retry: { maxRetries: 5, backoffStrategy: 'fibonacci' }
  }
})
```

## 🏗️ Architecture Patterns

### **Event-Driven Service**
```typescript
@Injectable()
export class MyService {
  @EventPublisher({ eventType: 'my.event' })
  async doSomething(): Promise<void> {
    // Business logic
    const event = EventUtils.createDomainEvent(/* ... */);
    await this.eventPublisher.publishEvent(event);
  }

  @EventHandler({ eventType: 'my.event' })
  async handleEvent(event: NestJSEvent<any>): Promise<void> {
    // Event handling logic
  }
}
```

### **Cross-Service Communication**
```typescript
// Service A publishes event
const event = EventUtils.createDomainEvent(
  'user.created',
  userData,
  'service-a',
  userId,
  1,
  { correlationId: correlationId }
);

// Service B handles event
@EventHandler({ eventType: 'user.created' })
async handleUserCreated(event: NestJSEvent<any>): Promise<void> {
  const correlationId = event.nestjsMetadata?.correlationId;
  // Process with correlation tracking
}
```

## 🧪 Testing Strategies

### **Unit Testing**
```typescript
describe('MyService', () => {
  let service: MyService;
  let eventPublisher: EventPublisherService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [TestModule], // Uses memory transport
    }).compile();

    service = module.get<MyService>(MyService);
    eventPublisher = module.get<EventPublisherService>(EventPublisherService);
  });

  it('should publish event', async () => {
    const publishSpy = jest.spyOn(eventPublisher, 'publishEvent');
    await service.doSomething();
    expect(publishSpy).toHaveBeenCalled();
  });
});
```

### **Integration Testing**
```typescript
describe('Event Flow Integration', () => {
  it('should handle complete event flow', async () => {
    // 1. Publish event
    await service.publishEvent(data);
    
    // 2. Wait for processing
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 3. Verify results
    expect(result).toBeDefined();
  });
});
```

## 🔍 Debugging and Monitoring

### **Development Mode**
```typescript
// Enable debug logging
transports: new Map([
  ['memory', new MemoryTransportPlugin().createTransport({
    debug: process.env.NODE_ENV === 'development'
  })]
])
```

### **Metrics and Health Checks**
```typescript
@Controller('health')
export class HealthController {
  @Get()
  async getHealth() {
    const metrics = await this.eventSystem.getMetrics();
    return {
      status: 'healthy',
      uptime: metrics.uptime,
      activeConnections: metrics.activeConnections
    };
  }
}
```

## 📊 Performance Considerations

### **Batching Strategies**
```typescript
publisher: {
  batching: {
    enabled: true,
    strategy: 'partition', // 'size' | 'time' | 'partition'
    maxSize: 1000,
    maxWaitMs: 200
  }
}
```

### **Partitioning for Scale**
```typescript
partitioning: {
  enabled: true,
  strategy: 'hash', // 'hash' | 'round-robin' | 'key-based' | 'dynamic'
  partitionCount: 8,
  partitionKeyExtractor: (event) => event.body?.userId
}
```

## 🚨 Error Handling

### **Dead Letter Queues**
```typescript
enableDLQ: true,
dlqStreamPrefix: 'dlq:my-service:',
dlqRetention: {
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  maxSize: 10000
}
```

### **Retry Policies**
```typescript
retry: {
  maxRetries: 3,
  backoffStrategy: 'exponential', // 'exponential' | 'fixed' | 'fibonacci'
  baseDelay: 1000,
  maxDelay: 10000
}
```

## 🔐 Security Considerations

### **Environment Variables**
```bash
# Never commit sensitive configuration
REDIS_PASSWORD=your_redis_password
REDIS_SENTINEL_PASSWORD=your_sentinel_password
SERVICE_SECRET_KEY=your_service_key
```

### **Validation Modes**
```typescript
validationMode: 'strict', // 'strict' | 'warn' | 'none'
schemaValidation: {
  enabled: true,
  strictMode: true,
  allowUnknownFields: false
}
```

## 📈 Scaling Strategies

### **Horizontal Scaling**
- Use consumer groups for load distribution
- Implement partitioning for parallel processing
- Configure multiple service instances

### **Vertical Scaling**
- Optimize batch sizes and timeouts
- Configure appropriate retry policies
- Monitor and adjust resource allocation

## 🤝 Contributing

When adding new examples:
1. **Follow the existing structure** and naming conventions
2. **Include comprehensive comments** explaining the purpose
3. **Provide environment variable examples** for configuration
4. **Add appropriate complexity ratings** (⭐ to ⭐⭐⭐⭐⭐)
5. **Include testing examples** where applicable
6. **Document any dependencies** or prerequisites

## 📚 Additional Resources

- [Main README](../README.md) - Complete library documentation
- [API Reference](../docs/api.md) - Detailed API documentation
- [Configuration Guide](../docs/configuration.md) - Configuration options
- [Testing Guide](../docs/testing.md) - Testing strategies and patterns

## 🆘 Getting Help

- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check the main README and docs
- **Examples**: Study these examples for implementation patterns

---

**Happy Event-Driven Development! 🚀**
