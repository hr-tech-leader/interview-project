const BaseModel = require("./BaseModel");

class User extends BaseModel {}
User.collection = "users";
User.modelMap = {};

module.exports = User;