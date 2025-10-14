const database = require('../config/database');
const { ObjectId } = require('mongodb');

const create = async (cartData) => {
    const collection = database.getCollection('carts');
    const cart = {
        user_email: cartData.user_email,
        restaurant_id: new ObjectId(cartData.restaurant_id),
        items: cartData.items || [],
        total_amount: cartData.total_amount || 0,
        status: cartData.status || 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    const result = await collection.insertOne(cart);
    return result;
};

const findByUserEmail = async (userEmail) => {
    const collection = database.getCollection('carts');
    const cart = await collection.findOne({ 
        user_email: userEmail,
        status: 'active'
    });
    return cart;
};

const findById = async (id) => {
    const collection = database.getCollection('carts');
    const cart = await collection.findOne({ _id: new ObjectId(id) });
    return cart;
};

const updateCart = async (cartId, updateData) => {
    const collection = database.getCollection('carts');
    const result = await collection.updateOne(
        { _id: new ObjectId(cartId) },
        { 
            $set: { 
                ...updateData,
                updated_at: new Date().toISOString()
            }
        }
    );
    return result;
};

const addItem = async (cartId, item) => {
    const collection = database.getCollection('carts');
    const result = await collection.updateOne(
        { _id: new ObjectId(cartId) },
        { 
            $push: { items: item },
            $set: { updated_at: new Date().toISOString() }
        }
    );
    return result;
};

const removeItem = async (cartId, menuId) => {
    const collection = database.getCollection('carts');
    const result = await collection.updateOne(
        { _id: new ObjectId(cartId) },
        { 
            $pull: { items: { menu_id: new ObjectId(menuId) } },
            $set: { updated_at: new Date().toISOString() }
        }
    );
    return result;
};

const updateItemQuantity = async (cartId, menuId, quantity) => {
    const collection = database.getCollection('carts');
    const result = await collection.updateOne(
        { 
            _id: new ObjectId(cartId),
            'items.menu_id': new ObjectId(menuId)
        },
        { 
            $set: { 
                'items.$.quantity': quantity,
                updated_at: new Date().toISOString()
            }
        }
    );
    return result;
};

const clearCart = async (cartId) => {
    const collection = database.getCollection('carts');
    const result = await collection.updateOne(
        { _id: new ObjectId(cartId) },
        { 
            $set: { 
                items: [],
                total_amount: 0,
                updated_at: new Date().toISOString()
            }
        }
    );
    return result;
};

const deleteCart = async (cartId) => {
    const collection = database.getCollection('carts');
    const result = await collection.deleteOne({ _id: new ObjectId(cartId) });
    return result;
};

const updateTotalAmount = async (cartId, totalAmount) => {
    const collection = database.getCollection('carts');
    const result = await collection.updateOne(
        { _id: new ObjectId(cartId) },
        { 
            $set: { 
                total_amount: totalAmount,
                updated_at: new Date().toISOString()
            }
        }
    );
    return result;
};

const changeCartStatus = async (cartId, status) => {
    const collection = database.getCollection('carts');
    const result = await collection.updateOne(
        { _id: new ObjectId(cartId) },
        { 
            $set: { 
                status: status,
                updated_at: new Date().toISOString()
            }
        }
    );
    return result;
};

const findAllCarts = async () => {
    const collection = database.getCollection('carts');
    const result = await collection.find({}).sort({ created_at: -1 }).toArray();
    return result;
};

module.exports = {
    create,
    findByUserEmail,
    findById,
    updateCart,
    addItem,
    removeItem,
    updateItemQuantity,
    clearCart,
    deleteCart,
    updateTotalAmount,
    changeCartStatus,
    findAllCarts
};