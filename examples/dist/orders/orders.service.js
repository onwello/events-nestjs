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
let OrdersService = OrdersService_1 = class OrdersService {
    constructor(eventPublisher, eventDiscoveryService) {
        this.eventPublisher = eventPublisher;
        this.eventDiscoveryService = eventDiscoveryService;
        this.logger = new common_1.Logger(OrdersService_1.name);
        this.orders = [
            {
                id: 1,
                userId: 1,
                items: ['Laptop', 'Mouse'],
                total: 1299.99,
                status: 'pending',
                createdAt: new Date()
            }
        ];
    }
    async onModuleInit() {
        await this.eventDiscoveryService.registerEventHandlers(this);
    }
    async findAll() {
        this.logger.log('Fetching all orders');
        await this.eventPublisher.publish('orders.fetched', { count: this.orders.length });
        return this.orders;
    }
    async findOne(id) {
        this.logger.log(`Fetching order ${id}`);
        const order = this.orders.find(o => o.id === id);
        if (order) {
            await this.eventPublisher.publish('order.fetched', { orderId: id });
        }
        return order || null;
    }
    async create(userId, items, total, status = 'pending') {
        this.logger.log(`Creating order for user ${userId}`);
        const order = {
            id: this.orders.length + 1,
            userId,
            items,
            total,
            status,
            createdAt: new Date()
        };
        this.orders.push(order);
        await this.eventPublisher.publish('order.created', { order });
        return order;
    }
    async updateStatus(id, status) {
        this.logger.log(`Updating order ${id} status to ${status}`);
        const order = this.orders.find(o => o.id === id);
        if (order) {
            order.status = status;
            await this.eventPublisher.publish('order.status.updated', { orderId: id, status });
        }
        return order || null;
    }
    async handleUserCreated(event) {
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
], OrdersService.prototype, "handleUserCreated", null);
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