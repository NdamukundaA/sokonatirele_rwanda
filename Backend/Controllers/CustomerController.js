const User = require('../models/User');
const Order = require('../models/Order');
const Address = require('../models/Address');
const mongoose = require('mongoose');

// Get all customers
const getAllCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    let searchFilter = {};
    if (search) {
      searchFilter = {
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phoneNumber: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const customers = await User.aggregate([
      { $match: searchFilter },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'userId',
          as: 'orders'
        }
      },
      {
        $lookup: {
          from: 'addresses',
          localField: '_id',
          foreignField: 'userId',
          as: 'addresses'
        }
      },
      {
        $project: {
          _id: 1,
          fullName: 1,
          email: 1,
          phoneNumber: 1,
          status: 1,
          ordersCount: { $size: '$orders' },
          spent: { $sum: '$orders.amount' },
          lastOrder: { $max: '$orders.createdAt' },
          addresses: 1
        }
      },
      { $sort: { [sortBy]: sortOrder } },
      { $skip: skip },
      { $limit: limit }
    ]);

    const formattedCustomers = customers.map(customer => {
      const primaryAddress = customer.addresses[0] || null;
      const formattedAddress = primaryAddress
        ? `${primaryAddress.street}, ${primaryAddress.city}, ${primaryAddress.country}`
        : 'Not provided';

      return {
        ...customer,
        lastOrder: customer.lastOrder ? new Date(customer.lastOrder).toLocaleDateString() : 'N/A',
        address: formattedAddress,
        addresses: customer.addresses
      };
    });

    const totalCustomers = await User.countDocuments(searchFilter);
    const totalPages = Math.ceil(totalCustomers / limit);

    res.status(200).json({
      customers: formattedCustomers,
      currentPage: page,
      totalPages,
      totalCustomers
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get customer by ID
const getCustomerById = async (req, res) => {
  try {
    const customerId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ message: 'Invalid customer ID' });
    }
    const customer = await User.findById(customerId).select('-password');
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    // Fetch addresses separately
    const addresses = await Address.find({ userId: customerId });
    // Add addresses to the response
    const customerWithAddresses = {
      ...customer.toObject(),
      addresses
    };
    res.status(200).json(customerWithAddresses);
  } catch (error) {
    console.error('Error fetching customer by ID:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get orders for a customer
// Get orders for a customer
const getCustomerOrders = async (req, res) => {
  try {
    const customerId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ message: 'Invalid customer ID' });
    }
    const orders = await Order.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(customerId) } },
      {
        $lookup: {
          from: 'products',
          localField: 'products.productId',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $lookup: {
          from: 'addresses',
          localField: 'address',
          foreignField: '_id',
          as: 'addressDetails'
        }
      },
      {
        $unwind: { path: '$addressDetails', preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          amount: 1,
          status: 1,
          paymentStatus: 1,
          createdAt: 1,
          updatedAt: 1,
          address: {
            street: '$addressDetails.street',
            city: '$addressDetails.city',
            country: '$addressDetails.country',
            district: '$addressDetails.district',
            sector: '$addressDetails.sector',
            cell: '$addressDetails.cell',
            village: '$addressDetails.village',
            postalCode: '$addressDetails.postalCode',
            phoneNumber: '$addressDetails.phoneNumber',
            firstName: '$addressDetails.firstName',
            lastName: '$addressDetails.lastName',
            email: '$addressDetails.email'
          },
          products: {
            $map: {
              input: '$products',
              as: 'product',
              in: {
                productId: '$$product.productId',
                productQuantity: '$$product.productQuantity',
                price: '$$product.price',
                unit: '$$product.unit',
                productName: {
                  $let: {
                    vars: {
                      idx: { $indexOfArray: ['$productDetails._id', '$$product.productId'] }
                    },
                    in: {
                      $arrayElemAt: ['$productDetails.productname', '$$idx']
                    }
                  }
                },
                productImage: {
                  $let: {
                    vars: {
                      idx: { $indexOfArray: ['$productDetails._id', '$$product.productId'] }
                    },
                    in: {
                      $arrayElemAt: ['$productDetails.productImage', '$$idx']
                    }
                  }
                }
              }
            }
          }
        }
      },
      {
        $addFields: {
          products: {
            $filter: {
              input: '$products',
              as: 'product',
              cond: { $ne: ['$$product.productName', null] }
            }
          }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    if (!orders.length) {
      console.warn(`No orders found for customer ID: ${customerId}`);
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}; 

module.exports = { getAllCustomers, getCustomerById, getCustomerOrders };