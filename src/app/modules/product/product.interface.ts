import { Model } from 'mongoose';

export type IProductRating = {
  oneStar: number;
  twoStar: number;
  threeStar: number;
  fourStar: number;
  fiveStar: number;
}

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
  sellerName: string;
  coordinates?: { lat?: number; lng?: number };
  productRating?: IProductRating;
  isBlocked?: boolean;
};

export type ProductModel = Model<IProduct>;
