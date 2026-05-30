CREATE TABLE decisions (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP(3) WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP(3) WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP(3) WITH TIME ZONE,

    title TEXT NOT NULL,
    description TEXT,

    project_id BIGINT NOT NULL,

    CONSTRAINT fk_decisions_project
        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON DELETE CASCADE
);