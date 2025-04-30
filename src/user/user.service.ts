import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { isEmail } from 'class-validator';
import { HelperService } from 'src/common/helper/helper.service';
import {
  ChangePassWordDto,
  DeleteUserDto,
  SignInDto,
  SignUpDto,
  UpdateDtoQuery,
  UpdateProfileDto,
  UpdateUserDto,
  UserJwtDto,
} from 'src/dto/user.dto';
import { User } from 'src/entity/user.entity';
import { UserInformation } from 'src/entity/user-information.entity';
import {
  checkBirthDate,
  checkPassword,
  checkPhoneNumber,
} from 'src/util/funtion-util';
import { Repository } from 'typeorm';
import * as bcryptjs from 'bcryptjs';
import * as moment from 'moment';
import { PaginationResponseDto, SearchDto } from 'src/common/common.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserInformation)
    private readonly userInformationRepository: Repository<UserInformation>,
    private readonly jwtService: JwtService,
    private readonly helperService: HelperService,
  ) {}

  //Client API
  public async SignUp(user: SignUpDto) {
    try {
      if (!isEmail(user.Email)) {
        throw new BadRequestException('EMAIL_INVALID');
      }
      console.log(user);
      const existingUser = await this.userRepository.findOne({
        where: { email: user.Email },
      });
      if (existingUser) {
        throw new BadRequestException('EMAIL_ALREADY_EXISTS');
      }
      if (!user.Password) {
        throw new BadRequestException('PASSWORD_REQUIRED');
      }
      // if (checkPassword(user.Password)) {
      //   throw new BadRequestException('PASSWORD_INVALID');
      // }
      if (!user.PhoneNumber) {
        throw new BadRequestException('PHONE_NUMBER_REQUIRED');
      }
      const newUser = new User();
      newUser.email = user.Email;
      newUser.userName = '';
      const salt = await bcryptjs.genSalt();
      newUser.password = await bcryptjs.hash(user.Password, salt);
      newUser.phoneNumber = user.PhoneNumber;
      return await this.userRepository.save(newUser);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  public async LogIn(user: SignInDto) {
    try {
      if (!user.PhoneNumber) {
        throw new BadRequestException('PHONE NUMBER IS REQUIRED');
      }
      const existingUser = await this.userRepository.findOne({
        where: { phoneNumber: user.PhoneNumber },
      });
      if (!existingUser) {
        throw new BadRequestException('PHONE NUMBER IS INCORRECT');
      }

      if (!user.Password) {
        throw new BadRequestException('PASSWORD_REQUIRED');
      }
      if (checkPassword(user.Password)) {
        throw new BadRequestException('PASSWORD_INVALID');
      }
      const isMatch = await bcryptjs.compare(
        user.Password,
        existingUser.password,
      );
      if (!isMatch) {
        throw new BadRequestException('PASSWORD_IS_INCORRECT');
      }
      return {
        ...(await this.encode(existingUser)),
        isAdmin: existingUser.isAdmin,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  public async LogOut(userReq: UserJwtDto) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: Number(userReq.id) },
      });
      if (user) {
        return { isLogin: false };
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  public async ResetPassword(dto: ChangePassWordDto) {
    try {
      if (!isEmail(dto.Email)) {
        throw new BadRequestException('EMAIL_INVALID');
      }
      const user = await this.userRepository.findOne({
        where: { email: dto.Email },
      });
      if (!user) {
        throw new BadRequestException('EMAIL_NOT_FOUND');
      }
      if (!dto.OldPassWord) {
        throw new BadRequestException('OLD_PASSWORD_REQUIRED');
      }
      if (checkPassword(dto.OldPassWord)) {
        throw new BadRequestException('OLD_PASSWORD_INVALID');
      }
      const isMatch = await bcryptjs.compare(dto.OldPassWord, user.password);
      if (!isMatch) {
        throw new BadRequestException('OLD_PASSWORD_INCORRECT');
      }
      if (!dto.NewPassWord) {
        throw new BadRequestException('PASSWORD_REQUIRED');
      }
      if (checkPassword(dto.NewPassWord)) {
        throw new BadRequestException('PASSWORD_INVALID');
      }
      const salt = await bcryptjs.genSalt();
      user.password = await bcryptjs.hash(dto.NewPassWord, salt);
      return await this.userRepository.update(user.id, {
        password: user.password,
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  public async UpdateProfile(dto: UpdateProfileDto, userReq: UserJwtDto) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: Number(userReq.id) },
        relations: ['userInformation'],
      });

      if (!user) {
        throw new BadRequestException('USER_NOT_FOUND');
      }

      if (dto.PhoneNumber) {
        if (checkPhoneNumber(dto.PhoneNumber)) {
          throw new BadRequestException('PHONE_NUMBER_INVALID');
        }
        user.phoneNumber = dto.PhoneNumber;
      }

      if (dto.FullName) {
        user.userName = dto.FullName;
      }

      let userInformation = user.userInformation;

      if (!userInformation) {
        userInformation = new UserInformation();
        user.informationId = null;
      }

      if (dto.Address) {
        userInformation.address = dto.Address;
      }

      if (dto.Gender) {
        userInformation.gender = dto.Gender;
      }

      if (dto.BirthDate) {
        if (checkBirthDate(dto.BirthDate)) {
          throw new BadRequestException('BIRTH_DATE_INVALID');
        }
        const formattedDate = moment(
          dto.BirthDate,
          ['DD-MM-YYYY', 'DD/MM/YYYY', 'YYYY/MM/DD'],
          true,
        ).format('YYYY-MM-DD');
        userInformation.dateOfBirth = new Date(formattedDate);
      }

      const savedUserInformation =
        await this.userInformationRepository.save(userInformation);

      user.informationId = savedUserInformation.informationId;

      await this.userRepository.save(user);

      return {
        ...user,
        userInformation: savedUserInformation,
      };
    } catch (error) {
      throw new BadRequestException('ERROR_UPDATING_PROFILE');
    }
  }

  public async updateUserById(
    dto: UpdateDtoQuery,
    updateDto: UpdateUserDto,
    userReq: UserJwtDto,
  ) {
    try {
      if (!dto.Id) {
        throw new BadRequestException('ID_REQUIRED');
      }
      await this.helperService.validateAdmin(userReq);

      const user = await this.userRepository.findOne({
        where: { id: dto.Id },
        relations: ['userInformation'],
      });

      if (!user) {
        throw new BadRequestException('USER_NOT_FOUND');
      }

      const userUpdateData: Partial<User> = {};

      if (updateDto.Username !== undefined) {
        userUpdateData.userName = updateDto.Username;
      }

      if (updateDto.PhoneNumber !== undefined) {
        userUpdateData.phoneNumber = updateDto.PhoneNumber;
      }

      if (updateDto.Email !== undefined) {
        userUpdateData.email = updateDto.Email;
      }

      let userInformation = user.userInformation;
      let userInformationUpdateData: Partial<UserInformation> = {};

      if (
        updateDto.FullName !== undefined ||
        updateDto.Address !== undefined ||
        updateDto.Gender !== undefined ||
        updateDto.BirthDate !== undefined
      ) {
        if (!userInformation) {
          userInformation = new UserInformation();
          userInformationUpdateData = {
            fullName: updateDto.FullName || '',
            address: updateDto.Address || '',
            gender: updateDto.Gender,
            dateOfBirth: updateDto.BirthDate
              ? new Date(updateDto.BirthDate)
              : null,
          };
        } else {
          if (updateDto.FullName !== undefined) {
            userInformationUpdateData.fullName = updateDto.FullName;
          }

          if (updateDto.Address !== undefined) {
            userInformationUpdateData.address = updateDto.Address;
          }

          if (updateDto.Gender !== undefined) {
            userInformationUpdateData.gender = updateDto.Gender;
          }

          if (updateDto.BirthDate !== undefined) {
            userInformationUpdateData.dateOfBirth = new Date(
              updateDto.BirthDate,
            );
          }
        }

        const savedUserInformation = await this.userInformationRepository.save({
          ...userInformation,
          ...userInformationUpdateData,
        });

        userUpdateData.informationId = savedUserInformation.informationId;
      }

      await this.userRepository.update(dto.Id, userUpdateData);

      const updatedUser = await this.userRepository.findOne({
        where: { id: dto.Id },
        relations: ['userInformation'],
      });

      return updatedUser;
    } catch (error) {
      throw new BadRequestException('ERROR_UPDATING_USER_BY_ID');
    }
  }

  public async deleteUserById(dto: DeleteUserDto, userReq: UserJwtDto) {
    try {
      await this.helperService.validateAdmin(userReq);
      const user = await this.userRepository.findOne({
        where: { id: dto.Id },
      });
      if (user.isAdmin) {
        throw new BadRequestException('ADMIN_CANNOT_BE_DELETED');
      }
      return await this.userRepository.delete({ id: dto.Id });
    } catch (error) {
      throw new BadRequestException('ERROR_DELETING_USER_BY_ID');
    }
  }

  public async deleteUserByIds(ids: number[], userReq: UserJwtDto) {
    try {
      await this.helperService.validateAdmin(userReq);
      for (let i = 0; i < ids.length; i++) {
        await this.userRepository.delete({ id: ids[i] });
      }
      return { message: 'USERS_DELETED_SUCCESSFULLY' };
    } catch (error) {
      throw new BadRequestException('ERROR_DELETING_USER_BY_ID');
    }
  }

  //Admin API

  public async getAll(dto: PaginationResponseDto, userReq: UserJwtDto) {
    try {
      await this.helperService.validateAdmin(userReq);
      const { page, size } = dto;
      const query = this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.userInformation', 'userInformation')
        .select([
          'user.id',
          'user.userName',
          'user.phoneNumber',
          'user.email',
          'user.isAdmin',
          'user.userRank',
          'user.isActive',
          'user.createdAt',
          'user.updatedAt',
          'userInformation.informationId',
          'userInformation.fullName',
          'userInformation.address',
          'userInformation.gender',
          'userInformation.dateOfBirth',
          'userInformation.avatar',
          'userInformation.createdAt',
          'userInformation.updatedAt',
        ])
        .skip((page - 1) * size)
        .take(size);

      const [data, total] = await query.getManyAndCount();
      return { data, total, page, size };
    } catch (error) {
      throw new BadRequestException('ERROR_FETCHING_USERS');
    }
  }

  public async getUserByID(id: UpdateDtoQuery, userReq: UserJwtDto) {
    try {
      if (!id) {
        throw new BadRequestException('ID_REQUIRED');
      }
      await this.helperService.validateAdmin(userReq);
      const user = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.userInformation', 'userInformation')
        .select([
          'user.id',
          'user.userName',
          'user.phoneNumber',
          'user.email',
          'user.isAdmin',
          'user.userRank',
          'user.isActive',
          'user.createdAt',
          'user.updatedAt',
          'userInformation.informationId',
          'userInformation.fullName',
          'userInformation.address',
          'userInformation.gender',
          'userInformation.dateOfBirth',
          'userInformation.avatar',
          'userInformation.createdAt',
          'userInformation.updatedAt',
        ])
        .where('user.id = :id', { id: id.Id })
        .getOne();
      return user;
    } catch (error) {
      throw new BadRequestException('ERROR_FETCHING_USER_BY_ID');
    }
  }

  public async getUserByKeyword(
    dto: SearchDto,
    paginationDto: PaginationResponseDto,
    userReq: UserJwtDto,
  ) {
    try {
      if (!dto.search) {
        throw new BadRequestException('NO_KEYWORD_FOUND');
      }
      const { search } = dto;
      const { page, size } = paginationDto;
      await this.helperService.validateAdmin(userReq);

      const query = this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.userInformation', 'userInformation')
        .select([
          'user.id',
          'user.userName',
          'user.phoneNumber',
          'user.email',
          'user.isAdmin',
          'user.userRank',
          'user.isActive',
          'user.createdAt',
          'user.updatedAt',
          'userInformation.informationId',
          'userInformation.fullName',
          'userInformation.address',
          'userInformation.gender',
          'userInformation.dateOfBirth',
          'userInformation.avatar',
          'userInformation.createdAt',
          'userInformation.updatedAt',
        ])
        .skip((page - 1) * size)
        .take(size)
        .where('user.userName LIKE :search', { search: `%${search}%` })
        .orWhere('user.email LIKE :search', { search: `%${search}%` })
        .orWhere('user.phoneNumber LIKE :search', { search: `%${search}%` })
        .orWhere('userInformation.fullName LIKE :search', {
          search: `%${search}%`,
        });

      const [data, total] = await query.getManyAndCount();
      return { data, total, page, size };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  private async encode(user: User) {
    try {
      const token = this.generateToken(user);
      const userInfor = await this.userRepository.findOne({
        where: { id: user.id },
      });
      return {
        token,
        ...userInfor,
      };
    } catch (error) {
      throw new BadRequestException('ERROR_ENCODING_USER');
    }
  }

  public generateToken(user: User, expiry?: string | number) {
    try {
      const payload: UserJwtDto = {
        userName: user.userName,
        id: user.id.toString(),
        isAdmin: user.isAdmin,
      };
      return this.jwtService.sign(payload, {
        expiresIn: expiry ? expiry : process.env.JWT_EXPIRES_IN,
      });
    } catch (error) {
      throw new BadRequestException('ERROR_GENERATING_TOKEN');
    }
  }

  public decode(token: string) {
    try {
      const jwt = token.replace('Bearer ', '');
      return this.jwtService.decode(jwt, { json: true }) as UserJwtDto;
    } catch (e) {
      return null;
    }
  }
}
