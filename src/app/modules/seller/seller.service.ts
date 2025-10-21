/* eslint-disable @typescript-eslint/no-explicit-any */
import { User } from '../user/user.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';

const getSellerLocationLinkFromDB = async (sellerId: string) => {
  const user = await User.findById(sellerId).select('+coordinates');
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, 'Seller not found');
  const coords: any = (user as any).coordinates;
  if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Seller coordinates not available');
  }
  const lat = coords.lat;
  const lng = coords.lng;
  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  return { url, lat, lng };
};

export const SellerService = { getSellerLocationLinkFromDB };
