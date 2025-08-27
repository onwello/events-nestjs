"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTO_REGISTER_EVENTS_METADATA = void 0;
exports.AutoRegisterEvents = AutoRegisterEvents;
exports.AutoEvents = AutoEvents;
const common_1 = require("@nestjs/common");
exports.AUTO_REGISTER_EVENTS_METADATA = 'auto-register-events';
/**
 * Decorator that marks a class for automatic event handler registration
 * This provides enterprise-grade automatic discovery without inheritance constraints
 */
function AutoRegisterEvents(options = {}) {
    const defaultOptions = {
        enabled: true,
        strategy: 'decorator',
        priority: 0,
        serviceName: '',
        timing: 'lazy',
        errorHandling: 'warn'
    };
    const finalOptions = { ...defaultOptions, ...options };
    return (0, common_1.SetMetadata)(exports.AUTO_REGISTER_EVENTS_METADATA, finalOptions);
}
/**
 * Shorthand decorator for simple cases
 */
function AutoEvents() {
    return AutoRegisterEvents();
}
