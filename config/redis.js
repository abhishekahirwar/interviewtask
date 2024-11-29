const Redis = require('ioredis');

const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
});

redis.on('connect', () => {
    console.log('Successfully connected to Redis');
});

redis.on('error', (error) => {
    console.error('Redis connection error:', error);
});

module.exports = redis;
