/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
import { CategoryController } from '../src/app/modules/category/category.controller';
import { CategoryService } from '../src/app/modules/category/category.service';

jest.mock('../src/app/modules/category/category.service');

describe('CategoryController', () => {
  beforeEach(() => jest.clearAllMocks());

  it('createCategoryRequest calls service and returns result', async () => {
    const mockReq: any = { user: { id: 'u1' }, body: { name: 'New', description: 'd' } };
    const mockRes: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    (CategoryService.createCategoryRequestToDB as jest.Mock).mockResolvedValue({ _id: 'cr1' });

    await CategoryController.createCategoryRequest(mockReq, mockRes, jest.fn());

    expect(CategoryService.createCategoryRequestToDB).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalled();
  });

  it('reviewCategoryRequest calls service and returns result', async () => {
    const mockReq: any = { params: { id: 'cr1' }, body: { status: 'approved', adminComment: 'ok' } };
    const mockRes: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    (CategoryService.reviewCategoryRequestToDB as jest.Mock).mockResolvedValue({ _id: 'cr1' });

    await CategoryController.reviewCategoryRequest(mockReq, mockRes, jest.fn());

    expect(CategoryService.reviewCategoryRequestToDB).toHaveBeenCalledWith('cr1', 'approved', 'ok');
    expect(mockRes.status).toHaveBeenCalled();
  });
});
