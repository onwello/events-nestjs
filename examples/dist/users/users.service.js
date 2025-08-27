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
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const events_nestjs_1 = require("@logistically/events-nestjs");
let UsersService = UsersService_1 = class UsersService {
    constructor(eventPublisher) {
        this.eventPublisher = eventPublisher;
        this.logger = new common_1.Logger(UsersService_1.name);
        this.users = [
            {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                createdAt: '2025-08-27T10:00:00.000Z'
            },
            {
                id: 2,
                name: 'Jane Smith',
                email: 'jane@example.com',
                createdAt: '2025-08-27T11:00:00.000Z'
            }
        ];
    }
    findAll() {
        return this.users;
    }
    findOne(id) {
        return this.users.find(user => user.id === id);
    }
    async create(name, email) {
        const user = {
            id: this.users.length + 1,
            name,
            email,
            createdAt: new Date().toISOString()
        };
        this.users.push(user);
        await this.eventPublisher.publish('user.created', {
            user,
            timestamp: new Date().toISOString()
        });
        this.logger.log(`User created: ${JSON.stringify(user)}`);
        return user;
    }
    async update(id, name, email) {
        const user = this.users.find(u => u.id === id);
        if (!user) {
            return undefined;
        }
        user.name = name;
        user.email = email;
        await this.eventPublisher.publish('user.updated', {
            userId: id,
            user,
            timestamp: new Date().toISOString()
        });
        this.logger.log(`User ${id} updated: ${JSON.stringify(user)}`);
        return user;
    }
    async delete(id) {
        const userIndex = this.users.findIndex(u => u.id === id);
        if (userIndex === -1) {
            return false;
        }
        this.users.splice(userIndex, 1);
        await this.eventPublisher.publish('user.deleted', {
            userId: id,
            timestamp: new Date().toISOString()
        });
        this.logger.log(`User ${id} deleted`);
        return true;
    }
    getEventHandlers() {
        return [
            {
                eventType: 'order.*',
                methodName: 'handleAllOrderEvents',
                priority: 1,
                async: true,
                retry: {
                    maxAttempts: 3,
                    backoffMs: 1000
                }
            },
            {
                eventType: 'order.created',
                methodName: 'handleOrderCreated',
                priority: 2,
                async: true
            },
            {
                eventType: 'order.updated',
                methodName: 'handleOrderUpdated',
                priority: 2,
                async: true
            }
        ];
    }
    getServiceInstance() {
        return this;
    }
    validateEventHandlers() {
        const handlers = this.getEventHandlers();
        return handlers.every(handler => typeof this[handler.methodName] === 'function');
    }
    onEventHandlersRegistered(handlers) {
        this.logger.log(`Registered ${handlers.length} event handlers for UsersService`);
    }
    async handleAllOrderEvents(event) {
        this.logger.log(`All order events received: ${JSON.stringify(event)}`);
    }
    async handleOrderCreated(event) {
        this.logger.log(`Order created event received: ${JSON.stringify(event)}`);
    }
    async handleOrderUpdated(event) {
        this.logger.log(`Order updated event received: ${JSON.stringify(event)}`);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [events_nestjs_1.EventPublisherService])
], UsersService);
//# sourceMappingURL=users.service.js.map