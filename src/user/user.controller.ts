import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() body: { name: string, email: string, password: string, securityQuestion: string, securityAnswer: string }) {
    try {
      const result = await this.userService.register(body);
      return result;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @Post('login')
  async login(@Body() body: { email: string, password: string }) {
    try {
      const result = await this.userService.login(body);
      return result;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @Post('security-question')
  async getSecurityQuestion(@Body() body: { email: string }) {
    try {
      const result = await this.userService.getSecurityQuestion(body.email);
      return { success: true, ...result };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { email: string, securityAnswer: string, newPassword: string }) {
    try {
      const result = await this.userService.resetPassword(body);
      return result;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
} 