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
import { FindAllUserParamsDto } from './dto/find-all-user-params.dto';
import * as bcrypt from 'bcrypt';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private readonly authService: AuthService,
    private mailerService: MailerService,
  ) { }

  async findAll(query: FindAllUserParamsDto): Promise<{ users: UserEntity[]; meta: { limit: number; totalItems: number; totalPages: number; currentPage: number; } }> {
    const page = query.page > 0 ? query.page : 1;
    const limit = query.limit > 0 ? query.limit : 10;
    const offset = (page - 1) * limit;

    const queryBuilder = this.usersRepository.createQueryBuilder('user').where('user.deletedAt IS NULL');

    if (query.search) {
      const searchQuery = `%${query.search.toLowerCase()}%`;
      queryBuilder.where('(LOWER(user.firstName) LIKE :search OR LOWER(user.lastName) LIKE :search OR LOWER(user.email) LIKE :search)', { search: searchQuery });
    }

    if (query.isActive !== undefined) {
      queryBuilder.andWhere('user.isActice = :isActive', { isActive: query.isActive });
    }

    queryBuilder.skip(offset).take(limit);

    const [users, totalItems] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = page;

    return {
      users,
      meta: {
        limit,
        totalItems,
        totalPages,
        currentPage,
      },
    };
  }

  async findOne(id: number): Promise<UserEntity> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async changePassword(id: number, changePasswordDto: ChangePasswordDto): Promise<IStatusResponse> {
    const user = await this.findOne(id);
    
    const isMatch = await bcrypt.compare(changePasswordDto.currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Current password is incorrect');
    }
  
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.usersRepository.update(id, { password: hashedPassword });
  
    return {
      status: 200,
      message: 'Password changed successfully',
    };
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
      user.dateOfBirth = updateUserDto.dateOfBirth ?? user.dateOfBirth;
      user.gender = updateUserDto.gender ?? user.gender;
      user.address = updateUserDto.address ?? user.address;

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

    await updateUser();

    delete user.password;

    return user;
  }

  async remove(id: number): Promise<IStatusResponse> {
    const user = await this.findOne(id);

    user.deletedAt = new Date();
    await this.usersRepository.save(user);

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

  async isAdmin(currentUser: UserEntity): Promise<{ data: boolean }> {
    const isAdmin = currentUser.roles.includes(Roles.ADMIN);

    return { data: isAdmin }
  }
}
