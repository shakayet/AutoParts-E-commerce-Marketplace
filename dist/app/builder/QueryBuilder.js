"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Sanitize query object to remove MongoDB operators ($gt, $ne, etc.)
 */
const sanitizeQuery = (obj) => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(sanitizeQuery);
    }
    const sanitized = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            if (!key.startsWith('$')) {
                sanitized[key] = sanitizeQuery(obj[key]);
            }
        }
    }
    return sanitized;
};
class QueryBuilder {
    constructor(modelQuery, query) {
        this.modelQuery = modelQuery;
        this.query = query;
    }
    search(searchableFields) {
        var _a;
        const searchTerm = (_a = this === null || this === void 0 ? void 0 : this.query) === null || _a === void 0 ? void 0 : _a.searchTerm;
        if (searchTerm) {
            this.modelQuery = this.modelQuery.find({
                $or: searchableFields.map(field => ({
                    [field]: { $regex: searchTerm, $options: 'i' },
                })),
            });
        }
        return this;
    }
    filter() {
        const queryObj = Object.assign({}, this.query);
        const excludeFields = [
            'searchTerm',
            'sort',
            'limit',
            'page',
            'fields',
            'lowestPrice',
            'highestPrice',
        ];
        excludeFields.forEach(el => delete queryObj[el]);
        // Sanitize to prevent NoSQL injection
        const sanitizedQuery = sanitizeQuery(queryObj);
        this.modelQuery = this.modelQuery.find(sanitizedQuery);
        return this;
    }
    priceRange() {
        if (this.query.lowestPrice || this.query.highestPrice) {
            const priceFilter = {};
            if (this.query.lowestPrice) {
                priceFilter.$gte = Number(this.query.lowestPrice);
            }
            if (this.query.highestPrice) {
                priceFilter.$lte = Number(this.query.highestPrice);
            }
            this.modelQuery = this.modelQuery.find({
                price: priceFilter,
            });
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
                coordinates: {
                    $geoWithin: {
                        $centerSphere: [[lng, lat], radiusInRadians],
                    },
                },
            });
        }
        return this;
    }
    sort() {
        var _a, _b, _c;
        const sort = ((_c = (_b = (_a = this === null || this === void 0 ? void 0 : this.query) === null || _a === void 0 ? void 0 : _a.sort) === null || _b === void 0 ? void 0 : _b.split(',')) === null || _c === void 0 ? void 0 : _c.join(' ')) || '-createdAt';
        this.modelQuery = this.modelQuery.sort(sort);
        return this;
    }
    paginate() {
        var _a, _b;
        const page = Number((_a = this === null || this === void 0 ? void 0 : this.query) === null || _a === void 0 ? void 0 : _a.page) || 1;
        const limit = Number((_b = this === null || this === void 0 ? void 0 : this.query) === null || _b === void 0 ? void 0 : _b.limit) || 10;
        const skip = (page - 1) * limit;
        this.modelQuery = this.modelQuery.skip(skip).limit(limit);
        return this;
    }
    fields() {
        var _a, _b, _c;
        const fields = ((_c = (_b = (_a = this === null || this === void 0 ? void 0 : this.query) === null || _a === void 0 ? void 0 : _a.fields) === null || _b === void 0 ? void 0 : _b.split(',')) === null || _c === void 0 ? void 0 : _c.join(' ')) || '-__v';
        this.modelQuery = this.modelQuery.select(fields);
        return this;
    }
    getCountFilter(filter) {
        const countFilter = Object.assign({}, filter);
        if (countFilter.coordinates) {
            const geoFilter = countFilter.coordinates.$near || countFilter.coordinates.$nearSphere;
            if (geoFilter) {
                const { $geometry, $maxDistance } = geoFilter;
                if ($maxDistance) {
                    // Convert maxDistance (meters) to radians for $centerSphere
                    const radiusInRadians = $maxDistance / 6378100;
                    countFilter.coordinates = {
                        $geoWithin: {
                            $centerSphere: [$geometry.coordinates, radiusInRadians],
                        },
                    };
                }
                else {
                    delete countFilter.coordinates;
                }
            }
        }
        return countFilter;
    }
    countTotal() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const totalQueries = this.getCountFilter(this.modelQuery.getFilter());
            const total = yield this.modelQuery.model.countDocuments(totalQueries);
            const page = Number((_a = this === null || this === void 0 ? void 0 : this.query) === null || _a === void 0 ? void 0 : _a.page) || 1;
            const limit = Number((_b = this === null || this === void 0 ? void 0 : this.query) === null || _b === void 0 ? void 0 : _b.limit) || 10;
            const totalPage = Math.ceil(total / limit);
            return {
                page,
                limit,
                total,
                totalPage,
            };
        });
    }
    //populating
    populate(populateFields, selectFields) {
        this.modelQuery = this.modelQuery.populate(populateFields.map(field => ({
            path: field,
            select: selectFields[field],
        })));
        return this;
    }
    //pagination information
    getPaginationInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const totalQueries = this.getCountFilter(this.modelQuery.getFilter());
            const total = yield this.modelQuery.model.countDocuments(totalQueries);
            const limit = Number((_a = this === null || this === void 0 ? void 0 : this.query) === null || _a === void 0 ? void 0 : _a.limit) || 10;
            const page = Number((_b = this === null || this === void 0 ? void 0 : this.query) === null || _b === void 0 ? void 0 : _b.page) || 1;
            const totalPage = Math.ceil(total / limit);
            return {
                total,
                limit,
                page,
                totalPage,
            };
        });
    }
}
exports.default = QueryBuilder;
