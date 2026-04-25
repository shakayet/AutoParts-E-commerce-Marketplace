export type ICategoryRequest = {
  requesterId: string;
  name: string;
  image?: string;
  description?: string;
  status?: 'pending' | 'approved' | 'rejected';
};