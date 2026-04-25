export type ICategory = {
  name: string;
  slug: string;
  image: string;
  icon?: string;

  description?: string;
  createdAt?: Date;
};

export type CategoryModel = object;
