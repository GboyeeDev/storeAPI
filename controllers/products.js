const Product = require('../models/products')

const getAllProductsStatic = async (req, res) => {
    const products = await Product.find({ price: {$gt: 30 } }).sort('price').select('name price').limit(10).skip(5)
    res.status(200).json({ products, nbHits: products.length })
}


// Real functionality
const getAllProducts = async (req, res) => {

    // to filter the model properties
    const { featured, company, name, sort, fields, numericFilters } = req.query
    const queryObject = {}

    if (featured) {
        queryObject.featured = featured === 'true' ? true : false
    }

    if (company) {
        queryObject.company = company
    }

    if (name) {
        queryObject.name = { $regex: name, $options: 'i' }
    }


    // converting numericfilter signs to what mongoose understands (for price and rating or any properties that Numbers)
    if (numericFilters) {
        const operatorMap = {
            ">": '$gt',
            ">=": '$gte',
            "=": '$eq',
            "<": '$lt',
            "<=": '$lte'
        }
        const regEx = /\b(<|>|>=|=|<=)\b/g
        let filters = numericFilters.replace(
            regEx,
            (match) => `-${operatorMap[match]}-`
        )

        // for the price and rating to structure in the console i.e { price: { '$gt': 40 }, rating: { '$gte': 4 } } instead of price-$gt-40,rating-$gte-4
        const options = ['price', 'rating'];
        filters = filters.split(',').forEach((item) => {
            const [field, operator, value] = item.split('-')
            if (options.includes(field)) {
                queryObject[field] = { [operator]: Number(value) }
            }
        })
    }
    console.log(queryObject)

    // chaining the sort
    let result = Product.find(queryObject)

    if (sort) {
        const sortList = sort.split(',').join(' ');
        result = result.sort(sortList)
    }
    else {
        result = result.sort('createdAt')
    }

    // chaining the fields or select 
    if (fields) {
        const fieldsList = fields.split(',').join(' ');
        result = result.select(fieldsList)
    }

    // for paging limit and skip
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit;

    result = result.skip(skip).limit(limit)

    // I have 23 products
    // so the paging will be like 4 7 7 7 2

    const products = await result
    res.status(200).json({ products, nbHits: products.length })
} 

module.exports = {
    getAllProducts,
    getAllProductsStatic
}