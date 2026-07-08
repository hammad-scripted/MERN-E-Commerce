
import {User} from '../models/user.model.js'
import {Product} from '../models/product.model.js'
import {Order} from '../models/order.model.js'
export const getAnalytics = async (req, res) => {

    const  totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const salesData=await Order.aggregate([
        
    ])
}


