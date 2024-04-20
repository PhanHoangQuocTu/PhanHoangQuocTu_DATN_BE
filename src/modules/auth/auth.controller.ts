import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { UserEntity } from 'src/entities/user.entity';
import { ApiTags } from '@nestjs/swagger';
import { CreateAdminAccountDto } from './dto/create-admin-account';
import { RefreshTokenDto } from './dto/refresh-token';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('sign-up')
  async signUp(@Body() signUpDto: SignUpDto): Promise<{ user: UserEntity }> {
    return { user: await this.authService.signUp(signUpDto) };
  }

  @Post('sign-in')
  async signIn(@Body() signInDto: SignInDto): Promise<{ user: UserEntity, token: { accessToken: string, refreshToken: string } }> {
    const user = await this.authService.signIn(signInDto)

    const accessToken = await this.authService.accessToken(user)

    const refreshToken = await this.authService.refreshToken(user)


    return { token: { accessToken, refreshToken }, user }
  }

  @Post('create-admin-account')
  async createAdminAccount(@Body() createAdminAccountDto: CreateAdminAccountDto): Promise<{ user: UserEntity }> {
    return { user: await this.authService.createAdminAccount(createAdminAccountDto) }
  }

  @Post('refresh-token')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<{ accessToken: string }> {
    return { accessToken: await this.authService.refreshAccessToken(refreshTokenDto) };
  }
}
