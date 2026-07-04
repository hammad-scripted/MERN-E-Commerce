import { config } from 'dotenv';
import Redis from 'ioredis';

config();

const client = new Redis(process.env.REDIS_URL);

client.on('connect', () => {
  console.log('✅ Connected');
});

client.on('ready', () => {
  console.log('✅ Ready');
});

client.on('error', (err) => {
  console.log('Redis Error:', err.message);
});

export default client;
