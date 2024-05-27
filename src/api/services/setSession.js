import jwt from 'jsonwebtoken'; 
import dotenv from 'dotenv'
dotenv.config()

export default async function(user, req){
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
    req.session.user = user; //Set user info
    req.session.isAuthenticated = true; // Explicitly mark the session as authenticated
    req.session.JWT = token;
    return;
}
