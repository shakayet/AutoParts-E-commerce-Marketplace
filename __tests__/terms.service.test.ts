/* eslint-disable no-undef */
import { TermsService } from '../src/app/modules/terms/terms.service';
import { Terms } from '../src/app/modules/terms/terms.model';

jest.mock('../src/app/modules/terms/terms.model');

describe('TermsService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('createTermsToDB calls Terms.create', async () => {
    const payload = { content: 'T' };
    (Terms.create as jest.Mock).mockResolvedValue({ _id: 't1', ...payload });

    const res = await TermsService.createTermsToDB(payload);
    expect(Terms.create).toHaveBeenCalledWith(payload);
    expect(res).toEqual(expect.objectContaining({ _id: 't1' }));
  });

  it('getTermsFromDB returns active Terms', async () => {
    const docs = [{ _id: 't1' }];
    (Terms.find as jest.Mock).mockReturnValue({ sort: jest.fn().mockResolvedValue(docs) });

    const res = await TermsService.getTermsFromDB();
    expect(Terms.find).toHaveBeenCalledWith({ isActive: true });
    expect(res).toEqual(docs);
  });
});
