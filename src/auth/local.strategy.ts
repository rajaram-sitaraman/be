import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    console.log('LocalStrategy constructor called');
    super({
      usernameField: 'phone',
      passwordField: 'otp'
    }
    );
  }

  async validate(phone: string, otp: number): Promise<any> {
    const user = await this.authService.validateUser(phone, otp);
    console.log('Validating user:', phone, otp);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}