"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const events_nestjs_1 = require("@logistically/events-nestjs");
const events_1 = require("@logistically/events");
const users_module_1 = require("./users/users.module");
const orders_module_1 = require("./orders/orders.module");
const health_controller_1 = require("./health/health.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            events_nestjs_1.EventsModule.forRoot({
                service: 'example-app',
                originPrefix: 'example',
                autoDiscovery: true,
                transports: new Map([
                    ['memory', new events_1.MemoryTransportPlugin().createTransport({})],
                    ['redis-streams', new events_1.RedisStreamsPlugin().createTransport({
                            host: process.env.REDIS_HOST || 'localhost',
                            port: parseInt(process.env.REDIS_PORT || '6379'),
                            password: process.env.REDIS_PASSWORD,
                            db: parseInt(process.env.REDIS_DB || '0'),
                        })]
                ]),
                routing: {
                    routes: [
                        {
                            pattern: 'user.*',
                            transport: 'redis-streams',
                            priority: 1
                        },
                        {
                            pattern: 'order.*',
                            transport: 'redis-streams',
                            priority: 1
                        },
                        {
                            pattern: '*',
                            transport: 'memory',
                            priority: 2
                        }
                    ],
                    validationMode: 'warn',
                    originPrefix: 'example',
                    topicMapping: {},
                    defaultTopicStrategy: 'namespace',
                    enablePatternRouting: true,
                    enableBatching: true,
                    enablePartitioning: false,
                    enableConsumerGroups: false
                },
                publisher: {
                    batching: {
                        enabled: true,
                        maxSize: 100,
                        strategy: 'time',
                        maxWaitMs: 1000,
                        maxConcurrentBatches: 5
                    }
                },
                global: true
            }),
            users_module_1.UsersModule,
            orders_module_1.OrdersModule
        ],
        controllers: [health_controller_1.HealthController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map