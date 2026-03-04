import { Product } from '../product/product.model';
import { Category } from '../category/category.model';
import QueryBuilder from '../../builder/QueryBuilder';

const getTopProducts = async () => {
  const products = await Product.find({})
    .sort({ averageRating: -1, totalRatings: -1 })
    .limit(10);
  return products;
};

const getCategorySummary = async (query: Record<string, unknown>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const [result] = await Category.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: 'name',
        foreignField: 'category',
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
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: 'total' }],
      },
    },
  ]);

  const total = result?.totalCount?.[0]?.total || 0;
  const totalPage = Math.ceil(total / limit) || 0;

  return {
    data: result?.data || [],
    meta: {
      total,
      page,
      limit,
      totalPage,
    },
  };
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
