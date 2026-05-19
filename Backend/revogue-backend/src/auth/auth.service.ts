import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async syncUserFromCognito(cognitoPayload: {
    id: string;
    email: string;
    role: string;
    full_name?: string;
  }): Promise<User> {
    let user = await this.usersRepository.findOne({
      where: { id: cognitoPayload.id },
    });

    if (!user) {
      user = this.usersRepository.create({
        id: cognitoPayload.id,
        email: cognitoPayload.email,
        role: cognitoPayload.role as UserRole,
        full_name: cognitoPayload.full_name || '',
        password: '',
      });
      await this.usersRepository.save(user);
    }

    return user;
  }
}
