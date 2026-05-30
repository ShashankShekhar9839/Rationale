CREATE TABLE decision_versions (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP(3) WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP(3) WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP(3) WITH TIME ZONE,

    version_number BIGINT NOT NULL,
    content TEXT,

    decision_id BIGINT NOT NULL,

    CONSTRAINT fk_decision_versions_decision
        FOREIGN KEY (decision_id)
        REFERENCES decisions(id)
        ON DELETE CASCADE
);