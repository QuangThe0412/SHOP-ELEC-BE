/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} password
 * @property {string} name
 * @property {string} role - 'customer' | 'admin'
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {number} price
 * @property {number} originalPrice
 * @property {string} category
 * @property {string} subCategory
 * @property {string} image
 * @property {string[]} images
 * @property {number} rating
 * @property {number} reviewCount
 * @property {number} stock
 * @property {string[]} tags
 * @property {Object} specs
 * @property {boolean} isBestSeller
 * @property {boolean} isNewArrival
 */

/**
 * @typedef {Object} Category
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {string} icon
 * @property {SubCategory[]} subCategories
 * @property {number} itemCount
 */

/**
 * @typedef {Object} SubCategory
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {number} itemCount
 */

/**
 * @typedef {Object} CartItem
 * @property {string} id
 * @property {string} productId
 * @property {string} userId
 * @property {number} quantity
 * @property {Product} product
 */

/**
 * @typedef {Object} Order
 * @property {string} id
 * @property {string} userId
 * @property {string} orderCode
 * @property {OrderItem[]} items
 * @property {number} subtotal
 * @property {number} shippingFee
 * @property {number} total
 * @property {string} status - 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled'
 * @property {string} paymentMethod - 'cod' | 'transfer' | 'card'
 * @property {string} paymentStatus - 'pending' | 'paid' | 'failed'
 * @property {CustomerInfo} customerInfo
 * @property {OrderTimeline[]} timeline
 * @property {string} createdAt
 */

/**
 * @typedef {Object} OrderItem
 * @property {string} productId
 * @property {string} name
 * @property {number} price
 * @property {number} quantity
 * @property {string} image
 */

/**
 * @typedef {Object} CustomerInfo
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {string} address
 * @property {string} city
 * @property {string} district
 * @property {string} ward
 */

/**
 * @typedef {Object} OrderTimeline
 * @property {string} status
 * @property {string} timestamp
 * @property {string} description
 */

/**
 * @typedef {Object} Review
 * @property {string} id
 * @property {string} productId
 * @property {string} userId
 * @property {string} userName
 * @property {number} rating
 * @property {string} comment
 * @property {string[]} images
 * @property {boolean} verifiedPurchase
 * @property {string} createdAt
 */

module.exports = {};
