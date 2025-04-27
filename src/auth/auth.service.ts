import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) { }

  async validateUser(phone: string, otp: number): Promise<any> {
    const user = await this.usersService.findOne(phone);
    if (user && user.otp === parseInt(otp.toString())) {
      const { otp, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { phone: user.phone, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload, { secret: jwtConstants.secret }),
    };
  }
}