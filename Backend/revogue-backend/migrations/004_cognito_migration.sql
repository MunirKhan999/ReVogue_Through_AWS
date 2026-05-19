-- migrations/004_cognito_migration.sql

-- Make password nullable (existing users' hashes become irrelevant)
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

-- Cognito uses its own UUID for sub — your existing UUIDs will be replaced
-- for new users. Existing users will need to re-register via Cognito.
ALTER TABLE users ALTER COLUMN password SET DEFAULT '';
