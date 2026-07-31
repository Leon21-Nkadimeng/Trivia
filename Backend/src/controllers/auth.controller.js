const authService = require("../services/auth.service");
const crypto = require("crypto");
const bcrypt = require("bcrypt")
async function registerUser(req, res) {
  try {
    console.log(req.body)
    const { Username, Email, Password} = req.body;
    if( !Username || !Email || !Password)
      return res.status(400).json({message:"Missing value(s)."});
    await authService.registerUser({
      UserID: crypto.randomUUID(), 
      Username, 
      Email, 
      Password: await bcrypt.hash(Password, 10)
    });
    return res.status(201).json({message:"User successfully registered."});
  } catch (error) {
    console.log(error);
    return res.status(500).json({message: error.message});
  }
}

module.exports = {registerUser}