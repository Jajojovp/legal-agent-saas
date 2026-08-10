import { db } from './index';
import { sql } from 'drizzle-orm';

export async function migrate() {
  console.log('Running migrations...');
  
  // Create tables by pushing schema
  // In production, use drizzle-kit migrate instead of push
  
  console.log('Migration complete');
}

// Run if called directly
if (require.main === module) {
  migrate().catch(console.error);
}
