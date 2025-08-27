import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventDiscoveryService } from '../services/event-discovery.service';

/**
 * Base class that automatically registers event handlers when extended
 * This provides a clean, automatic way to register event handlers without manual calls
 */
@Injectable()
export abstract class AutoEventHandlerBase implements OnModuleInit {
  constructor(protected readonly eventDiscoveryService: EventDiscoveryService) {}

  async onModuleInit() {
    // Auto-register event handlers with retry logic
    await this.registerEventHandlersWithRetry();
  }

  private async registerEventHandlersWithRetry(maxRetries = 5, delay = 1000): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const registeredCount = await this.eventDiscoveryService.registerEventHandlers(this);
        if (registeredCount > 0) {
          console.log(`Auto-registered ${registeredCount} event handlers for ${this.constructor.name}`);
          return; // Success, exit retry loop
        } else {
          console.log(`No event handlers found for ${this.constructor.name}`);
          return; // No handlers to register, exit retry loop
        }
      } catch (error) {
        if (attempt === maxRetries) {
          console.error(`Failed to auto-register event handlers for ${this.constructor.name} after ${maxRetries} attempts:`, error);
          return;
        }
        
        console.log(`Attempt ${attempt}/${maxRetries} failed for ${this.constructor.name}, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}
