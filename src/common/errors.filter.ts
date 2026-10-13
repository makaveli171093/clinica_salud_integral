import { type ArgumentsHost, Catch, HttpException, Logger, type ExceptionFilter } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
@Catch()
export class ErrorsFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpErrors');
  catch(error: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();
    const req = ctx.getRequest<FastifyRequest>();
    const status = error instanceof HttpException ? error.getStatus() : 500;
    const response = error instanceof HttpException ? error.getResponse() : null;
    const message = response && typeof response === 'object' && 'message' in response ? response.message :
      status >= 500 ? 'Error interno del servidor' : typeof response === 'string' ? response : 'Solicitud inválida';
    if (status >= 500) this.logger.error(JSON.stringify({ requestId: req.id, status, errorType: error instanceof Error ? error.name : 'Unknown' }));
    reply.status(status).send({ statusCode: status, message, requestId: req.id });
  }
}
