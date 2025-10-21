/* eslint-disable @typescript-eslint/no-explicit-any */
import { model, Schema } from 'mongoose';
import { ProductModel, IProduct } from './product.interface';


const productSchema = new Schema<IProduct, ProductModel>(
  {
    title: { type: String, required: true, text: true },
    category: { type: String, required: true, index: true },
    brand: { type: String },
    description: { type: String },
    carModels: [{ type: String }],
    chassisNumber: { type: String, index: true },
    condition: { type: String, enum: ['new', 'used', 'refurbished'] },
    warranty: { type: String },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    mainImage: { type: String },
    galleryImages: [{ type: String }],
    sellerName: { type: (Schema.Types.ObjectId as any), ref: 'User', required: true },
    productRating: {
      type: {
        oneStar: { type: Number, default: 0 },
        twoStar: { type: Number, default: 0 },
        threeStar: { type: Number, default: 0 },
        fourStar: { type: Number, default: 0 },
        fiveStar: { type: Number, default: 0 },
      },
      default: {
        oneStar: 0,
        twoStar: 0,
        threeStar: 0,
        fourStar: 0,
        fiveStar: 0,
      },
    },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// text index for keyword search
productSchema.index({ title: 'text', description: 'text', brand: 'text' });

export const Product = model<IProduct, ProductModel>('Product', productSchema);
