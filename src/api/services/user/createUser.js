import User from '../../../models/user.model.js';

export default async function createUser(
  username,
  hashedPassword,
  email,
  name,
  address,
  encryptedPrivateKey,
  nftProfilePicture
) {
  let user = new User({
    username,
    password: hashedPassword,
    email,
    name,
    walletAddress: address,
    privateKey: encryptedPrivateKey,
    nftProfilePicture,
  });

  await user.save();
  return user;
}
