const BaseModel = require("./BaseModel");
const User = require("./User");

class Category extends BaseModel {}
Category.collection = "categories";

Category.modelMap = {
  userId: User
};

module.exports = Category;