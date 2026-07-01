import { IUserDocument, User } from '@modules/auth/model/user.model';
import { RegisterDto } from '@modules/auth/dto/auth.dto';
import { USER_ROLES } from '@shared/constants';
import { AuthUser } from '@shared/interfaces/auth.interface';

export const authRepository = {
  async createUser(data: RegisterDto): Promise<IUserDocument> {
    return User.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: data.role ?? USER_ROLES.CUSTOMER,
    });
  },

  async findByEmail(email: string): Promise<IUserDocument | null> {
    return User.findOne({ email: email.toLowerCase() }).select('+password +refreshToken');
  },

  async findByPhone(phone: string): Promise<IUserDocument | null> {
    return User.findOne({ phone }).select('+password +refreshToken');
  },

  async findById(id: string): Promise<IUserDocument | null> {
    return User.findById(id);
  },

  async findByIdWithRefreshToken(id: string): Promise<IUserDocument | null> {
    return User.findById(id).select('+refreshToken');
  },

  async updateRefreshToken(userId: string, hashedToken: string | null): Promise<void> {
    await User.findByIdAndUpdate(userId, { refreshToken: hashedToken });
  },

  toAuthUser(user: IUserDocument): AuthUser {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },
};
