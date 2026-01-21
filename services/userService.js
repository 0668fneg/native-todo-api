const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");

const userService = {
  registerUser: async (username, password) => {
    const existingUser = await userModel.findByUsername(username);
    if (existingUser) throw new Error("用戶名已被使用");

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userModel.create(username, hashedPassword);
    return { id: newUser.id, username: newUser.username };
  },

  loginUser: async (username, password) => {
    const user = await userModel.findByUsername(username);
    if (!user) throw new Error("用戶名不存在或密碼錯誤");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("用戶名不存在或密碼錯誤");

    return { id: user.id, username: user.username };
  },
};
module.exports = userService;
