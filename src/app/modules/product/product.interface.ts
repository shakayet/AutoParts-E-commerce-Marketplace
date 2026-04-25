import { Model } from 'mongoose';

export type IProduct = {
  title: string;
  category: string;
  brand?: string;
  description?: string;
  carModels?: string[];
  model?: string;
  year?: number;
  chassisNumber?: string;
  condition: 'new' | 'used' | 'refurbished' | 'newly imported';
  warranty?: string;
  price: number;
  discount?: number;
  mainImage: string;
  galleryImages?: string[];
  partsNumber?: string;
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
