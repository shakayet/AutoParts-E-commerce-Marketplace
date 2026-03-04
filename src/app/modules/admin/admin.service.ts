import { Product } from '../product/product.model';
import { Category } from '../category/category.model';
import QueryBuilder from '../../builder/QueryBuilder';

const getTopProducts = async (query: Record<string, unknown>) => {
  const productQuery = new QueryBuilder(
    Product.find({}).sort({ averageRating: -1, totalRatings: -1 }),
    query,
  )
    .paginate()
    .fields();

  const result = await productQuery.modelQuery;
  const meta = await productQuery.countTotal();

  return {
    meta,
    data: result,
  };
};

const getCategorySummary = async () => {
  const categories = await Category.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: 'categoryId',
        as: 'products',
      },
    },
    {
      $project: {
        name: 1,
        itemCount: { $size: '$products' },
        createdAt: {
          $dateToString: { format: '%d-%m-%Y', date: '$createdAt' },
        },
        updatedAt: {
          $dateToString: { format: '%d-%m-%Y', date: '$updatedAt' },
        },
      },
    },
    {
      $sort: { itemCount: -1 },
    },
  ]);
  return categories;
};

const getProducts = async (query: Record<string, unknown>) => {
  const productQuery = new QueryBuilder(Product.find({}), query)
    .search(['name', 'description'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await productQuery.modelQuery;
  const meta = await productQuery.countTotal();

  return {
    meta,
    data: result,
  };
};

const getProduct = async (id: string) => {
  const result = await Product.findById(id);
  return result;
};

export const AdminService = {
  getTopProducts,
  getCategorySummary,
  getProducts,
  getProduct,
};
