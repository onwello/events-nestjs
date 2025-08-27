import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventDiscoveryService } from '../services/event-discovery.service';

/**
 * Base class for automatic event handler registration
 * Services that extend this class will automatically have their event handlers registered
 */
@Injectable()
export abstract class AutoEventsBase implements OnModuleInit {
  constructor(protected readonly eventDiscoveryService: EventDiscoveryService) {}

  async onModuleInit() {
    await this.autoRegisterEventHandlers();
  }

  private async autoRegisterEventHandlers(): Promise<void> {
    try {
      const registeredCount = await this.eventDiscoveryService.autoRegisterService(this);
      if (registeredCount > 0) {
        console.log(`✅ Auto-registered ${registeredCount} event handlers for ${this.constructor.name}`);
      }
    } catch (error) {
      console.error(`❌ Failed to auto-register event handlers for ${this.constructor.name}:`, error);
    }
  }
}
