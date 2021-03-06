import passport from 'passport';
import FacebookStrategy from 'passport-facebook';
import GoogleStrategy from 'passport-google-oauth20';
import User from '../models/users';
// Import Facebook and Google OAuth apps configs
import { facebook, google } from '../config';

// Transform Facebook profile because Facebook and Google profile objects look different
// and we want to transform them into user objects that have the same set of attributes
const transformFacebookProfile = (profile) => ({
  oauth_id: profile.id,
  name: profile.name,
  avatar: profile.picture.data.url,
});

// Transform Google profile into user object
const transformGoogleProfile = (profile) => ({
  oauth_id: profile.id,
  name: profile.displayName,
  avatar: profile.image.url,
});

// Register Facebook Passport strategy
passport.use(new FacebookStrategy(facebook,
  // Gets called when user authorizes access to their profile
  async (accessToken, refreshToken, profile, done)
  // Return done callback and pass transformed user object
    => done(null, await createOrGetUserFromDatabase(transformFacebookProfile(profile._json)))
));

// Register Google Passport strategy
passport.use(new GoogleStrategy(google,
  async (accessToken, refreshToken, profile, done)
    => done(null, await createOrGetUserFromDatabase(transformGoogleProfile(profile._json)))
));

const createOrGetUserFromDatabase = async (userProfile) => {
  let user = await User.findOne({ 'oauth_id': userProfile.oauth_id }).exec();
  if (!user) {
    user = new User({
      oauth_id: userProfile.oauth_id,
      name: userProfile.name,
      avatar: userProfile.avatar,
    });
    await user.save();
  }
  return user;
};

// Serialize user into the sessions
passport.serializeUser((user, done) => done(null, user));

// Deserialize user from the sessions
passport.deserializeUser((user, done) => done(null, user));

// Facebook
export const facebookLogin = passport.authenticate('facebook');
export const facebookMiddleware = passport.authenticate('facebook', { failureRedirect: '/auth/facebook' });

// Google
export const googleLogin = passport.authenticate('google', { scope: ['profile'] });
export const googleMiddleware = passport.authenticate('google', { failureRedirect: '/auth/google' });

// Callback
export const oauthCallback = async (req, res) => {
  res.redirect('OAuthLogin://login?user=' + JSON.stringify(req.user));
};
