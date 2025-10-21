/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
import { ProductController } from '../src/app/modules/product/product.controller';
import { ProductService } from '../src/app/modules/product/product.service';

jest.mock('../src/app/modules/product/product.service');

const mockSend = jest.fn();
const mockStatus = jest.fn(() => ({ json: mockSend }));

const makeRes = () => ({ status: mockStatus } as any);

describe('ProductController file upload handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createProduct builds mainImage and galleryImages from req.files', async () => {
    const req: any = {
      files: {
        image: [
          { filename: 'main.jpg' },
          { filename: 'g1.jpg' },
          { filename: 'g2.jpg' },
        ],
      },
      body: { title: 'Brake Pad' },
      user: { id: 'seller1' },
    };

    (ProductService.createProductToDB as jest.Mock).mockResolvedValue({
      _id: 'prod1',
      title: 'Brake Pad',
    });

    await ProductController.createProduct(req, makeRes(), jest.fn());

    expect(ProductService.createProductToDB).toHaveBeenCalledWith(
      expect.objectContaining({
        mainImage: '/image/main.jpg',
        galleryImages: ['/image/g1.jpg', '/image/g2.jpg'],
        sellerId: 'seller1',
      })
    );
  });

  test('updateProduct attaches images if provided', async () => {
    const req: any = {
      params: { id: 'prod1' },
      files: { image: [{ filename: 'newmain.jpg' }, { filename: 'g1.jpg' }] },
      body: { price: 20 },
    };

    (ProductService.updateProductToDB as jest.Mock).mockResolvedValue({
      _id: 'prod1',
      price: 20,
    });

    await ProductController.updateProduct(req, makeRes(), jest.fn());

    expect(ProductService.updateProductToDB).toHaveBeenCalledWith('prod1', expect.objectContaining({ mainImage: '/image/newmain.jpg', galleryImages: ['/image/g1.jpg'] }));
  });
});
