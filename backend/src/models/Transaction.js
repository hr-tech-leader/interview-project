const BaseModel = require("./BaseModel");
const User = require("./User");
const Category = require("./Category");

class Transaction extends BaseModel {}
Transaction.collection = "transactions";

Transaction.modelMap = {
  userId: User,
  categoryId: Category
};

module.exports = Transaction;