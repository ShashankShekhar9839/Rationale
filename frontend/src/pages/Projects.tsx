import { FormEvent, useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import * as projectService from "../services/projects";
import * as workspaceService from "../services/workspaces";

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
    async function loadProjects() {
      if (!token || !numericWorkspaceId) return;

      setError("");
      setLoading(true);

      try {
        const [workspaceData, projectList] = await Promise.all([
          workspaceService.getWorkspace(numericWorkspaceId, token),
          projectService.getProjectsByWorkspace(numericWorkspaceId, token),
        ]);

        setWorkspace(workspaceData);
        setProjects(projectList);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load projects for this workspace.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
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
    <div className="space-y-8">
      <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <Link to="/" className="text-sm font-semibold">
          Back to workspaces
        </Link>
        <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#147AD6]">
              Workspace projects
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              {workspace?.name || "Workspace"}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              {workspace?.description ||
                "Manage all projects connected to this workspace."}
            </p>
          </div>
          <div className="rounded-lg bg-[#EAF5FF] px-5 py-4 text-[#147AD6]">
            <div className="text-3xl font-bold">{projects.length}</div>
            <div className="text-xs font-semibold">Projects</div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() => setActivePanel("projects")}
          className={`rounded-lg border bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#339CFF] hover:shadow-lg ${
            activePanel === "projects" ? "border-[#339CFF]" : "border-slate-200"
          }`}
        >
          <div className="mb-5 grid h-12 w-12 place-items-center rounded bg-slate-950 text-sm font-bold text-white">
            ALL
          </div>
          <h2 className="text-xl font-bold text-slate-950">Show all projects</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            View every project inside this workspace.
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
          <h2 className="text-xl font-bold text-slate-950">Create project</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Add a project and start grouping its decisions.
          </p>
        </button>
      </section>

      {error && <div className="error-text">{error}</div>}

      {activePanel === "create" && (
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
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
            <div>
              <Button type="submit" disabled={saving || !projectName.trim()}>
                {saving ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </form>
        </section>
      )}

      {activePanel === "projects" && (
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#147AD6]">
                Workspace projects
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">
                All projects
              </h2>
            </div>
            <Button type="button" onClick={() => setActivePanel("create")}>
              + New Project
            </Button>
          </div>

          <div className="p-4">
            {loading && (
              <div className="rounded border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
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
              <div className="grid gap-3">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}/decisions`}
                    className="rounded-lg border border-slate-200 p-5 transition hover:border-[#339CFF] hover:shadow-md"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-950">
                          {project.name}
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {project.description || "No description added yet."}
                        </p>
                      </div>
                      <span className="rounded bg-[#EAF5FF] px-3 py-1 text-xs font-bold text-[#147AD6]">
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
