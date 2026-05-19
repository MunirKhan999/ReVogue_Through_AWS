-- Cognito sub is the user primary key; drop separate cognito_sub column
ALTER TABLE users DROP COLUMN IF EXISTS cognito_sub;
ALTER TABLE users ALTER COLUMN id DROP DEFAULT;
