import { Types } from 'mongoose';
import { Wishlist } from './wishlist.model';
import { Product } from '../product/product.model';

const addToWishlist = async (userId: string, productId: string) => {
  
  const productExists = await Product.findById(productId);
  if (!productExists) throw new Error('Product not found');

  const existing = await Wishlist.findOne({ userId, productId });
  if (existing) throw new Error('Product already in wishlist');

  const result = await Wishlist.create({
    userId: new Types.ObjectId(userId),
    productId: new Types.ObjectId(productId),
  });

  return result;
};

const getWishlist = async (userId: string) => {
  const result = await Wishlist.find({ userId }).populate('productId');
  return result;
};

const removeFromWishlist = async (userId: string, productId: string) => {
  const result = await Wishlist.findOneAndDelete({ userId, productId });
  if (!result) throw new Error('Product not found in wishlist');
  return result;
};

export const WishlistService = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
};
