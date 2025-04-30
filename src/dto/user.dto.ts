import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
} from 'class-validator';
import { PaginationResponseDto } from 'src/common/common.dto';

export class UserJwtDto {
  id: string;
  userName: string;
  isAdmin: boolean;
  fcmToken?: string;
}

export class SignUpDto {
  @ApiProperty({ type: String, description: 'Email', required: true })
  @IsOptional()
  @IsEmail()
  Email: string;

  @ApiProperty({ type: String, description: 'PassWord', required: true })
  @IsString()
  Password: string;

  @ApiProperty({ type: String, description: 'PhoneNumber', required: true })
  @IsOptional()
  @IsPhoneNumber()
  PhoneNumber: string;
}

export class SignInDto {
  @ApiProperty({ type: String, description: 'PhoneNumber', required: true })
  @IsOptional()
  @IsPhoneNumber()
  PhoneNumber: string;

  @ApiProperty({ type: String, description: 'PassWord', required: true })
  @IsString()
  Password: string;
}

export class ChangePassWordDto {
  @ApiProperty({ type: String, description: 'Email', required: true })
  @IsEmail()
  Email: string;

  @ApiProperty({ type: String, description: 'OldPassWord', required: true })
  @IsString()
  OldPassWord: string;

  @ApiProperty({ type: String, description: 'NewPassWord', required: true })
  @IsString()
  NewPassWord: string;
}
export class GetUserByEmailDto extends PaginationResponseDto {
  @ApiProperty({ type: String, description: 'Email', required: true })
  @IsEmail()
  Email: string;
}

export class CreateUserDto {
  @ApiProperty({ type: String, description: 'Username', required: true })
  @IsString()
  @Length(3, 50)
  Username: string;

  @ApiProperty({ type: String, description: 'FullName', required: false })
  @IsOptional()
  @IsString()
  @Length(3, 100)
  FullName?: string;

  @ApiProperty({ type: String, description: 'Email', required: false })
  @IsOptional()
  @IsEmail()
  Email?: string;

  @ApiProperty({ type: String, description: 'PhoneNumber', required: false })
  @IsOptional()
  @IsString()
  @Length(10, 15)
  PhoneNumber?: string;

  @ApiProperty({ type: String, description: 'Address', required: false })
  @IsOptional()
  @IsString()
  @Length(5, 255)
  Address?: string;

  @ApiProperty({ type: String, description: 'Role', required: false })
  @IsOptional()
  @IsEnum(['Admin', 'Customer'])
  Role?: 'Admin' | 'Customer';

  @ApiProperty({ type: String, description: 'Gender', required: false })
  @IsOptional()
  @IsEnum(['Male', 'Female', 'Other'])
  Gender?: 'Male' | 'Female' | 'Other';

  @ApiProperty({ type: String, description: 'BirthDate', required: false })
  @IsOptional()
  @IsDateString()
  BirthDate?: string;
}
export class UpdateUserDto extends CreateUserDto {}
export class UpdateDtoQuery {
  @ApiProperty({ type: Number, description: 'ID', required: true })
  @IsNumber()
  Id: number;
}

export class UpdateProfileDto {
  @ApiProperty({ type: String, description: 'FullName', required: false })
  @IsOptional()
  @IsString()
  @Length(3, 100)
  FullName?: string;

  @ApiProperty({ type: String, description: 'PhoneNumber', required: false })
  @IsOptional()
  @IsString()
  @Length(10, 15)
  PhoneNumber?: string;

  @ApiProperty({ type: String, description: 'Address', required: false })
  @IsOptional()
  @IsString()
  @Length(5, 255)
  Address?: string;

  @ApiProperty({ type: String, description: 'Gender', required: false })
  @IsOptional()
  @IsEnum(['Male', 'Female', 'Other'])
  Gender?: 'Male' | 'Female' | 'Other';

  @ApiProperty({ type: String, description: 'BirthDate', required: false })
  @IsOptional()
  @IsDateString()
  BirthDate?: string;
}
export class DeleteUserDto {
  @ApiProperty({ type: Number, description: 'ID', required: true })
  @IsNumber()
  Id: number;
}
