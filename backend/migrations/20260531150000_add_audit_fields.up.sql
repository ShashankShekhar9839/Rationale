ALTER TABLE workspaces
ADD COLUMN created_by_id INTEGER REFERENCES users(id),
ADD COLUMN updated_by_id INTEGER REFERENCES users(id);

UPDATE workspaces
SET created_by_id = organizations.owner_id,
    updated_by_id = organizations.owner_id
FROM organizations
WHERE workspaces.organization_id = organizations.id;

ALTER TABLE projects
ADD COLUMN created_by_id INTEGER REFERENCES users(id),
ADD COLUMN updated_by_id INTEGER REFERENCES users(id);

UPDATE projects
SET created_by_id = organizations.owner_id,
    updated_by_id = organizations.owner_id
FROM workspaces
JOIN organizations ON organizations.id = workspaces.organization_id
WHERE projects.workspace_id = workspaces.id;

ALTER TABLE decisions
ADD COLUMN created_by_id INTEGER REFERENCES users(id),
ADD COLUMN updated_by_id INTEGER REFERENCES users(id);

UPDATE decisions
SET created_by_id = organizations.owner_id,
    updated_by_id = organizations.owner_id
FROM projects
JOIN workspaces ON workspaces.id = projects.workspace_id
JOIN organizations ON organizations.id = workspaces.organization_id
WHERE decisions.project_id = projects.id;

ALTER TABLE decision_versions
ADD COLUMN created_by_id INTEGER REFERENCES users(id),
ADD COLUMN updated_by_id INTEGER REFERENCES users(id);

UPDATE decision_versions
SET created_by_id = decisions.created_by_id,
    updated_by_id = decisions.updated_by_id
FROM decisions
WHERE decision_versions.decision_id = decisions.id;
