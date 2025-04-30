import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserJwtDto } from 'src/dto/user.dto';
import { User } from 'src/entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class HelperService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async validateAdmin(UserReq: UserJwtDto) {
    const user = await this.userRepository.findOne({
      where: { id: Number(UserReq.id) },
    });

    if (!user) {
      throw new BadRequestException('USER_NOT_FOUND');
    }

    if (user.isAdmin == true) {
      throw new BadRequestException('USER_NOT_ADMIN');
    }

    return true;
  }
}
