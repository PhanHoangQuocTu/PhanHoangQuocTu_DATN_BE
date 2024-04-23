import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
// import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from 'src/entities/user.entity';
import { IStatusResponse } from 'src/utils/common';
import { AuthService } from '../auth/auth.service';
import { generate } from 'generate-password';
import { MailerService } from '@nestjs-modules/mailer';
import { Roles } from 'src/utils/common/user-roles.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private readonly authService: AuthService,
    private mailerService: MailerService,
  ) { }

  async findAll(): Promise<UserEntity[]> {
    return await this.usersRepository.find();
  }

  async findOne(id: number): Promise<UserEntity> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.findOne(id);

    const isEmailExists = async (email: string) => {
      return await this.authService.findUserByEmail(email);
    };

    const isPhoneNumberExists = async (phoneNumber: string) => {
      return await this.authService.findUserByPhoneNumber(phoneNumber);
    };

    const updateUser = async () => {
      Object.assign(user, updateUserDto);

      return await this.usersRepository.save(user);
    };

    if (user.phoneNumber === updateUserDto.phoneNumber && user.email !== updateUserDto.email) {
      if (await isEmailExists(updateUserDto.email)) {
        throw new BadRequestException('Email already exists');
      }

      return await updateUser();
    }

    if (user.email === updateUserDto.email && user.phoneNumber !== updateUserDto.phoneNumber) {
      if (await isPhoneNumberExists(updateUserDto.phoneNumber)) {
        throw new BadRequestException('Phone number already exists');
      }

      return await updateUser();
    }

    if (user.phoneNumber !== updateUserDto.phoneNumber && user.email !== updateUserDto.email) {
      if (await isEmailExists(updateUserDto.email)) {
        throw new BadRequestException('Email already exists');
      }

      if (await isPhoneNumberExists(updateUserDto.phoneNumber)) {
        throw new BadRequestException('Phone number already exists');
      }

      return await updateUser();
    }

    return user;
  }

  async remove(id: number): Promise<IStatusResponse> {
    const user = await this.findOne(id);

    await this.usersRepository.remove(user)

    return {
      status: 200,
      message: 'User deleted successfully',
    };
  }

  async generateVerifyCode(email: string): Promise<{ message: string }> {
    const verifyCode = generate({
      length: 6,
      numbers: true,
      lowercase: false,
      uppercase: false,
      strict: false,
      symbols: false,
      excludeSimilarCharacters: false,
    });

    const user = await this.usersRepository.findOne({ where: { email } });

    if (user) {
      await this.usersRepository.update(user.id, { verifyCode });
    } else {
      throw new NotFoundException('User not found');
    }

    await this.mailerService.sendMail({
      to: email,
      subject: 'Verify Account',
      template: './send-verify-code',
      context: {
        email: user.email,
        verifyCode: verifyCode,
      },
    });

    return { message: 'Verify code has been sent to your email' };
  }

  async activateUser(email: string, verifyCode: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: { email, verifyCode },
    });

    if (user) {
      await this.usersRepository.update(user.id, { isActice: true, verifyCode: null });
      return true;
    } else {
      throw new BadRequestException('Invalid verification code or user not found');
    }
  }

  async isAdmin(currentUser: UserEntity): Promise<{data: boolean}> {
    const isAdmin = currentUser.roles.includes(Roles.ADMIN);

    return {data: isAdmin}
  }
}
