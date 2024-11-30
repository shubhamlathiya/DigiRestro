const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
        bill_no: {
        type: Number, required: true
    },
    branch_id: {
        type: mongoose.Schema.Types.ObjectId, ref: 'branch', required: true,
    }, table_id: {
        type: mongoose.Schema.Types.ObjectId, ref: 'table_of_area', required: true,
    }, item: [{
        food_sub_item_id: {
            type: mongoose.Schema.Types.ObjectId, ref: 'food_sub_item', required: true
        }, quantity: {
            type: Number, required: true
        }, price: {
            type: Number, require: true
        }, itemStatus: {
            type: Number, require: true  // 1-save 2-kot 3-completed
        }, created_at: {
            type: Date, default: new Date(),
        }
    }], status: {
        type: Number,  // 4-completed ,1-running ,3-printed,2- KOT
    }, total_price: {
        type: Number, required: true
    }, payment_mode: {
        type: Number,    //  1-online , 2-card , 3-cash , 4-other
    }, deleted: {
        type: Boolean, default: false,
    }, created_at: {
        type: Date, default: new Date(),
    }
});

// Define Model for Order
const order = mongoose.model('order', orderSchema);

module.exports = order;