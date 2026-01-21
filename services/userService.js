const userModel = require("../models/userModel");

const userService = {
  registerUser: async (username, password) => {
    const existingUser = await userModel.findByUsername(username);
    if (existingUser) {
      throw new Error("用戶名已被使用");
    }
    const newUser = await userModel.create(username, password);
    return { id: newUser.id, username: newUser.username };
  },

  loginUser: async (username, password) => {
    const user = await userModel.findByUsername(username);
    if (!user || user.password !== password) {
      throw new Error("用戶名不存在或密碼不正確");
    }
    return { id: user.id, username: user.username };
  },
};
module.exports = userService;
