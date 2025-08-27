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
exports.AutoEventRegistrationMixin = AutoEventRegistrationMixin;
const common_1 = require("@nestjs/common");
/**
 * Mixin that automatically registers event handlers when a class is instantiated
 * This provides a clean, automatic way to register event handlers without manual calls
 */
function AutoEventRegistrationMixin(Base) {
    let AutoEventRegistrationClass = class AutoEventRegistrationClass extends Base {
        constructor(...args) {
            super(...args);
            // Try to get EventDiscoveryService from the arguments
            // This assumes it's injected as a dependency
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
            if (this.eventDiscoveryService) {
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
        }
    };
    AutoEventRegistrationClass = __decorate([
        (0, common_1.Injectable)(),
        __metadata("design:paramtypes", [Object])
    ], AutoEventRegistrationClass);
    return AutoEventRegistrationClass;
}
