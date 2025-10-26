import { Model, Types } from 'mongoose';

export type IWishlist = {
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  createdAt?: Date;
};

export type WishlistModel = Model<IWishlist>;
