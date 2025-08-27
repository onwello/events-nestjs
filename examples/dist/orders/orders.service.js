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
var OrdersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const events_nestjs_1 = require("@logistically/events-nestjs");
let OrdersService = OrdersService_1 = class OrdersService extends events_nestjs_1.AutoEventHandlerBase {
    constructor(eventPublisher, eventDiscoveryService) {
        super(eventDiscoveryService);
        this.eventPublisher = eventPublisher;
        this.logger = new common_1.Logger(OrdersService_1.name);
        this.orders = [
            {
                id: 1,
                userId: 1,
                items: ['Laptop', 'Mouse'],
                total: 1299.99,
                status: 'completed',
                createdAt: '2025-08-27T10:00:00.000Z'
            },
            {
                id: 2,
                userId: 2,
                items: ['Keyboard'],
                total: 89.99,
                status: 'pending',
                createdAt: '2025-08-27T11:00:00.000Z'
            }
        ];
    }
    findAll() {
        return this.orders;
    }
    findOne(id) {
        return this.orders.find(order => order.id === id);
    }
    async create(userId, items, total) {
        const order = {
            id: this.orders.length + 1,
            userId,
            items,
            total,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        this.orders.push(order);
        await this.eventPublisher.publish('order.created', {
            order,
            timestamp: new Date().toISOString()
        });
        this.logger.log(`Order created: ${JSON.stringify(order)}`);
        return order;
    }
    async updateStatus(id, status) {
        const order = this.orders.find(o => o.id === id);
        if (!order) {
            return undefined;
        }
        order.status = status;
        await this.eventPublisher.publish('order.updated', {
            orderId: id,
            order,
            timestamp: new Date().toISOString()
        });
        this.logger.log(`Order ${id} status updated to: ${status}`);
        return order;
    }
    async handleAllUserEvents(event) {
        this.logger.log(`All user events received: ${JSON.stringify(event)}`);
    }
    async handleUserUpdated(event) {
        this.logger.log(`User updated event received: ${JSON.stringify(event)}`);
    }
    async handleOrderCreated(event) {
        this.logger.log(`Order created event received: ${JSON.stringify(event)}`);
    }
};
exports.OrdersService = OrdersService;
__decorate([
    (0, events_nestjs_1.AutoEventHandler)({ eventType: 'user.*' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrdersService.prototype, "handleAllUserEvents", null);
__decorate([
    (0, events_nestjs_1.AutoEventHandler)({ eventType: 'user.updated' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrdersService.prototype, "handleUserUpdated", null);
__decorate([
    (0, events_nestjs_1.AutoEventHandler)({ eventType: 'order.created' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrdersService.prototype, "handleOrderCreated", null);
exports.OrdersService = OrdersService = OrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [events_nestjs_1.EventPublisherService,
        events_nestjs_1.EventDiscoveryService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map