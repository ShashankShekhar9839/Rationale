CREATE TABLE projects (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP(3) WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP(3) WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP(3) WITH TIME ZONE,

    name TEXT NOT NULL,
    description TEXT,

    workspace_id BIGINT NOT NULL,

    CONSTRAINT fk_projects_workspace
        FOREIGN KEY (workspace_id)
        REFERENCES workspaces(id)
        ON DELETE CASCADE
);