/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
import { CategoryService } from '../src/app/modules/category/category.service';
import { CategoryRequest } from '../src/app/modules/category/categoryRequest.model';
import { Category } from '../src/app/modules/category/category.model';
import { Notification } from '../src/app/modules/notification/notification.model';

jest.mock('../src/app/modules/category/categoryRequest.model');
jest.mock('../src/app/modules/category/category.model');
jest.mock('../src/app/modules/notification/notification.model');

describe('CategoryService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('createCategoryRequestToDB creates a request', async () => {
    (CategoryRequest.create as jest.Mock).mockResolvedValue({ _id: 'cr1', name: 'New Cat' });

    const res = await CategoryService.createCategoryRequestToDB('user1', { name: 'New Cat', description: 'desc' });
    expect(CategoryRequest.create).toHaveBeenCalled();
    expect(res).toEqual(expect.objectContaining({ _id: 'cr1' }));
  });

  it('reviewCategoryRequestToDB approves and creates category and notification', async () => {
    const reqDoc: any = {
      _id: 'cr1',
      name: 'Cat1',
      description: 'd',
      requesterId: 'user1',
      save: jest.fn().mockResolvedValue(true),
    };

  // mock findById(...).populate(...) chain
  (CategoryRequest.findById as jest.Mock).mockReturnValue({ populate: jest.fn().mockResolvedValue(reqDoc) });
    (Category.findOne as jest.Mock).mockResolvedValue(null);
    (Category.create as jest.Mock).mockResolvedValue({ _id: 'c1' });
    (Notification.create as jest.Mock).mockResolvedValue({ _id: 'n1' });

  const res = await CategoryService.reviewCategoryRequestToDB('cr1', 'approved', 'ok');

    expect(CategoryRequest.findById).toHaveBeenCalledWith('cr1');
    expect(Category.create).toHaveBeenCalled();
    expect(Notification.create).toHaveBeenCalled();
    expect(res).toEqual(reqDoc);
  });
});
