import { FormEvent, useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import * as projectService from "../services/projects";
import * as workspaceService from "../services/workspaces";
import { formatCreatedBy, formatUpdatedBy } from "../utils/audit";

export default function Projects() {
  const { token } = useAuth();
  const { workspaceId } = useParams();
  const numericWorkspaceId = Number(workspaceId);
  const [workspace, setWorkspace] = useState<workspaceService.Workspace | null>(
    null,
  );
  const [projects, setProjects] = useState<projectService.Project[]>([]);
  const [activePanel, setActivePanel] = useState<"projects" | "create">(
    "projects",
  );
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProjects() {
      if (!token || !numericWorkspaceId) return;

      setError("");
      setLoading(true);
      setWorkspace(null);
      setProjects([]);

      try {
        const [workspaceData, projectList] = await Promise.all([
          workspaceService.getWorkspace(numericWorkspaceId, token),
          projectService.getProjectsByWorkspace(numericWorkspaceId, token),
        ]);

        if (cancelled) return;
        setWorkspace(workspaceData);
        setProjects(
          projectList.filter(
            (project) => project.workspace_id === numericWorkspaceId,
          ),
        );
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load projects for this workspace.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProjects();

    return () => {
      cancelled = true;
    };
  }, [numericWorkspaceId, token]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!numericWorkspaceId) {
    return <Navigate to="/" replace />;
  }

  async function handleCreateProject(e: FormEvent) {
    e.preventDefault();

    if (!token || !projectName.trim()) {
      setError("Project name is required.");
      return;
    }

    setError("");
    setSaving(true);

    try {
      const project = await projectService.createProject(
        {
          name: projectName.trim(),
          description: projectDescription.trim(),
          workspace_id: numericWorkspaceId,
        },
        token,
      );

      setProjects((current) => [project, ...current]);
      setProjectName("");
      setProjectDescription("");
      setActivePanel("projects");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-shell">
      <section className="page-header">
        <Link to="/" className="text-sm font-semibold">
          Back to workspaces
        </Link>
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="eyebrow">Workspace projects</p>
            <h1 className="page-title">
              {workspace?.name || "Workspace"}
            </h1>
            <p className="page-copy">
              {workspace?.description ||
                "Manage all projects connected to this workspace."}
            </p>
            {workspace && (
              <p className="mt-3 text-xs font-medium text-slate-500">
                {formatCreatedBy(workspace)} · {formatUpdatedBy(workspace)}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="soft-badge">{projects.length} projects</span>
          </div>
        </div>
      </section>

      {error && <div className="error-text">{error}</div>}

      {activePanel === "create" && (
        <section className="panel p-6">
          <div className="mb-6">
            <p className="text-sm font-semibold text-[#147AD6]">New project</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              Create a project in this workspace
            </h2>
          </div>

          <form onSubmit={handleCreateProject} className="grid gap-4">
            <div className="form-group">
              <label htmlFor="project-name">Project name</label>
              <input
                id="project-name"
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Q3 product roadmap"
                maxLength={100}
              />
            </div>
            <div className="form-group">
              <label htmlFor="project-description">Description</label>
              <textarea
                id="project-description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="What decisions and work belong to this project?"
                maxLength={300}
                className="min-h-[110px]"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setActivePanel("projects")}
              >
                Cancel
              </button>
              <Button type="submit" disabled={saving || !projectName.trim()}>
                {saving ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </form>
        </section>
      )}

      {activePanel === "projects" && (
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Workspace projects</p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">
                All projects
              </h2>
            </div>
            <Button type="button" onClick={() => setActivePanel("create")}>
              New Project
            </Button>
          </div>

          <div>
            {loading && (
              <div className="m-4 rounded border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                Loading projects...
              </div>
            )}

            {!loading && projects.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <h3 className="text-lg font-bold text-slate-950">
                  No projects yet
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                  Create the first project for this workspace.
                </p>
                <Button
                  type="button"
                  className="mt-5"
                  onClick={() => setActivePanel("create")}
                >
                  Create Project
                </Button>
              </div>
            )}

            {!loading && projects.length > 0 && (
              <div className="entity-list">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}/decisions`}
                    className="entity-row"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="entity-title">
                          {project.name}
                        </h3>
                        <p className="entity-copy">
                          {project.description || "No description added yet."}
                        </p>
                        <p className="mt-3 text-xs font-medium text-slate-500">
                          {formatCreatedBy(project)} · {formatUpdatedBy(project)}
                        </p>
                      </div>
                      <span className="soft-badge">
                        Project
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
