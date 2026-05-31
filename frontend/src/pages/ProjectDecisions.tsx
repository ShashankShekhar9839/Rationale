import { FormEvent, useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Button from "../components/Button";
import DocumentEditor from "../components/DocumentEditor";
import { useAuth } from "../context/AuthContext";
import * as decisionService from "../services/decisions";
import * as projectService from "../services/projects";

export default function ProjectDecisions() {
  const { token } = useAuth();
  const { projectId } = useParams();
  const numericProjectId = Number(projectId);
  const [project, setProject] = useState<projectService.Project | null>(null);
  const [decisions, setDecisions] = useState<decisionService.Decision[]>([]);
  const [activePanel, setActivePanel] = useState<"decisions" | "create">(
    "decisions",
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [label, setLabel] = useState("Initial version");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDecisions() {
      if (!token || !numericProjectId) return;

      setError("");
      setLoading(true);
      setProject(null);
      setDecisions([]);

      try {
        const [projectData, decisionList] = await Promise.all([
          projectService.getProject(numericProjectId, token),
          decisionService.getDecisionsByProject(numericProjectId, token),
        ]);

        if (cancelled) return;
        setProject(projectData);
        setDecisions(
          decisionList.filter(
            (decision) => decision.project_id === numericProjectId,
          ),
        );
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load decisions for this project.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDecisions();

    return () => {
      cancelled = true;
    };
  }, [numericProjectId, token]);

  if (!token) return <Navigate to="/login" replace />;
  if (!numericProjectId) return <Navigate to="/" replace />;

  async function handleCreateDecision(e: FormEvent) {
    e.preventDefault();

    if (!token || !title.trim()) {
      setError("Decision title is required.");
      return;
    }

    setError("");
    setSaving(true);

    try {
      const decision = await decisionService.createDecision(
        {
          title: title.trim(),
          description: description.trim(),
          project_id: numericProjectId,
        },
        token,
      );

      await decisionService.createDecisionVersion(
        decision.id,
        {
          label: label.trim() || "Initial version",
          content: content.trim(),
        },
        token,
      );

      setDecisions((current) => [decision, ...current]);
      setTitle("");
      setDescription("");
      setLabel("Initial version");
      setContent("");
      setActivePanel("decisions");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create decision.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-shell">
      <section className="page-header">
        <Link
          to={project ? `/workspaces/${project.workspace_id}/projects` : "/"}
          className="text-sm font-semibold"
        >
          Back to projects
        </Link>
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="eyebrow">Project decisions</p>
            <h1 className="page-title">
              {project?.name || "Project"}
            </h1>
            <p className="page-copy">
              Capture decision documents, patch the latest version, or create a
              new version when the reasoning changes materially.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="soft-badge">{decisions.length} decisions</span>
          </div>
        </div>
      </section>

      {error && <div className="error-text">{error}</div>}

      {activePanel === "create" && (
        <section className="panel p-6">
          <div className="mb-6">
            <p className="text-sm font-semibold text-[#147AD6]">New decision</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              Write the first version
            </h2>
          </div>
          <form onSubmit={handleCreateDecision} className="grid gap-4">
            <div className="form-group">
              <label htmlFor="decision-title">Decision title</label>
              <input
                id="decision-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Choose the billing provider"
                maxLength={120}
              />
            </div>
            <div className="form-group">
              <label htmlFor="decision-description">Summary</label>
              <input
                id="decision-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short context for this decision"
                maxLength={200}
              />
            </div>
            <div className="form-group">
              <label htmlFor="decision-label">Version label</label>
              <input
                id="decision-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                maxLength={80}
              />
            </div>
            <div className="form-group">
              <label htmlFor="decision-content">Document content</label>
              <DocumentEditor value={content} onChange={setContent} />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setActivePanel("decisions")}
              >
                Cancel
              </button>
              <Button type="submit" disabled={saving || !title.trim()}>
                {saving ? "Creating..." : "Create Decision"}
              </Button>
            </div>
          </form>
        </section>
      )}

      {activePanel === "decisions" && (
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Documents</p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">
                All decisions
              </h2>
            </div>
            <Button type="button" onClick={() => setActivePanel("create")}>
              New Decision
            </Button>
          </div>
          <div>
            {loading && (
              <div className="m-4 rounded border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                Loading decisions...
              </div>
            )}
            {!loading && decisions.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <h3 className="text-lg font-bold text-slate-950">
                  No decisions yet
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                  Create the first decision document for this project.
                </p>
                <Button
                  type="button"
                  className="mt-5"
                  onClick={() => setActivePanel("create")}
                >
                  Create Decision
                </Button>
              </div>
            )}
            {!loading && decisions.length > 0 && (
              <div className="entity-list">
                {decisions.map((decision) => (
                  <Link
                    key={decision.id}
                    to={`/decisions/${decision.id}`}
                    className="entity-row"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="entity-title">
                          {decision.title}
                        </h3>
                        <p className="entity-copy">
                          {decision.description || "No summary added yet."}
                        </p>
                      </div>
                      <span className="soft-badge">
                        Decision
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
