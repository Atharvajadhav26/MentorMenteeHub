const cron = require('node-cron');
const prisma = require('../config/prisma');

const startCronJobs = () => {
  // Run daily at midnight to check mentorship period
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('[CRON] Checking expired mentorships...');
      const now = new Date();
      
      const unassignedMentees = await prisma.mentee.updateMany({
        where: {
          endDate: {
            lt: now
          },
          mentorId: {
            not: null
          }
        },
        data: {
          mentorId: null
        }
      });
      console.log(`[CRON] Unassigned ${unassignedMentees.count} mentees whose mentorship period ended.`);
    } catch (error) {
      console.error('[CRON] Error checking expired mentorships:', error);
    }
  });
};

module.exports = startCronJobs;
