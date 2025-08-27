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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const events_nestjs_1 = require("@logistically/events-nestjs");
let UsersService = class UsersService {
    constructor(eventPublisher) {
        this.eventPublisher = eventPublisher;
        this.users = [
            { id: 1, name: 'John Doe', email: 'john@example.com' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
        ];
    }
    async findAll() {
        await this.eventPublisher.publish('users.fetched', {
            count: this.users.length,
            timestamp: new Date().toISOString()
        });
        return this.users;
    }
    async findOne(id) {
        const user = this.users.find(user => user.id === id);
        if (user) {
            await this.eventPublisher.publish('user.fetched', {
                userId: id,
                timestamp: new Date().toISOString()
            });
        }
        return user || null;
    }
    async create(userData) {
        const newUser = {
            id: this.users.length + 1,
            ...userData,
        };
        this.users.push(newUser);
        await this.eventPublisher.publish('user.created', {
            user: newUser,
            timestamp: new Date().toISOString()
        });
        return newUser;
    }
    async update(id, userData) {
        const userIndex = this.users.findIndex(user => user.id === id);
        if (userIndex === -1) {
            return null;
        }
        this.users[userIndex] = { ...this.users[userIndex], ...userData };
        await this.eventPublisher.publish('user.updated', {
            userId: id,
            user: this.users[userIndex],
            timestamp: new Date().toISOString()
        });
        return this.users[userIndex];
    }
    async delete(id) {
        const userIndex = this.users.findIndex(user => user.id === id);
        if (userIndex === -1) {
            return false;
        }
        const deletedUser = this.users.splice(userIndex, 1)[0];
        await this.eventPublisher.publish('user.deleted', {
            userId: id,
            user: deletedUser,
            timestamp: new Date().toISOString()
        });
        return true;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [events_nestjs_1.EventPublisherService])
], UsersService);
//# sourceMappingURL=users.service.js.map