/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
import { ProductService } from '../src/app/modules/product/product.service';
import { Product } from '../src/app/modules/product/product.model';

jest.mock('../src/app/modules/product/product.model', () => ({
  Product: {
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
  },
}));

const mockProduct = {
  _id: 'prod1',
  title: 'Brake Pad',
  price: 10,
  sellerId: 'seller1',
};

describe('ProductService (mocked)', () => {
  afterEach(() => jest.clearAllMocks());

  test('createProductToDB should create and return product', async () => {
    (Product.create as jest.Mock).mockResolvedValue(mockProduct);

    const res = await ProductService.createProductToDB({ title: 'Brake Pad' } as any);
    expect(Product.create).toHaveBeenCalled();
    expect(res).toEqual(mockProduct);
  });

  test('updateProductToDB should update and return product', async () => {
    (Product.findByIdAndUpdate as jest.Mock).mockResolvedValue({ ...mockProduct, price: 12 });

    const res = await ProductService.updateProductToDB('prod1', { price: 12 } as any);
    expect(Product.findByIdAndUpdate).toHaveBeenCalledWith('prod1', { price: 12 }, { new: true });
    expect(res.price).toBe(12);
  });

  test('deleteProductFromDB should delete product or throw if not found', async () => {
    (Product.findByIdAndDelete as jest.Mock).mockResolvedValue(mockProduct);
    await expect(ProductService.deleteProductFromDB('prod1')).resolves.toBeUndefined();

    (Product.findByIdAndDelete as jest.Mock).mockResolvedValue(null);
    await expect(ProductService.deleteProductFromDB('nope')).rejects.toThrow();
  });

  test('getProductByIdFromDB should return product', async () => {
    (Product.findById as jest.Mock).mockReturnValue({ populate: jest.fn().mockResolvedValue(mockProduct) });
    const res = await ProductService.getProductByIdFromDB('prod1');
    expect(Product.findById).toHaveBeenCalledWith('prod1');
    expect(res).toEqual(mockProduct);
  });

  test('getProductsFromDB should return paginated result', async () => {
    (Product.countDocuments as jest.Mock) = jest.fn().mockResolvedValue(1);
    (Product.find as jest.Mock).mockReturnValue({ skip: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis(), sort: jest.fn().mockResolvedValue([mockProduct]) });
    const res = await ProductService.getProductsFromDB({});
    expect(Product.find).toHaveBeenCalled();
    expect(res.data).toEqual([mockProduct]);
    expect(res.meta.total).toBe(1);
  });

  test('getRelatedProducts should return related list', async () => {
    (Product.findById as jest.Mock).mockResolvedValue(mockProduct);
    (Product.find as jest.Mock).mockReturnValue({ sort: jest.fn().mockReturnThis(), limit: jest.fn().mockResolvedValue([mockProduct]) });

    const res = await ProductService.getRelatedProducts('prod1');
    expect(Product.findById).toHaveBeenCalledWith('prod1');
    expect(Product.find).toHaveBeenCalled();
    expect(res).toEqual([mockProduct]);
  });
});
