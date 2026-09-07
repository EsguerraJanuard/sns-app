require('dotenv').config({ path: '.env.local' });
const { createTransaction } = require('./.next/server/app/api/seed/route.js'); // Cannot easily import TS server action in plain node script

