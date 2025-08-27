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
var EnterpriseEventRegistrationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnterpriseEventRegistrationService = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const event_discovery_service_1 = require("./event-discovery.service");
const auto_register_events_decorator_1 = require("../decorators/auto-register-events.decorator");
let EnterpriseEventRegistrationService = EnterpriseEventRegistrationService_1 = class EnterpriseEventRegistrationService {
    constructor(discoveryService, metadataScanner, reflector, eventDiscoveryService) {
        this.discoveryService = discoveryService;
        this.metadataScanner = metadataScanner;
        this.reflector = reflector;
        this.eventDiscoveryService = eventDiscoveryService;
        this.logger = new common_1.Logger(EnterpriseEventRegistrationService_1.name);
        this.strategies = [];
        this.registeredServices = new Map();
        this.initializeStrategies();
    }
    async onModuleInit() {
        this.logger.log('Enterprise Event Registration Service initialized');
        await this.discoverAndRegisterAllServices();
    }
    initializeStrategies() {
        // Strategy 1: Decorator-based registration (highest priority)
        this.strategies.push({
            name: 'decorator',
            priority: 100,
            canHandle: (instance) => {
                const metadata = this.reflector.get(auto_register_events_decorator_1.AUTO_REGISTER_EVENTS_METADATA, instance.constructor);
                return metadata?.enabled === true && metadata?.strategy === 'decorator';
            },
            register: async (instance) => {
                return this.registerDecoratorBased(instance);
            }
        });
        // Strategy 2: Interface-based registration
        this.strategies.push({
            name: 'interface',
            priority: 80,
            canHandle: (instance) => {
                return this.implementsInterface(instance, 'AutoEventHandlerProvider');
            },
            register: async (instance) => {
                return this.registerInterfaceBased(instance);
            }
        });
        // Strategy 3: Base class registration (lowest priority)
        this.strategies.push({
            name: 'base-class',
            priority: 60,
            canHandle: (instance) => {
                return instance.constructor.name.includes('AutoEventHandlerBase') ||
                    instance.constructor.prototype.hasOwnProperty('registerEventHandlersWithRetry');
            },
            register: async (instance) => {
                return this.registerBaseClassBased(instance);
            }
        });
    }
    async discoverAndRegisterAllServices() {
        try {
            const providers = this.discoveryService.getProviders();
            const controllers = this.discoveryService.getControllers();
            const allInstances = [...providers, ...controllers]
                .map(wrapper => wrapper.instance)
                .filter(instance => instance && typeof instance === 'object');
            this.logger.log(`Discovered ${allInstances.length} potential services for event registration`);
            let totalRegistered = 0;
            for (const instance of allInstances) {
                const registered = await this.registerService(instance);
                totalRegistered += registered;
            }
            this.logger.log(`Enterprise registration completed. Registered ${totalRegistered} total handlers across ${this.registeredServices.size} services`);
        }
        catch (error) {
            this.logger.error('Failed to discover and register services:', error);
        }
    }
    async registerService(instance) {
        const serviceName = instance.constructor.name;
        // Find the best strategy for this service
        const strategy = this.strategies
            .filter(s => s.canHandle(instance))
            .sort((a, b) => b.priority - a.priority)[0];
        if (!strategy) {
            return 0; // No suitable strategy found
        }
        try {
            this.logger.debug(`Using ${strategy.name} strategy for ${serviceName}`);
            const registeredCount = await strategy.register(instance);
            if (registeredCount > 0) {
                this.logger.log(`Registered ${registeredCount} handlers for ${serviceName} using ${strategy.name} strategy`);
            }
            return registeredCount;
        }
        catch (error) {
            this.logger.error(`Failed to register ${serviceName} using ${strategy.name} strategy:`, error);
            return 0;
        }
    }
    async registerDecoratorBased(instance) {
        const metadata = this.reflector.get(auto_register_events_decorator_1.AUTO_REGISTER_EVENTS_METADATA, instance.constructor);
        if (!metadata?.enabled) {
            return 0;
        }
        // Use the existing EventDiscoveryService for decorator-based registration
        return this.eventDiscoveryService.registerEventHandlers(instance);
    }
    async registerInterfaceBased(provider) {
        try {
            // Validate handlers if validation method exists
            if (provider.validateEventHandlers && !provider.validateEventHandlers()) {
                this.logger.warn(`Event handler validation failed for ${provider.constructor.name}`);
                return 0;
            }
            const handlers = provider.getEventHandlers();
            const serviceInstance = provider.getServiceInstance();
            let registeredCount = 0;
            for (const handler of handlers) {
                try {
                    const method = serviceInstance[handler.methodName];
                    if (typeof method === 'function') {
                        await this.eventDiscoveryService.registerHandler(serviceInstance, handler.methodName, {
                            eventType: handler.eventType,
                            priority: handler.priority,
                            async: handler.async,
                            retry: handler.retry,
                            ...handler.options
                        });
                        registeredCount++;
                    }
                }
                catch (error) {
                    this.logger.error(`Failed to register handler ${handler.methodName} for ${handler.eventType}:`, error);
                }
            }
            // Call optional callback
            if (provider.onEventHandlersRegistered) {
                provider.onEventHandlersRegistered(handlers);
            }
            return registeredCount;
        }
        catch (error) {
            this.logger.error(`Failed to register interface-based handlers for ${provider.constructor.name}:`, error);
            return 0;
        }
    }
    async registerBaseClassBased(instance) {
        // For base class approach, let the base class handle registration
        // We just need to ensure the EventDiscoveryService is available
        return this.eventDiscoveryService.registerEventHandlers(instance);
    }
    implementsInterface(instance, interfaceName) {
        return instance && typeof instance.getEventHandlers === 'function' &&
            typeof instance.getServiceInstance === 'function';
    }
    // EventHandlerRegistrar implementation
    async registerEventHandlers(service) {
        return this.registerInterfaceBased(service);
    }
    async unregisterEventHandlers(service) {
        // Implementation for unregistering handlers
        const serviceName = service.constructor.name;
        const handlers = this.registeredServices.get(serviceName) || [];
        this.registeredServices.delete(serviceName);
        return handlers.length;
    }
    getRegisteredHandlers(service) {
        const serviceName = service.constructor.name;
        return this.registeredServices.get(serviceName) || [];
    }
    // Additional enterprise features
    getRegistrationStats() {
        return {
            totalServices: this.registeredServices.size,
            totalHandlers: Array.from(this.registeredServices.values()).reduce((sum, handlers) => sum + handlers.length, 0),
            servicesByStrategy: this.getServicesByStrategy()
        };
    }
    getServicesByStrategy() {
        const stats = {};
        for (const [serviceName, handlers] of this.registeredServices) {
            // Determine strategy used for this service
            // This is a simplified implementation
            stats[serviceName] = handlers.length;
        }
        return stats;
    }
};
exports.EnterpriseEventRegistrationService = EnterpriseEventRegistrationService;
exports.EnterpriseEventRegistrationService = EnterpriseEventRegistrationService = EnterpriseEventRegistrationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.DiscoveryService,
        core_1.MetadataScanner,
        core_1.Reflector,
        event_discovery_service_1.EventDiscoveryService])
], EnterpriseEventRegistrationService);
