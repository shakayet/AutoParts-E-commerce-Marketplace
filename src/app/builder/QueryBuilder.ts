/* eslint-disable @typescript-eslint/no-explicit-any */
import { FilterQuery, Query } from 'mongoose';

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  search(searchableFields: string[]) {
    const searchTerm = this?.query?.searchTerm;
    if (searchTerm) {
      this.modelQuery = this.modelQuery.find({
        $or: searchableFields.map(
          field =>
            ({
              [field]: { $regex: searchTerm, $options: 'i' },
            }) as FilterQuery<T>,
        ),
      });
    }
    return this;
  }

  filter() {
    const queryObj = { ...this.query };
    const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields', 'lowestPrice', 'highestPrice'];
    excludeFields.forEach(el => delete queryObj[el]);
    this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);
    return this;
  }

  priceRange() {
    if (this.query.lowestPrice || this.query.highestPrice) {
      const priceFilter: any = {};

      if (this.query.lowestPrice) {
        priceFilter.$gte = Number(this.query.lowestPrice);
      }
      if (this.query.highestPrice) {
        priceFilter.$lte = Number(this.query.highestPrice);
      }

      this.modelQuery = this.modelQuery.find({
        price: priceFilter,
      } as FilterQuery<T>);
    }
    return this;
  }

  locationRadius() {
    if (this.query.lat && this.query.lng && this.query.radius) {
      const lat = Number(this.query.lat);
      const lng = Number(this.query.lng);
      const radius = Number(this.query.radius); // in kilometers

      // Convert radius to radians (MongoDB uses radians for $geoWithin with $centerSphere)
      const radiusInRadians = radius / 6378.1; // 6378.1 is the radius of the Earth in km

      this.modelQuery = this.modelQuery.find({
        location: {
          $geoWithin: {
            $centerSphere: [[lng, lat], radiusInRadians],
          },
        },
      } as FilterQuery<T>);
    }
    return this;
  }

  sort() {
    const sort =
      (this?.query?.sort as string)?.split(',')?.join(' ') || '-createdAt';
    this.modelQuery = this.modelQuery.sort(sort as string);
    return this;
  }

  paginate() {
    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || 10;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);

    return this;
  }

  fields() {
    const fields =
      (this?.query?.fields as string)?.split(',')?.join(' ') || '-__v';

    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }

  async countTotal() {
    const totalQueries = this.modelQuery.getFilter();
    const total = await this.modelQuery.model.countDocuments(totalQueries);
    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || 10;
    const totalPage = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPage,
    };
  }

  //populating
  populate(populateFields: string[], selectFields: Record<string, unknown>) {
    this.modelQuery = this.modelQuery.populate(
      populateFields.map(field => ({
        path: field,
        select: selectFields[field],
      })),
    );
    return this;
  }

  //pagination information
  async getPaginationInfo() {
    const total = await this.modelQuery.model.countDocuments(
      this.modelQuery.getFilter(),
    );
    const limit = Number(this?.query?.limit) || 10;
    const page = Number(this?.query?.page) || 1;
    const totalPage = Math.ceil(total / limit);

    return {
      total,
      limit,
      page,
      totalPage,
    };
  }
}

export default QueryBuilder;
