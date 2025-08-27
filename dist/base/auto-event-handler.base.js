"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoEventHandlerBase = void 0;
const common_1 = require("@nestjs/common");
const event_discovery_service_1 = require("../services/event-discovery.service");
/**
 * Base class that automatically registers event handlers when extended
 * This provides a clean, automatic way to register event handlers without manual calls
 */
let AutoEventHandlerBase = class AutoEventHandlerBase {
    constructor(eventDiscoveryService) {
        this.eventDiscoveryService = eventDiscoveryService;
    }
    async onModuleInit() {
        // Auto-register event handlers with retry logic
        await this.registerEventHandlersWithRetry();
    }
    async registerEventHandlersWithRetry(maxRetries = 5, delay = 1000) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const registeredCount = await this.eventDiscoveryService.registerEventHandlers(this);
                if (registeredCount > 0) {
                    console.log(`Auto-registered ${registeredCount} event handlers for ${this.constructor.name}`);
                    return; // Success, exit retry loop
                }
                else {
                    console.log(`No event handlers found for ${this.constructor.name}`);
                    return; // No handlers to register, exit retry loop
                }
            }
            catch (error) {
                if (attempt === maxRetries) {
                    console.error(`Failed to auto-register event handlers for ${this.constructor.name} after ${maxRetries} attempts:`, error);
                    return;
                }
                console.log(`Attempt ${attempt}/${maxRetries} failed for ${this.constructor.name}, retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
};
exports.AutoEventHandlerBase = AutoEventHandlerBase;
exports.AutoEventHandlerBase = AutoEventHandlerBase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_discovery_service_1.EventDiscoveryService])
], AutoEventHandlerBase);
