import { User } from "../../models/userModel.js";

export const checkAdmin = async (req, res) => {
  const adminExists = await User.exists({ role: "admin" });
  return res.json({ adminExists: !!adminExists });
};
