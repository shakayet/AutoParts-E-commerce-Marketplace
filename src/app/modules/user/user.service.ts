/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import StorageService from '../../services/storage.service';
import generateOTP from '../../../util/generateOTP';
import { IUser } from './user.interface';
import { User } from './user.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { Product } from '../product/product.model';
import { Review } from '../review/review.model';
import { Wishlist } from '../wishList/wishlist.model';
import { Notification } from '../notification/notification.model';
import { Report } from '../report/report.model';

type PaginatedResult<T> = {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

const createUserToDB = async (
  payload: Partial<IUser>,
): Promise<{ user: IUser; otp: number }> => {
  //set role
  payload.role = USER_ROLES.USER;
  const createUser = await User.create(payload);
  if (!createUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }

  //send email
  const otp = generateOTP();
  const values = {
    name: createUser.name,
    otp: otp,
    email: createUser.email!,
  };
  const createAccountTemplate = emailTemplate.createAccount(values);
  await emailHelper.sendEmail(createAccountTemplate);

  //save to DB
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  };
  await User.findOneAndUpdate(
    { _id: createUser._id },
    { $set: { authentication } },
  );

  return { user: createUser as IUser, otp };
};

const getUserProfileFromDB = async (
  user: JwtPayload,
): Promise<Partial<IUser>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return isExistUser;
};

const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>,
): Promise<Partial<IUser | null>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // remove previous image from storage if a new one is provided
  if (payload.image && isExistUser.image) {
    await StorageService.deleteByUrl(isExistUser.image as string);
  }

  const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return updateDoc;
};

const getAllUsersFromDB = async (
  filter: any = {},
): Promise<PaginatedResult<Partial<IUser>>> => {
  const searchableFields = ['name', 'email', 'role', 'whatsappNumber'];

  const queryBuilder = new QueryBuilder(User.find({}), filter)
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const [users, total] = await Promise.all([
    queryBuilder.modelQuery.exec(),
    queryBuilder.getPaginationInfo(),
  ]);

  return {
    data: users as Partial<IUser>[],
    meta: {
      total: total.total,
      page: total.page,
      limit: total.limit,
      totalPages: total.totalPage,
    },
  };
};

const getUserByIdFromDB = async (
  id: string,
): Promise<Partial<IUser | null>> => {
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }
  return user;
};

const changePasswordToDB = async (
  user: JwtPayload,
  oldPassword: string,
  newPassword: string,
): Promise<void> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // verify old password
  const isMatch = await User.isMatchPassword(oldPassword, isExistUser.password);
  if (!isMatch) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Old password is incorrect');
  }

  await User.findByIdAndUpdate(id, { password: newPassword });
};

const blockUnblockUserToDB = async (
  userId: string,
  block: boolean,
): Promise<Partial<IUser | null>> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const updated = await User.findByIdAndUpdate(
    userId,
    { isBlocked: block },
    { new: true },
  );
  return updated;
};

const deleteUserFromDB = async (userId: string): Promise<void> => {
  const res = await User.findByIdAndDelete(userId);
  if (!res) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }
  if (res.image) {
    await StorageService.deleteByUrl(res.image as string);
  }
};

const deleteAccountToDB = async (
  user: JwtPayload,
  password: string,
): Promise<void> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // Verify password
  const isMatch = await User.isMatchPassword(password, isExistUser.password);
  if (!isMatch) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Password is incorrect');
  }

  // Delete all user's products and their images
  const products = await Product.find({ sellerId: id });
  for (const product of products) {
    if (product.mainImage) {
      await StorageService.deleteByUrl(product.mainImage);
    }
    if (product.galleryImages && product.galleryImages.length > 0) {
      for (const image of product.galleryImages) {
        await StorageService.deleteByUrl(image);
      }
    }
  }
  await Product.deleteMany({ sellerId: id });

  // Delete all user's reviews
  await Review.deleteMany({ userId: id });

  // Delete all user's wishlist items
  await Wishlist.deleteMany({ userId: id });

  // Delete all user's notifications
  await Notification.deleteMany({ user: id });

  // Delete all user's reports
  await Report.deleteMany({ reporterId: id });

  // Delete user's profile image if it's not the default
  if (
    isExistUser.image &&
    isExistUser.image !== 'https://i.ibb.co/z5YHLV9/profile.png'
  ) {
    await StorageService.deleteByUrl(isExistUser.image);
  }

  // Delete the user
  await User.findByIdAndDelete(id);
};

export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  updateProfileToDB,
  getAllUsersFromDB,
  getUserByIdFromDB,
  changePasswordToDB,
  blockUnblockUserToDB,
  deleteUserFromDB,
  deleteAccountToDB,
};
