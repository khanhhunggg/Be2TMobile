import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from 'src/common/common.module';
import { HelperModule } from 'src/common/helper/helper.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtStrategy } from './jwt.strategy';
import { User } from 'src/entity/user.entity';
import { UserInformation } from 'src/entity/user-information.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserInformation]),
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
    }),
    PassportModule,
    CommonModule,
    HelperModule,
  ],
  controllers: [UserController],
  providers: [UserService, JwtStrategy],
  exports: [PassportModule, JwtStrategy, UserService],
})
export class UserModule {}
