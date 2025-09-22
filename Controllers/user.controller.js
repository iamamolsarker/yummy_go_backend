import { getUsersCollection } from "../Db/Connect.js";

// Create new user
export const createUser = async (req, res) => {
  try {
    const user = req.body;
    const result = await getUsersCollection.insertOne(user);
    res.send(200).json({
      success: true,
      message: "User create successfuly",
      data: result,
    });
  } catch (err) {
    console.log(err);
  }
};
