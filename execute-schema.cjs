const fs = require('fs');
const https = require('https');

const PAT = process.env.SUPABASE_PAT;
const PROJECT_REF = 'enjygxjnoyadnwwqbzwo';

if (!PAT) {
  console.error('ERROR: Set SUPABASE_PAT environment variable first');
  console.error('Example: $env:SUPABASE_PAT = "sbp_xxxxx"');
  process.exit(1);
}

const sql = fs.readFileSync('lib/db/migrations/0001_init_schema.sql', 'utf8');

const body = JSON.stringify({ query: sql });

const options = {
  hostname: 'api.supabase.com',
  path: `/v1/projects/${PROJECT_REF}/database/query`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${PAT}`,
    'Content-Length': Buffer.byteLength(body)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
    } catch {
      console.log(data);
    }
    process.exit(res.statusCode < 300 ? 0 : 1);
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
  process.exit(1);
});

req.write(body);
req.end();
