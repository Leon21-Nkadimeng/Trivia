const db = require("../config/database");

async function registerUser(UserDetails) {
  const SQL = 'INSERT INTO Hosts (ID, Username, Email, Password) VALUES (?, ?, ?, ?)';
  await db.query(SQL, [UserDetails.UserID, UserDetails.Username, UserDetails.Email, UserDetails.Password]);
}


module.exports = {registerUser};