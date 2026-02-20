import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from './auth.service.js';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  signup = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const payload = await this.authService.signup(request.body as never);
    reply.code(201).send({ success: true, data: payload });
  };

  login = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const payload = await this.authService.login(request.body as never);
    reply.send({ success: true, data: payload });
  };

  refresh = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { refreshToken } = request.body as { refreshToken: string };
    const payload = await this.authService.refresh(refreshToken);
    reply.send({ success: true, data: payload });
  };

  me = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = request.user!;
    const payload = await this.authService.me(user.tenantId, user.id);
    reply.send({ success: true, data: payload });
  };

  logout = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = request.user!;
    const payload = await this.authService.logout(user.tenantId, user.id);
    reply.send({ success: true, data: payload });
  };
}
