import { FilterQuery } from 'mongoose';
import { User, IUserDocument } from '@modules/auth/model/user.model';
import { Product } from '@modules/product/model/product.model';
import { Order } from '@modules/order/model/order.model';
import { AdminUserListQueryDto, AdminUserResponseDto } from '@modules/admin/dto/admin.dto';
import { buildPaginationMeta } from '@shared/helpers/pagination.helper';

const USER_SELECT_FIELDS = '-password -refreshToken';

const toAdminUserResponse = (user: IUserDocument): AdminUserResponseDto => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  isVerified: user.isVerified,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const buildUserFilter = (query: AdminUserListQueryDto): FilterQuery<IUserDocument> => {
  const filter: FilterQuery<IUserDocument> = {};

  if (query.role) {
    filter.role = query.role;
  }

  if (query.isActive !== undefined) {
    filter.isActive = query.isActive;
  }

  if (query.search) {
    const searchRegex = { $regex: query.search, $options: 'i' };
    filter.$or = [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }];
  }

  return filter;
};

export const adminRepository = {
  async findUsers(
    query: AdminUserListQueryDto,
  ): Promise<{ users: AdminUserResponseDto[]; total: number }> {
    const filter = buildUserFilter(query);
    const skip = (query.page - 1) * query.limit;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select(USER_SELECT_FIELDS)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(query.limit)
        .lean<IUserDocument[]>(),
      User.countDocuments(filter),
    ]);

    return {
      users: users.map(toAdminUserResponse),
      total,
    };
  },

  async findUserById(id: string): Promise<AdminUserResponseDto | null> {
    const user = await User.findById(id).select(USER_SELECT_FIELDS).lean<IUserDocument | null>();
    return user ? toAdminUserResponse(user) : null;
  },

  async updateUserRole(id: string, role: IUserDocument['role']): Promise<AdminUserResponseDto | null> {
    const user = await User.findByIdAndUpdate(id, { role }, { new: true, runValidators: true })
      .select(USER_SELECT_FIELDS)
      .lean<IUserDocument | null>();

    return user ? toAdminUserResponse(user) : null;
  },

  async updateUserStatus(id: string, isActive: boolean): Promise<AdminUserResponseDto | null> {
    const update: Record<string, unknown> = { isActive };

    if (!isActive) {
      update.$unset = { refreshToken: '' };
    }

    const user = await User.findByIdAndUpdate(id, update, { new: true, runValidators: true })
      .select(USER_SELECT_FIELDS)
      .lean<IUserDocument | null>();

    return user ? toAdminUserResponse(user) : null;
  },

  async countUsers(): Promise<number> {
    return User.countDocuments();
  },

  async countProducts(): Promise<number> {
    return Product.countDocuments();
  },

  async countOrders(): Promise<number> {
    return Order.countDocuments();
  },

  async getTotalRevenue(): Promise<number> {
    const result = await Order.aggregate<{ totalRevenue: number }>([
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } },
    ]);

    return result[0]?.totalRevenue ?? 0;
  },

  async getOrderStatusBreakdown(): Promise<Record<string, number>> {
    const breakdown = await Order.aggregate<{ _id: string; count: number }>([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const distribution: Record<string, number> = {};
    breakdown.forEach((item) => {
      distribution[item._id] = item.count;
    });

    return distribution;
  },

  buildPaginationMeta,
};
