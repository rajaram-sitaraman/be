import { Get, Inject, Injectable } from '@nestjs/common';
import { Nothing } from 'src/auth/setPublicAccess';
import { Repository } from 'typeorm';
import { User } from './user.entity';

// Define a type that excludes the 'otp' property from User
type UserWithoutOtp = Omit<User, 'otp'>;

// This should be a real class/interface representing a user entity

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: Repository<User>,
  ) { }

  async create(phone: string, deviceId: string): Promise<UserWithoutOtp> {
    const user = new User();
    user.phone = phone;
    user.deviceId = deviceId;

    // Set default values for other fields
    user.name = '';
    user.dob = '';
    user.otp = Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit OTP
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes
    user.resendOtps = 0; // Initialize resend OTP count to 0
    user.isValidated = false; // Initialize isVerified to false

    const createdUser = await this.userRepository.save(user);
    const { otp, ...result } = createdUser; // Exclude OTP from the result
    return result as UserWithoutOtp; // Return the created user without the OTP
  }

  async update(id: string, nickname: string, dob: string): Promise<any> {
    return this.userRepository.update(id, { name: nickname, dob });
  }

  updateOtp(id: any, otp: number) {
    return this.userRepository.update(id, { otp });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(phone: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { phone } });
    if (!user) {
      return null; // Return null if the user is not found
    }
    return user;
  }
}