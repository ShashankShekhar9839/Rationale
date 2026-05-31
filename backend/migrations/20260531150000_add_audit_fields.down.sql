ALTER TABLE decision_versions
DROP COLUMN IF EXISTS updated_by_id,
DROP COLUMN IF EXISTS created_by_id;

ALTER TABLE decisions
DROP COLUMN IF EXISTS updated_by_id,
DROP COLUMN IF EXISTS created_by_id;

ALTER TABLE projects
DROP COLUMN IF EXISTS updated_by_id,
DROP COLUMN IF EXISTS created_by_id;

ALTER TABLE workspaces
DROP COLUMN IF EXISTS updated_by_id,
DROP COLUMN IF EXISTS created_by_id;
