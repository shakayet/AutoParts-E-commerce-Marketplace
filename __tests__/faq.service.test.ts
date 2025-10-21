/* eslint-disable no-undef */
import { FAQService } from '../src/app/modules/faq/faq.service';
import { FAQ } from '../src/app/modules/faq/faq.model';

jest.mock('../src/app/modules/faq/faq.model');

describe('FAQService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('createFAQToDB calls FAQ.create and returns document', async () => {
    const payload = { question: 'Q', answer: 'A' };
    (FAQ.create as jest.Mock).mockResolvedValue({ _id: 'f1', ...payload });

    const res = await FAQService.createFAQToDB(payload);
    expect(FAQ.create).toHaveBeenCalledWith(payload);
    expect(res).toEqual(expect.objectContaining({ _id: 'f1' }));
  });

  it('getFAQsFromDB returns active FAQs', async () => {
    const docs = [{ _id: 'f1' }];
    (FAQ.find as jest.Mock).mockReturnValue({ sort: jest.fn().mockResolvedValue(docs) });

    const res = await FAQService.getFAQsFromDB();
    expect(FAQ.find).toHaveBeenCalledWith({ isActive: true });
    expect(res).toEqual(docs);
  });
});
