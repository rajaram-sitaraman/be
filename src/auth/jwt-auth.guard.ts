import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core/services/reflector.service';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from './setPublicAccess';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    console.log('Protected route, validating JWT'); 
    return super.canActivate(context);
  }
}