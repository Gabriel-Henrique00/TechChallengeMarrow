import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch() // O decorador vazio captura TODAS as exceções, e não apenas uma específica
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const isHttpException = exception instanceof HttpException;

        const status = isHttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        const exceptionResponse = isHttpException
            ? exception.getResponse()
            : null;

        let message = 'Erro interno no servidor. Tente novamente mais tarde.';
        if (isHttpException) {
            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                message = (exceptionResponse as any).message || exceptionResponse;
            }
        }

        // se o erro NÃO for controlado o log aparece no terminal do servidor, mas NÃO pro o cliente.
        this.logger.error(
            `[FATAL ERROR] ${request.method} ${request.url}`,
            exception instanceof Error
                ? exception.stack
                : JSON.stringify(exception, null, 2),
        );

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: message,
        });
    }
}