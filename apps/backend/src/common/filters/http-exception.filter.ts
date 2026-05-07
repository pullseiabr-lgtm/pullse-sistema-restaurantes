import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';
    let code: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as { message?: string }).message ?? res;
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      ({ status, message, code } = mapPrismaError(exception));
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(exception.message, exception.stack);
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      ...(code ? { code } : {}),
      message,
    });
  }
}

function mapPrismaError(err: Prisma.PrismaClientKnownRequestError): {
  status: number;
  message: string;
  code: string;
} {
  switch (err.code) {
    case 'P2002':
      return { status: HttpStatus.CONFLICT, message: 'Registro já existe (constraint única).', code: err.code };
    case 'P2025':
      return { status: HttpStatus.NOT_FOUND, message: 'Registro não encontrado.', code: err.code };
    case 'P2003':
      return { status: HttpStatus.BAD_REQUEST, message: 'Referência inválida (FK).', code: err.code };
    default:
      return { status: HttpStatus.BAD_REQUEST, message: err.message, code: err.code };
  }
}
