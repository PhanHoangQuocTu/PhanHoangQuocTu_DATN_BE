import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
// import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from 'src/entities/user.entity';
import { IStatusResponse } from 'src/utils/common';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private readonly authService: AuthService

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
}
