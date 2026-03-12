import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './shared/filters/http-exception.filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist:            true,
            forbidNonWhitelisted: true,
            transform:            true,
        }),
    );

    app.useGlobalFilters(new GlobalExceptionFilter());

    app.enableCors();

    // Configuração do Swagger
    const config = new DocumentBuilder()
        .setTitle('Charger API')
        .setDescription('API de gestão de pagamentos do sistema Charger')
        .setVersion('1.0')
        .addTag('clients', 'Operações de gerenciamento de clientes')
        .addTag('payments', 'Operações de pagamentos e tentativas')
        .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, documentFactory);

    await app.listen(3000);
    console.log('Charger backend rodando em http://localhost:3000');
    console.log('Documentação Swagger disponível em http://localhost:3000/api/docs');
}
bootstrap().then(r => {});