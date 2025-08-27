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
var EventModuleInitializerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventModuleInitializerService = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const event_discovery_service_1 = require("./event-discovery.service");
let EventModuleInitializerService = EventModuleInitializerService_1 = class EventModuleInitializerService {
    constructor(moduleRef, eventDiscoveryService) {
        this.moduleRef = moduleRef;
        this.eventDiscoveryService = eventDiscoveryService;
        this.logger = new common_1.Logger(EventModuleInitializerService_1.name);
    }
    async onModuleInit() {
        await this.discoverAndRegisterAllHandlers();
    }
    async discoverAndRegisterAllHandlers() {
        try {
            // Get all providers from the current module
            const providers = this.moduleRef.get('MODULE_REF', { strict: false });
            if (!providers) {
                this.logger.warn('No module reference available for handler discovery');
                return;
            }
            // Get all instances from the module
            const instances = this.getModuleInstances();
            this.logger.log(`Found ${instances.length} instances to scan for event handlers`);
            // Discover and register handlers from each instance
            for (const instance of instances) {
                try {
                    await this.eventDiscoveryService.discoverAndRegisterHandlers(instance);
                }
                catch (error) {
                    this.logger.error(`Failed to discover handlers from ${instance.constructor.name}:`, error);
                }
            }
            const totalHandlers = this.eventDiscoveryService.getTotalDiscoveredHandlers();
            const eventTypes = this.eventDiscoveryService.getDiscoveredEventTypes();
            this.logger.log(`Event discovery completed: ${totalHandlers} handlers for ${eventTypes.length} event types`);
            this.logger.log(`Discovered event types: ${eventTypes.join(', ')}`);
        }
        catch (error) {
            this.logger.error('Failed to discover and register event handlers:', error);
        }
    }
    getModuleInstances() {
        const instances = [];
        try {
            // Try to get instances from the module context
            // This is a simplified approach - in a real implementation, you'd need to
            // access the module's provider instances more directly
            // For now, we'll rely on manual registration in the consuming services
            // This avoids the complexity of accessing module internals
            this.logger.debug('Using manual handler discovery approach');
        }
        catch (error) {
            this.logger.warn('Could not automatically discover module instances:', error);
        }
        return instances;
    }
    /**
     * Manually register event handlers from a specific service
     * This is called by services that want to register their handlers
     */
    async registerServiceHandlers(serviceInstance) {
        try {
            await this.eventDiscoveryService.discoverAndRegisterHandlers(serviceInstance);
        }
        catch (error) {
            this.logger.error(`Failed to register handlers from ${serviceInstance.constructor.name}:`, error);
        }
    }
};
exports.EventModuleInitializerService = EventModuleInitializerService;
exports.EventModuleInitializerService = EventModuleInitializerService = EventModuleInitializerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.ModuleRef,
        event_discovery_service_1.EventDiscoveryService])
], EventModuleInitializerService);
