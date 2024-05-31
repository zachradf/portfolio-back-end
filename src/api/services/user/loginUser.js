import User from '../../../models/user.model.js';
import bcrypt from 'bcrypt';

export default async function loginUser(username, password, res) {
  const user = await User.findOne({ username });
  if (!user) {
    return;
  }
  // Compare the provided password with the stored hashed password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return;
  }

  return user;
}
