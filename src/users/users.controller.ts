import { BadRequestException, Controller, Get, Post, Query, Req, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { Nothing } from 'src/auth/setPublicAccess';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('users')
export class UsersController {

  constructor(private userService: UsersService) { }

  @Nothing()
  @Post('register')
  async createUser(@Req() req) {
    const phone = req.body.phone;
    const deviceId = req.body.deviceId;
    if (!phone) {
      throw new BadRequestException('Phone number is required');
    }

    // Check if the user already exists
    const existingUser = await this.userService.findOne(phone);
    console.log('existingUser', existingUser);
    if (existingUser) {
      if (existingUser.deviceId !== deviceId) {
        throw new BadRequestException('DeviceID-mismatch');
      }

      // Update OTP
      existingUser.otp = Math.floor(100000 + Math.random() * 900000); // Generate a new OTP
      existingUser.forceLogin = true; // Set forceLogin to true for existing users
      await this.userService.updateOtp(existingUser.id, existingUser.otp);

      const { otp, ...result } = existingUser; // Exclude OTP from the result
      return result;
    }

    // Create the user if they don't exist
    return await this.userService.create(phone, deviceId);
  }


  @UseGuards(JwtAuthGuard)
  @Post('setprofile')
  async updateUser(@Request() req) {
    const nickname = req.body.nickname;
    const dob = req.body.dob;
    return await this.userService.update(req.user.id, nickname, dob);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return await this.userService.findOne(req.user.phone);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllUsers(@Query('q') q: string, @Request() req) {
    console.log('getAllUsers', q);

    if (!q || typeof q !== 'string') {
      throw new BadRequestException('Go away!');
    }

    const query: { name: string } = JSON.parse(q);

    if (!query || typeof query.name !== 'string' || !/^[a-zA-Z0-9\s]+$/.test(query.name)) {
      throw new BadRequestException('Please Go away!');
    }

    if (query.name.length < 3) {
      throw new BadRequestException('must be at least 3 characters long');
    }

    return await this.userService.findAll(query.name, req.user);
  }
}
