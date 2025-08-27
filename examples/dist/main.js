"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    await app.listen(3009);
    console.log('🚀 Application is running on: http://localhost:3009');
    console.log('📊 Health check: http://localhost:3009/health');
    console.log('👤 User service: http://localhost:3009/users');
    console.log('📦 Order service: http://localhost:3009/orders');
}
bootstrap();
//# sourceMappingURL=main.js.map