const database = require('../config/database');
const { ObjectId } = require('mongodb');

const create = async (menuData) => {
    const collection = database.getCollection('menus');
    const menu = {
        restaurant_id: new ObjectId(menuData.restaurant_id),
        name: menuData.name,
        description: menuData.description || null,
        price: menuData.price,
        category: menuData.category || 'main_course', // appetizer, main_course, dessert, beverage, etc.
        image: menuData.image || null,
        ingredients: menuData.ingredients || [],
        allergens: menuData.allergens || [],
        nutrition: {
            calories: menuData.nutrition?.calories || null,
            protein: menuData.nutrition?.protein || null,
            carbs: menuData.nutrition?.carbs || null,
            fat: menuData.nutrition?.fat || null
        },
        is_vegetarian: menuData.is_vegetarian || false,
        is_vegan: menuData.is_vegan || false,
        is_halal: menuData.is_halal || true,
        is_available: menuData.is_available !== undefined ? menuData.is_available : true,
        is_featured: menuData.is_featured || false,
        preparation_time: menuData.preparation_time || '15-20 mins',
        rating: menuData.rating || 0,
        total_reviews: menuData.total_reviews || 0,
        created_at: new Date(),
        updated_at: new Date()
    };
    
    const result = await collection.insertOne(menu);
    return result;
};

const findById = async (id) => {
    const collection = database.getCollection('menus');
    const menu = await collection.findOne({ _id: new ObjectId(id) });
    return menu;
};

const findByRestaurantId = async (restaurantId, filters = {}) => {
    const collection = database.getCollection('menus');
    let query = { 
        restaurant_id: new ObjectId(restaurantId),
        is_available: true 
    };
    
    // Add filters
    if (filters.category) {
        query.category = filters.category;
    }
    if (filters.is_vegetarian !== undefined) {
        query.is_vegetarian = filters.is_vegetarian;
    }
    if (filters.is_vegan !== undefined) {
        query.is_vegan = filters.is_vegan;
    }
    if (filters.is_featured !== undefined) {
        query.is_featured = filters.is_featured;
    }
    if (filters.min_price) {
        query.price = { ...query.price, $gte: parseFloat(filters.min_price) };
    }
    if (filters.max_price) {
        query.price = { ...query.price, $lte: parseFloat(filters.max_price) };
    }
    
    const menus = await collection.find(query)
        .sort({ is_featured: -1, rating: -1, created_at: -1 })
        .toArray();
    return menus;
};

const findAll = async (filters = {}) => {
    const collection = database.getCollection('menus');
    let query = { is_available: true };
    
    // Add filters
    if (filters.category) {
        query.category = filters.category;
    }
    if (filters.restaurant_id) {
        query.restaurant_id = new ObjectId(filters.restaurant_id);
    }
    
    const menus = await collection.find(query)
        .sort({ rating: -1, created_at: -1 })
        .toArray();
    return menus;
};

const updateById = async (id, updateData) => {
    const collection = database.getCollection('menus');
    updateData.updated_at = new Date();
    const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
    );
    return result;
};

const deleteById = async (id) => {
    const collection = database.getCollection('menus');
    const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { is_available: false, updated_at: new Date() } }
    );
    return result;
};

const updateRating = async (id, newRating, totalReviews) => {
    const collection = database.getCollection('menus');
    const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { 
            $set: { 
                rating: newRating,
                total_reviews: totalReviews,
                updated_at: new Date()
            }
        }
    );
    return result;
};

const searchMenus = async (searchTerm, restaurantId = null) => {
    const collection = database.getCollection('menus');
    let query = {
        is_available: true,
        $or: [
            { name: { $regex: new RegExp(searchTerm, 'i') } },
            { description: { $regex: new RegExp(searchTerm, 'i') } },
            { category: { $regex: new RegExp(searchTerm, 'i') } },
            { ingredients: { $regex: new RegExp(searchTerm, 'i') } }
        ]
    };
    
    if (restaurantId) {
        query.restaurant_id = new ObjectId(restaurantId);
    }
    
    const menus = await collection.find(query)
        .sort({ rating: -1 })
        .toArray();
    return menus;
};

const getFeaturedMenus = async (restaurantId = null) => {
    const collection = database.getCollection('menus');
    let query = { 
        is_available: true, 
        is_featured: true 
    };
    
    if (restaurantId) {
        query.restaurant_id = new ObjectId(restaurantId);
    }
    
    const menus = await collection.find(query)
        .sort({ rating: -1 })
        .toArray();
    return menus;
};

const getMenusByCategory = async (restaurantId, category) => {
    const collection = database.getCollection('menus');
    const menus = await collection.find({
        restaurant_id: new ObjectId(restaurantId),
        category: category,
        is_available: true
    }).sort({ rating: -1 }).toArray();
    return menus;
};

module.exports = {
    create,
    findById,
    findByRestaurantId,
    findAll,
    updateById,
    deleteById,
    updateRating,
    searchMenus,
    getFeaturedMenus,
    getMenusByCategory
};