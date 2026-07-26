const mongoose = require('mongoose');

const featuredActivitiesSchema = new mongoose.Schema({
  
  activities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity'
  }]
}, { timestamps: true });

const FeaturedActivities = mongoose.model('FeaturedActivities', featuredActivitiesSchema);
module.exports = FeaturedActivities;