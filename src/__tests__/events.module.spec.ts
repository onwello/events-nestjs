import { Test, TestingModule } from '@nestjs/testing';
import { EventsModule } from '../modules/events.module';

describe('EventsModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        EventsModule.forRoot({
          service: 'test-service',
          transports: new Map(),
        }),
      ],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have EventsModule imported', () => {
    const eventsModule = module.get(EventsModule);
    expect(eventsModule).toBeDefined();
  });
});
