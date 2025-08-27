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
var SimpleEventHandlerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleEventHandlerService = void 0;
const common_1 = require("@nestjs/common");
const event_system_service_1 = require("./event-system.service");
const event_handler_decorator_1 = require("../decorators/event-handler.decorator");
let SimpleEventHandlerService = SimpleEventHandlerService_1 = class SimpleEventHandlerService {
    constructor(eventSystemService) {
        this.eventSystemService = eventSystemService;
        this.logger = new common_1.Logger(SimpleEventHandlerService_1.name);
        this.consumer = null;
    }
    async onModuleInit() {
        await this.initializeConsumer();
    }
    async initializeConsumer() {
        try {
            const eventSystem = this.eventSystemService.getEventSystem();
            this.consumer = eventSystem.consumer;
            this.logger.log('Simple event handler service initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize simple event handler service', error);
        }
    }
    /**
     * Register event handlers from a service instance using decorators
     */
    async registerEventHandlers(instance) {
        if (!this.consumer) {
            this.logger.warn('Consumer not initialized, skipping handler registration');
            return;
        }
        const prototype = Object.getPrototypeOf(instance);
        const methodNames = Object.getOwnPropertyNames(prototype).filter(name => name !== 'constructor' && typeof prototype[name] === 'function');
        let registeredCount = 0;
        for (const methodName of methodNames) {
            const metadata = Reflect.getMetadata(event_handler_decorator_1.EVENT_HANDLER_METADATA, instance, methodName);
            if (metadata) {
                await this.registerHandler(instance, methodName, metadata);
                registeredCount++;
            }
        }
        if (registeredCount > 0) {
            this.logger.log(`Registered ${registeredCount} event handlers from ${instance.constructor.name}`);
        }
    }
    async registerHandler(instance, methodName, metadata) {
        const eventType = metadata.eventType;
        const handler = instance[methodName].bind(instance);
        try {
            await this.consumer.subscribe(eventType, async (event) => {
                try {
                    await handler(event.body);
                }
                catch (error) {
                    this.logger.error(`Error handling event ${eventType} in ${instance.constructor.name}.${methodName}:`, error);
                }
            });
            this.logger.log(`Registered event handler: ${instance.constructor.name}.${methodName} for ${eventType}`);
        }
        catch (error) {
            this.logger.error(`Failed to register handler for ${eventType}:`, error);
        }
    }
};
exports.SimpleEventHandlerService = SimpleEventHandlerService;
exports.SimpleEventHandlerService = SimpleEventHandlerService = SimpleEventHandlerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_system_service_1.EventSystemService])
], SimpleEventHandlerService);
