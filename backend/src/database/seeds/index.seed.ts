import { AppDataSource } from '../../../data-source';
import { seedAdmin } from './admin.seed';
import { seedCinema } from './cinema.seed';
import { seedStats } from './stats.seed';

async function runSeeds() {

  console.log('🌱 Starting seeds...');

  try {
    // Initialize connection
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    // Run seeds in order
    await seedCinema(AppDataSource);   // cinema first
    await seedAdmin(AppDataSource);    // then admin
    await seedStats(AppDataSource);    // then data for dashboard/rapports

    console.log('🎉 All seeds completed successfully');

  } catch (error) {
    console.error('❌ Seed error :', error);
  } finally {
    await AppDataSource.destroy();
  }
}

runSeeds();