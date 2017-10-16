import mongoose, {Schema} from 'mongoose';

//define model schema
export const schema = new Schema({
  oauth_id: {
    type: String,
    unique: true,
    index: true,
  },
  name: String,
  avatar: String,
});

// Export Mongoose model
export default mongoose.model('User', schema);
