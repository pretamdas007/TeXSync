-- Create initial database if not exists
SELECT 'CREATE DATABASE texsync'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'texsync');

-- Connect to texsync database
\c texsync;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
