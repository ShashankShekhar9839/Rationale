import { FormEvent, useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Button from "../components/Button";
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
    async function loadDecisions() {
      if (!token || !numericProjectId) return;

      setError("");
      setLoading(true);

      try {
        const [projectData, decisionList] = await Promise.all([
          projectService.getProject(numericProjectId, token),
          decisionService.getDecisionsByProject(numericProjectId, token),
        ]);

        setProject(projectData);
        setDecisions(decisionList);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load decisions for this project.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDecisions();
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
    <div className="space-y-8">
      <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <Link
          to={project ? `/workspaces/${project.workspace_id}/projects` : "/"}
          className="text-sm font-semibold"
        >
          Back to projects
        </Link>
        <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#147AD6]">
              Project decisions
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              {project?.name || "Project"}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Capture decision documents, patch the latest version, or create a
              new version when the reasoning changes materially.
            </p>
          </div>
          <div className="rounded-lg bg-[#EAF5FF] px-5 py-4 text-[#147AD6]">
            <div className="text-3xl font-bold">{decisions.length}</div>
            <div className="text-xs font-semibold">Decisions</div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() => setActivePanel("decisions")}
          className={`rounded-lg border bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#339CFF] hover:shadow-lg ${
            activePanel === "decisions" ? "border-[#339CFF]" : "border-slate-200"
          }`}
        >
          <div className="mb-5 grid h-12 w-12 place-items-center rounded bg-slate-950 text-sm font-bold text-white">
            DOC
          </div>
          <h2 className="text-xl font-bold text-slate-950">Show decisions</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Open decision documents and review their current state.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setActivePanel("create")}
          className={`rounded-lg border bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#339CFF] hover:shadow-lg ${
            activePanel === "create" ? "border-[#339CFF]" : "border-slate-200"
          }`}
        >
          <div className="mb-5 grid h-12 w-12 place-items-center rounded bg-[#339CFF] text-xl font-bold text-white">
            +
          </div>
          <h2 className="text-xl font-bold text-slate-950">Create decision</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Draft a new decision document with its first version.
          </p>
        </button>
      </section>

      {error && <div className="error-text">{error}</div>}

      {activePanel === "create" && (
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
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
              <textarea
                id="decision-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Context, options considered, decision, consequences..."
                className="min-h-[240px] font-mono text-sm leading-6"
              />
            </div>
            <Button type="submit" disabled={saving || !title.trim()}>
              {saving ? "Creating..." : "Create Decision"}
            </Button>
          </form>
        </section>
      )}

      {activePanel === "decisions" && (
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#147AD6]">Documents</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">
                All decisions
              </h2>
            </div>
            <Button type="button" onClick={() => setActivePanel("create")}>
              + New Decision
            </Button>
          </div>
          <div className="p-4">
            {loading && (
              <div className="rounded border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
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
              <div className="grid gap-3">
                {decisions.map((decision) => (
                  <Link
                    key={decision.id}
                    to={`/decisions/${decision.id}`}
                    className="rounded-lg border border-slate-200 p-5 transition hover:border-[#339CFF] hover:shadow-md"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-950">
                          {decision.title}
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {decision.description || "No summary added yet."}
                        </p>
                      </div>
                      <span className="rounded bg-[#EAF5FF] px-3 py-1 text-xs font-bold text-[#147AD6]">
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
