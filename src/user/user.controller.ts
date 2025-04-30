import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
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
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserReq } from 'src/common/user.decorator';
import { PaginationResponseDto, SearchDto } from 'src/common/common.dto';
import { User } from 'src/entity/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('sign-up')
  @ApiOperation({ summary: 'Đăng kí' })
  public async SignUp(@Body() user: SignUpDto) {
    return await this.userService.SignUp(user);
  }

  @Post('log-in')
  @ApiOperation({ summary: 'Đăng nhập' })
  public async Login(@Body() user: SignInDto) {
    return await this.userService.LogIn(user);
  }

  @Post('log-out')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Đăng xuất' })
  public async LogOut(@UserReq() user: UserJwtDto) {
    return await this.userService.LogOut(user);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Đổi mật khẩu' })
  public async ForgotPassword(@Body() dto: ChangePassWordDto) {
    return await this.userService.ResetPassword(dto);
  }

  @Put('update-profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cập nhật thông tin tài khoản' })
  public async UpdateProfile(
    @Query() dto: UpdateProfileDto,
    @UserReq() user: UserJwtDto,
  ) {
    return await this.userService.UpdateProfile(dto, user);
  }

  @Put('update-user-by-id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cập nhật thông tin người dùng bằng id' })
  public async UpdateUserByID(
    @Query() dto: UpdateDtoQuery,
    @Body() updateDto: UpdateUserDto,
    @UserReq() user: UserJwtDto,
  ) {
    return await this.userService.updateUserById(dto, updateDto, user);
  }

  @Delete('delete-user-by-id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Xóa người dùng bằng id' })
  public async DeleteUserById(
    @Query() dto: DeleteUserDto,
    @UserReq() user: UserJwtDto,
  ) {
    return await this.userService.deleteUserById(dto, user);
  }

  @Delete('delete-user-by-ids')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Xóa nhiều người dùng bằng id' })
  public async DeleteUserByIds(
    @Body() ids: number[],
    @UserReq() user: UserJwtDto,
  ) {
    return await this.userService.deleteUserByIds(ids, user);
  }

  @Get('get-all-user')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user by email' })
  public async GetUserByEmail(
    @Query() dto: PaginationResponseDto,
    @UserReq() user: UserJwtDto,
  ): Promise<{ data: User[]; total: number }> {
    return await this.userService.getAll(dto, user);
  }

  @Get('get-user-by-id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user by id' })
  public async GetUserByID(
    @Query() id: UpdateDtoQuery,
    @UserReq() user: UserJwtDto,
  ) {
    return await this.userService.getUserByID(id, user);
  }

  @Get('search-user')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user by keyword' })
  public async GetUserByKeyword(
    @Query() dto: SearchDto,
    @Query() paginationDto: PaginationResponseDto,
    @UserReq() user: UserJwtDto,
  ) {
    return await this.userService.getUserByKeyword(dto, paginationDto, user);
  }
}
