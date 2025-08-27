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
var AutoEventHandlerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoEventHandlerService = void 0;
const common_1 = require("@nestjs/common");
const event_system_service_1 = require("./event-system.service");
const auto_event_handler_decorator_1 = require("../decorators/auto-event-handler.decorator");
let AutoEventHandlerService = AutoEventHandlerService_1 = class AutoEventHandlerService {
    constructor(eventSystemService) {
        this.eventSystemService = eventSystemService;
        this.logger = new common_1.Logger(AutoEventHandlerService_1.name);
        this.consumer = null;
        AutoEventHandlerService_1.instance = this;
    }
    static getInstance() {
        return AutoEventHandlerService_1.instance;
    }
    async onModuleInit() {
        await this.initializeConsumer();
    }
    async initializeConsumer() {
        try {
            // Wait for the event system to be ready
            let attempts = 0;
            const maxAttempts = 10;
            while (attempts < maxAttempts) {
                try {
                    const eventSystem = this.eventSystemService.getEventSystem();
                    this.consumer = eventSystem.consumer;
                    this.logger.log('Auto event handler service initialized successfully');
                    return;
                }
                catch (error) {
                    attempts++;
                    if (attempts >= maxAttempts) {
                        throw error;
                    }
                    // Wait 100ms before retrying
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
        }
        catch (error) {
            this.logger.error('Failed to initialize auto event handler service', error);
        }
    }
    /**
     * Register event handlers from a service instance using AutoEventHandler decorators
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
            const metadata = (0, auto_event_handler_decorator_1.getAutoEventHandlerMetadata)(instance, methodName);
            if (metadata) {
                await this.registerHandler(instance, methodName, metadata);
                registeredCount++;
            }
        }
        if (registeredCount > 0) {
            this.logger.log(`Registered ${registeredCount} auto event handlers from ${instance.constructor.name}`);
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
            this.logger.log(`Registered auto event handler: ${instance.constructor.name}.${methodName} for ${eventType}`);
        }
        catch (error) {
            this.logger.error(`Failed to register auto handler for ${eventType}:`, error);
        }
    }
};
exports.AutoEventHandlerService = AutoEventHandlerService;
AutoEventHandlerService.instance = null;
exports.AutoEventHandlerService = AutoEventHandlerService = AutoEventHandlerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_system_service_1.EventSystemService])
], AutoEventHandlerService);
