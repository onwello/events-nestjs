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
exports.AutoEventHandlerMixin = AutoEventHandlerMixin;
exports.AutoEventHandlerMixinWithConfig = AutoEventHandlerMixinWithConfig;
const common_1 = require("@nestjs/common");
/**
 * Mixin that provides automatic event handler registration
 * This allows services to extend multiple classes while getting auto-registration
 */
function AutoEventHandlerMixin(Base) {
    let AutoEventHandlerMixinClass = class AutoEventHandlerMixinClass extends Base {
        constructor(...args) {
            super(...args);
            this.registeredHandlers = [];
            // Try to get EventDiscoveryService from the arguments
            for (const arg of args) {
                if (arg && typeof arg.registerEventHandlers === 'function') {
                    this.eventDiscoveryService = arg;
                    break;
                }
            }
        }
        async onModuleInit() {
            // Call the parent's onModuleInit if it exists
            if (super.onModuleInit && typeof super.onModuleInit === 'function') {
                await super.onModuleInit();
            }
            // Auto-register event handlers
            await this.registerEventHandlers();
        }
        async registerEventHandlers() {
            if (!this.eventDiscoveryService) {
                console.warn(`EventDiscoveryService not found for ${this.constructor.name}`);
                return;
            }
            try {
                const registeredCount = await this.eventDiscoveryService.registerEventHandlers(this);
                if (registeredCount > 0) {
                    console.log(`Auto-registered ${registeredCount} event handlers for ${this.constructor.name}`);
                }
            }
            catch (error) {
                console.error(`Failed to auto-register event handlers for ${this.constructor.name}:`, error);
            }
        }
        /**
         * Get registered handlers (for testing/debugging)
         */
        getRegisteredHandlers() {
            return this.registeredHandlers;
        }
        /**
         * Clear registered handlers (for testing)
         */
        clearRegisteredHandlers() {
            this.registeredHandlers = [];
        }
    };
    AutoEventHandlerMixinClass = __decorate([
        (0, common_1.Injectable)(),
        __metadata("design:paramtypes", [Object])
    ], AutoEventHandlerMixinClass);
    return AutoEventHandlerMixinClass;
}
/**
 * Advanced mixin with configuration options
 */
function AutoEventHandlerMixinWithConfig(Base, config = {}) {
    let AutoEventHandlerMixinWithConfigClass = class AutoEventHandlerMixinWithConfigClass extends Base {
        constructor(...args) {
            super(...args);
            this.config = {
                enabled: true,
                priority: 0,
                errorHandling: 'warn',
                ...config
            };
            // Try to get EventDiscoveryService from the arguments
            for (const arg of args) {
                if (arg && typeof arg.registerEventHandlers === 'function') {
                    this.eventDiscoveryService = arg;
                    break;
                }
            }
        }
        async onModuleInit() {
            // Call the parent's onModuleInit if it exists
            if (super.onModuleInit && typeof super.onModuleInit === 'function') {
                await super.onModuleInit();
            }
            // Auto-register event handlers if enabled
            if (this.config.enabled) {
                await this.registerEventHandlers();
            }
        }
        async registerEventHandlers() {
            if (!this.eventDiscoveryService) {
                const message = `EventDiscoveryService not found for ${this.constructor.name}`;
                if (this.config.errorHandling === 'throw') {
                    throw new Error(message);
                }
                else if (this.config.errorHandling === 'warn') {
                    console.warn(message);
                }
                return;
            }
            try {
                const registeredCount = await this.eventDiscoveryService.registerEventHandlers(this);
                if (registeredCount > 0) {
                    console.log(`Auto-registered ${registeredCount} event handlers for ${this.constructor.name}`);
                }
            }
            catch (error) {
                const message = `Failed to auto-register event handlers for ${this.constructor.name}: ${error}`;
                if (this.config.errorHandling === 'throw') {
                    throw new Error(message);
                }
                else if (this.config.errorHandling === 'warn') {
                    console.error(message);
                }
            }
        }
    };
    AutoEventHandlerMixinWithConfigClass = __decorate([
        (0, common_1.Injectable)(),
        __metadata("design:paramtypes", [Object])
    ], AutoEventHandlerMixinWithConfigClass);
    return AutoEventHandlerMixinWithConfigClass;
}
