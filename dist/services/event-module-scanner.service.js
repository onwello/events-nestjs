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
var EventModuleScanner_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventModuleScanner = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const event_discovery_service_1 = require("./event-discovery.service");
const auto_event_handler_decorator_1 = require("../decorators/auto-event-handler.decorator");
let EventModuleScanner = EventModuleScanner_1 = class EventModuleScanner {
    constructor(discoveryService, metadataScanner, reflector, eventDiscoveryService) {
        this.discoveryService = discoveryService;
        this.metadataScanner = metadataScanner;
        this.reflector = reflector;
        this.eventDiscoveryService = eventDiscoveryService;
        this.logger = new common_1.Logger(EventModuleScanner_1.name);
        this.discoveredHandlers = [];
    }
    async onModuleInit() {
        this.logger.log('Starting automatic event handler discovery...');
        await this.scanModules();
        await this.registerDiscoveredHandlers();
        this.logger.log(`Automatic discovery completed. Found ${this.discoveredHandlers.length} event handlers.`);
    }
    /**
     * Scan all modules for event handlers decorated with @AutoEventHandler
     */
    async scanModules() {
        try {
            // Get all providers from the application
            const providers = this.discoveryService.getProviders();
            const controllers = this.discoveryService.getControllers();
            // Scan providers for event handlers
            for (const provider of providers) {
                if (provider.instance) {
                    await this.scanInstance(provider.instance, 'provider');
                }
            }
            // Scan controllers for event handlers
            for (const controller of controllers) {
                if (controller.instance) {
                    await this.scanInstance(controller.instance, 'controller');
                }
            }
            this.logger.debug(`Scanned ${providers.length} providers and ${controllers.length} controllers`);
        }
        catch (error) {
            this.logger.error('Error during module scanning:', error);
            throw error;
        }
    }
    /**
     * Scan a single instance for event handler methods
     */
    async scanInstance(instance, type) {
        const instanceName = instance.constructor?.name || 'Unknown';
        try {
            // Get all method names from the instance
            const methodNames = this.metadataScanner.getAllMethodNames(instance);
            for (const methodName of methodNames) {
                const method = instance[methodName];
                if (typeof method === 'function') {
                    // Check if the method has @AutoEventHandler metadata
                    const metadata = this.reflector.get(auto_event_handler_decorator_1.AUTO_EVENT_HANDLER_METADATA, method);
                    if (metadata && metadata.eventType) {
                        this.discoveredHandlers.push({
                            instance,
                            methodName,
                            eventType: metadata.eventType,
                            options: metadata.options || {}
                        });
                        this.logger.debug(`Found event handler: ${instanceName}.${methodName} -> ${metadata.eventType}`);
                    }
                }
            }
        }
        catch (error) {
            this.logger.warn(`Error scanning instance ${instanceName}:`, error);
        }
    }
    /**
     * Register all discovered event handlers
     */
    async registerDiscoveredHandlers() {
        try {
            for (const handler of this.discoveredHandlers) {
                await this.eventDiscoveryService.registerHandler(handler.instance, handler.methodName, {
                    eventType: handler.eventType,
                    ...handler.options
                });
            }
            this.logger.log(`Successfully registered ${this.discoveredHandlers.length} event handlers`);
        }
        catch (error) {
            this.logger.error('Error registering discovered handlers:', error);
            throw error;
        }
    }
    /**
     * Get all discovered event handlers (for debugging/testing)
     */
    getDiscoveredHandlers() {
        return [...this.discoveredHandlers];
    }
    /**
     * Get handlers by event type
     */
    getHandlersByEventType(eventType) {
        return this.discoveredHandlers.filter(handler => {
            // Support pattern matching (e.g., 'user.*' matches 'user.created')
            if (handler.eventType.includes('*')) {
                const pattern = handler.eventType.replace(/\*/g, '.*');
                const regex = new RegExp(`^${pattern}$`);
                return regex.test(eventType);
            }
            return handler.eventType === eventType;
        });
    }
    /**
     * Get handlers by instance
     */
    getHandlersByInstance(instance) {
        return this.discoveredHandlers.filter(handler => handler.instance === instance);
    }
    /**
     * Clear discovered handlers (for testing)
     */
    clearDiscoveredHandlers() {
        this.discoveredHandlers = [];
    }
};
exports.EventModuleScanner = EventModuleScanner;
exports.EventModuleScanner = EventModuleScanner = EventModuleScanner_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.DiscoveryService,
        core_1.MetadataScanner,
        core_1.Reflector,
        event_discovery_service_1.EventDiscoveryService])
], EventModuleScanner);
