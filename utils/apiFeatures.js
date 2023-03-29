class ApiFeatures {
    constructor(query, queryObject) {
        this.query = query;
        this.queryObject = queryObject;
    }

    filter() {
        let queryObj = Object.assign({}, this.queryObject); //{...req.query} same shit
        let excludedQueries = ['page', 'sort', 'limit', 'fields'];
        excludedQueries.forEach(elem => delete queryObj[elem]);

        queryObj = JSON.parse(
            JSON.stringify(queryObj).replace(/\b(gte|gt|lte|lt)\b/g, matchChar => `$${matchChar}`)
        );

        this.query = this.query.find(queryObj);

        return this;
    }

    sorting() {
        let sortBy;
        if (this.queryObject.sort) {
            sortBy = this.queryObject.sort.split(',').join(' ');
        } else {
            sortBy = "-createdAt"
        }
        this.query = this.query.sort(sortBy);

        return this;
    }

    limiting() {
        if (this.queryObject.fields) {
            let fields = this.queryObject.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }

        return this;
    }

    pagination() {
        const page = this.queryObject.page * 1 || 1;
        const limit = this.queryObject.limit * 1 || 50;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports = ApiFeatures;