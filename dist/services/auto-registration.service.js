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
var AutoRegistrationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoRegistrationService = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const event_discovery_service_1 = require("./event-discovery.service");
const auto_register_events_decorator_1 = require("../decorators/auto-register-events.decorator");
let AutoRegistrationService = AutoRegistrationService_1 = class AutoRegistrationService {
    constructor(moduleRef, eventDiscoveryService) {
        this.moduleRef = moduleRef;
        this.eventDiscoveryService = eventDiscoveryService;
        this.logger = new common_1.Logger(AutoRegistrationService_1.name);
    }
    async onModuleInit() {
        this.logger.log('AutoRegistrationService initialized - will register event handlers automatically');
    }
    /**
     * Register event handlers for a specific instance
     * This method is called automatically for classes decorated with @AutoRegisterEvents
     */
    async registerEventHandlers(instance) {
        const instanceName = instance.constructor?.name || 'Unknown';
        try {
            const registeredCount = await this.eventDiscoveryService.registerEventHandlers(instance);
            if (registeredCount > 0) {
                this.logger.log(`Auto-registered ${registeredCount} event handlers for ${instanceName}`);
            }
            return registeredCount;
        }
        catch (error) {
            this.logger.error(`Failed to auto-register event handlers for ${instanceName}:`, error);
            return 0;
        }
    }
    /**
     * Check if a class should have automatic event registration
     */
    shouldAutoRegister(target) {
        return Reflect.hasMetadata(auto_register_events_decorator_1.AUTO_REGISTER_EVENTS_METADATA, target);
    }
    /**
     * Get all providers that should have automatic event registration
     */
    async getAutoRegisterProviders() {
        // This is a simplified approach - in a real implementation,
        // we would scan the module container for providers with the metadata
        return [];
    }
};
exports.AutoRegistrationService = AutoRegistrationService;
exports.AutoRegistrationService = AutoRegistrationService = AutoRegistrationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.ModuleRef,
        event_discovery_service_1.EventDiscoveryService])
], AutoRegistrationService);
