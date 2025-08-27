"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTO_REGISTER_EVENTS_METADATA = void 0;
exports.AutoRegisterEvents = AutoRegisterEvents;
const common_1 = require("@nestjs/common");
exports.AUTO_REGISTER_EVENTS_METADATA = 'auto-register-events';
/**
 * Decorator that marks a class for automatic event handler registration
 * This will automatically register all @AutoEventHandler methods when the class is instantiated
 */
function AutoRegisterEvents() {
    return (0, common_1.SetMetadata)(exports.AUTO_REGISTER_EVENTS_METADATA, true);
}
