jest.setTimeout(30000); // set default time for each test is 10 seconds
require('dotenv').config();
const mongoose = require('mongoose');
const keys = require('../config/keys');

require('../models/User');

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI);
