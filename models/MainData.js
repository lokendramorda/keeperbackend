const mongoose = require('mongoose');

const mainDataSchema = new mongoose.Schema({
  userEmail: { type: String, required: true }, 
  simpleQuizData: { type: mongoose.Schema.Types.Mixed },
  categorizeData: { type: mongoose.Schema.Types.Mixed },
  clozeData: { type: mongoose.Schema.Types.Mixed },
  comprehensionData: { type: mongoose.Schema.Types.Mixed },
});

const MainData = mongoose.model('MainData', mainDataSchema);

module.exports = MainData;
