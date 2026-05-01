const { Insight, User } = require('../backend/models');

async function check() {
  try {
    const count = await Insight.count();
    console.log('Total insights:', count);
    
    const sample = await Insight.findAll({ limit: 5, include: [User] });
    console.log('Sample insights:', JSON.stringify(sample, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

check();
