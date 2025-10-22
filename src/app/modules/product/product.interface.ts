import { Model } from 'mongoose';

export type IProduct = {
  title: string;
  category: string;
  brand?: string;
  description?: string;
  carModels?: string[];
  chassisNumber?: string;
  condition?: 'new' | 'used' | 'refurbished';
  warranty?: string;
  price: number;
  discount?: number;
  mainImage?: string;
  galleryImages?: string[];
  sellerId: string;
  coordinates?: { lat?: number; lng?: number };
  averageRating?: number;
  totalRatings?: number;
  sellerRating?: number;
  isBlocked?: boolean;
};

export type ProductModel = {
  // add statics if needed later
} & Model<IProduct>;
