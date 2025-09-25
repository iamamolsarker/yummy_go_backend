const database = require('../config/database');
const { ObjectId } = require('mongodb');

const create = async (restaurantData) => {
    const collection = database.getCollection('restaurants');
    const restaurant = {
        name: restaurantData.name,
        location: {
            address: restaurantData.location?.address || null,
            city: restaurantData.location?.city || null,
            area: restaurantData.location?.area || null,
        },

        phone: restaurantData.phone || null,
        email: restaurantData.email || null,
        cuisine: restaurantData.cuisine || [],
        category: restaurantData.category || 'restaurant',

        images: restaurantData.images || [],
        cover_image: restaurantData.cover_image || null,


        rating: restaurantData.rating || 0,
        total_reviews: restaurantData.total_reviews || 0,

        created_at: new Date(),
        updated_at: new Date()
    };

    const result = await collection.insertOne(restaurant);
    return result;
};

const findById = async (id) => {
    const collection = database.getCollection('restaurants');
    const restaurant = await collection.findOne({ _id: new ObjectId(id) });
    return restaurant;
};

const findByName = async (name) => {
    const collection = database.getCollection('restaurants');
    const restaurant = await collection.findOne({
        name: { $regex: new RegExp(name, 'i') }
    });
    return restaurant;
};

const findAll = async (filters = {}) => {
    const collection = database.getCollection('restaurants');
    let query = { is_active: true };

    // Add filters
    if (filters.cuisine) {
        query.cuisine = { $in: [filters.cuisine] };
    }
    if (filters.city) {
        query['location.city'] = { $regex: new RegExp(filters.city, 'i') };
    }
    if (filters.area) {
        query['location.area'] = { $regex: new RegExp(filters.area, 'i') };
    }
    if (filters.category) {
        query.category = filters.category;
    }
    if (filters.price_range) {
        query.price_range = filters.price_range;
    }
    if (filters.is_featured) {
        query.is_featured = filters.is_featured;
    }

    const restaurants = await collection.find(query)
        .sort({ rating: -1, created_at: -1 })
        .toArray();
    return restaurants;
};

const updateById = async (id, updateData) => {
    const collection = database.getCollection('restaurants');
    updateData.updated_at = new Date();
    const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
    );
    return result;
};

const deleteById = async (id) => {
    const collection = database.getCollection('restaurants');
    const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { is_active: false, updated_at: new Date() } }
    );
    return result;
};

const updateRating = async (id, newRating, reviewCount) => {
    const collection = database.getCollection('restaurants');
    const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        {
            $set: {
                rating: newRating,
                total_reviews: reviewCount,
                updated_at: new Date()
            }
        }
    );
    return result;
};

const findNearby = async (coordinates, maxDistance = 5000) => {
    const collection = database.getCollection('restaurants');
    const restaurants = await collection.find({
        is_active: true,
        'location.coordinates': {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [coordinates.lng, coordinates.lat]
                },
                $maxDistance: maxDistance
            }
        }
    }).toArray();
    return restaurants;
};

const searchRestaurants = async (searchTerm) => {
    const collection = database.getCollection('restaurants');
    const restaurants = await collection.find({
        is_active: true,
        $or: [
            { name: { $regex: new RegExp(searchTerm, 'i') } },
            { cuisine: { $regex: new RegExp(searchTerm, 'i') } },
            { 'location.area': { $regex: new RegExp(searchTerm, 'i') } },
            { category: { $regex: new RegExp(searchTerm, 'i') } }
        ]
    }).sort({ rating: -1 }).toArray();
    return restaurants;
};

module.exports = {
    create,
    findById,
    findByName,
    findAll,
    updateById,
    deleteById,
    updateRating,
    findNearby,
    searchRestaurants
};