import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import * as orgService from "../services/organizations";
import * as workspaceService from "../services/workspaces";

export default function Home() {
  const { token, user } = useAuth();
  const [activePanel, setActivePanel] = useState<"create" | "workspaces">(
    "workspaces",
  );
  const [organizations, setOrganizations] = useState<orgService.Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] =
    useState<orgService.Organization | null>(() =>
      orgService.getCurrentOrganization(),
    );
  const [workspaces, setWorkspaces] = useState<workspaceService.Workspace[]>([]);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedOrganization = useMemo(() => {
    if (currentOrganization) return currentOrganization;

    if (user?.id) {
      return organizations.find((organization) => organization.ownerId === user.id);
    }

    return organizations[0];
  }, [currentOrganization, organizations, user?.id]);

  useEffect(() => {
    async function loadHomeData() {
      if (!token) return;

      setError("");
      setLoading(true);

      try {
        const [orgs, workspaceList] = await Promise.all([
          orgService.getOrganizations(token),
          workspaceService.getWorkspaces(token),
        ]);

        const organizationList = Array.isArray(orgs) ? orgs : [];
        setOrganizations(organizationList);
        setWorkspaces(Array.isArray(workspaceList) ? workspaceList : []);

        const savedOrganization = orgService.getCurrentOrganization();
        const matchingSavedOrganization = savedOrganization
          ? organizationList.find(
              (organization) => organization.id === savedOrganization.id,
            )
          : undefined;
        const userOwnedOrganization = user?.id
          ? organizationList.find(
              (organization) => organization.ownerId === user.id,
            )
          : undefined;
        const nextCurrentOrganization =
          matchingSavedOrganization || userOwnedOrganization || organizationList[0] || null;

        setCurrentOrganization(nextCurrentOrganization);
        if (nextCurrentOrganization) {
          orgService.saveCurrentOrganization(nextCurrentOrganization);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load your workspace dashboard.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, [token, user?.id]);

  async function handleCreateWorkspace(e: FormEvent) {
    e.preventDefault();

    if (!token || !selectedOrganization) return;
    if (!workspaceName.trim()) {
      setError("Workspace name is required.");
      return;
    }

    setError("");
    setSaving(true);

    try {
      const workspace = await workspaceService.createWorkspace(
        {
          name: workspaceName.trim(),
          description: workspaceDescription.trim(),
          organization_id: selectedOrganization.id,
        },
        token,
      );

      setWorkspaces((current) => [workspace, ...current]);
      setWorkspaceName("");
      setWorkspaceDescription("");
      setActivePanel("workspaces");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create workspace.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-lg bg-slate-950 text-white shadow-xl">
        <div className="grid gap-6 p-7 md:grid-cols-[1fr_260px] md:p-8">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#8CCAFF]">
              Home
            </p>
            <h1 className="text-3xl font-bold leading-tight md:text-4xl">
              Welcome{user?.name ? `, ${user.name}` : ""}.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Create focused workspaces for teams, projects, and decisions that
              need clear reasoning from start to finish.
            </p>
          </div>

          <div className="grid gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
            <div>
              <div className="text-3xl font-bold text-[#8CCAFF]">
                {workspaces.length}
              </div>
              <div className="text-xs text-slate-300">Workspaces</div>
            </div>
            <div className="border-t border-white/10 pt-3">
              <div className="truncate text-sm font-bold text-white">
                {selectedOrganization?.name || "No organization selected"}
              </div>
              <div className="text-xs text-slate-300">Active organization</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() => setActivePanel("create")}
          className={`group rounded-lg border bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#339CFF] hover:shadow-lg ${
            activePanel === "create" ? "border-[#339CFF]" : "border-slate-200"
          }`}
        >
          <div className="mb-5 grid h-12 w-12 place-items-center rounded bg-[#339CFF] text-xl font-bold text-white">
            +
          </div>
          <h2 className="text-xl font-bold text-slate-950">Create workspace</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Start a new space for a product area, team, client, or initiative.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setActivePanel("workspaces")}
          className={`group rounded-lg border bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#339CFF] hover:shadow-lg ${
            activePanel === "workspaces" ? "border-[#339CFF]" : "border-slate-200"
          }`}
        >
          <div className="mb-5 grid h-12 w-12 place-items-center rounded bg-slate-950 text-sm font-bold text-white">
            ALL
          </div>
          <h2 className="text-xl font-bold text-slate-950">Show all workspaces</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Browse every workspace connected to your organization.
          </p>
        </button>
      </section>

      {error && <div className="error-text">{error}</div>}

      {activePanel === "create" && (
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-semibold text-[#147AD6]">
              New workspace
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              Give this workspace a clear name
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {selectedOrganization
                ? `It will be created inside ${selectedOrganization.name}.`
                : "Create an organization first to add workspaces."}
            </p>
          </div>

          <form onSubmit={handleCreateWorkspace} className="grid gap-4">
            <div className="form-group">
              <label htmlFor="workspace-name">Workspace name</label>
              <input
                id="workspace-name"
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="Product strategy"
                maxLength={80}
              />
            </div>
            <div className="form-group">
              <label htmlFor="workspace-description">Description</label>
              <textarea
                id="workspace-description"
                value={workspaceDescription}
                onChange={(e) => setWorkspaceDescription(e.target.value)}
                placeholder="What decisions or projects belong here?"
                maxLength={300}
                className="min-h-[110px]"
              />
            </div>
            <div>
              <Button
                type="submit"
                disabled={saving || !selectedOrganization || !workspaceName.trim()}
              >
                {saving ? "Creating..." : "Create Workspace"}
              </Button>
            </div>
          </form>
        </section>
      )}

      {activePanel === "workspaces" && (
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#147AD6]">
                Your workspaces
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">
                All workspaces
              </h2>
            </div>
            <Button type="button" onClick={() => setActivePanel("create")}>
              + New Workspace
            </Button>
          </div>

          <div className="p-4">
            {loading && (
              <div className="rounded border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                Loading workspaces...
              </div>
            )}

            {!loading && workspaces.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <h3 className="text-lg font-bold text-slate-950">
                  No workspaces yet
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                  Create your first workspace to group projects and decisions in
                  a cleaner way.
                </p>
                <Button
                  type="button"
                  className="mt-5"
                  onClick={() => setActivePanel("create")}
                >
                  Create Workspace
                </Button>
              </div>
            )}

            {!loading && workspaces.length > 0 && (
              <div className="grid gap-3">
                {workspaces.map((workspace) => (
                  <Link
                    key={workspace.id}
                    to={`/workspaces/${workspace.id}/projects`}
                    className="rounded-lg border border-slate-200 p-5 transition hover:border-[#339CFF] hover:shadow-md"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-950">
                          {workspace.name}
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {workspace.description || "No description added yet."}
                        </p>
                      </div>
                      <span className="rounded bg-[#EAF5FF] px-3 py-1 text-xs font-bold text-[#147AD6]">
                        Workspace
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
