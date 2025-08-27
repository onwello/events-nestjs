const { NestFactory } = require('@nestjs/core');
const { Module, Injectable, OnEvent } = require('@nestjs/common');
const { EventEmitterModule } = require('@nestjs/event-emitter');

@Injectable()
class TestService {
  @OnEvent('test.event')
  handleTestEvent(payload) {
    console.log('Event received:', payload);
  }
}

@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [TestService],
})
class AppModule {}

async function bootstrap() {
  console.log('Starting test application...');
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  console.log('Application started on port 3000');
  
  // Test event emission
  const eventEmitter = app.get('EventEmitter2');
  eventEmitter.emit('test.event', { message: 'Hello from test!' });
}

bootstrap().catch(console.error);
