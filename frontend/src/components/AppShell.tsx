import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as decisionService from "../services/decisions";
import * as orgService from "../services/organizations";
import * as projectService from "../services/projects";
import * as workspaceService from "../services/workspaces";

type Props = {
  children: React.ReactNode;
};

export default function AppShell({ children }: Props) {
  const { token, user, logout } = useAuth();
  const location = useLocation();
  const organization = orgService.getCurrentOrganization();
  const [workspaceSearch, setWorkspaceSearch] = useState("");
  const [collapsedWorkspaceIds, setCollapsedWorkspaceIds] = useState<number[]>(
    [],
  );
  const [collapsedProjectIds, setCollapsedProjectIds] = useState<number[]>([]);
  const [workspaces, setWorkspaces] = useState<workspaceService.Workspace[]>([]);
  const [activeProjects, setActiveProjects] = useState<projectService.Project[]>(
    [],
  );
  const [activeDecisions, setActiveDecisions] = useState<
    decisionService.Decision[]
  >([]);
  const [activeProject, setActiveProject] =
    useState<projectService.Project | null>(null);

  const routeIds = useMemo(() => {
    const workspaceMatch = location.pathname.match(
      /\/workspaces\/(\d+)\/projects/,
    );
    const projectMatch = location.pathname.match(/\/projects\/(\d+)\/decisions/);
    const decisionMatch = location.pathname.match(/\/decisions\/(\d+)/);

    return {
      workspaceId: workspaceMatch ? Number(workspaceMatch[1]) : null,
      projectId: projectMatch ? Number(projectMatch[1]) : null,
      decisionId: decisionMatch ? Number(decisionMatch[1]) : null,
    };
  }, [location.pathname]);

  const activeWorkspaceId = activeProject?.workspace_id || routeIds.workspaceId;
  const activeProjectId = activeProject?.id || routeIds.projectId;
  const isWorkspaceCollapsed = (workspaceId: number) =>
    collapsedWorkspaceIds.includes(workspaceId);
  const isProjectCollapsed = (projectId: number) =>
    collapsedProjectIds.includes(projectId);

  function toggleWorkspace(workspaceId: number) {
    setCollapsedWorkspaceIds((current) =>
      current.includes(workspaceId)
        ? current.filter((id) => id !== workspaceId)
        : [...current, workspaceId],
    );
  }

  function toggleProject(projectId: number) {
    setCollapsedProjectIds((current) =>
      current.includes(projectId)
        ? current.filter((id) => id !== projectId)
        : [...current, projectId],
    );
  }

  const filteredWorkspaces = useMemo(() => {
    const query = workspaceSearch.trim().toLowerCase();
    if (!query) return workspaces;

    return workspaces.filter((workspace) =>
      workspace.name.toLowerCase().includes(query),
    );
  }, [workspaceSearch, workspaces]);

  useEffect(() => {
    async function loadWorkspaces() {
      if (!token) return;

      try {
        setWorkspaces(await workspaceService.getWorkspaces(token));
      } catch {
        setWorkspaces([]);
      }
    }

    loadWorkspaces();
  }, [token]);

  useEffect(() => {
    async function loadActiveProject() {
      if (!token || (!routeIds.projectId && !routeIds.decisionId)) {
        setActiveProject(null);
        return;
      }

      try {
        if (routeIds.projectId) {
          setActiveProject(
            await projectService.getProject(routeIds.projectId, token),
          );
          return;
        }

        if (routeIds.decisionId) {
          const decision = await decisionService.getDecisionById(
            routeIds.decisionId,
            token,
          );
          setActiveProject(
            await projectService.getProject(decision.project_id, token),
          );
        }
      } catch {
        setActiveProject(null);
      }
    }

    loadActiveProject();
  }, [routeIds.decisionId, routeIds.projectId, token]);

  useEffect(() => {
    async function loadProjects() {
      if (!token || !activeWorkspaceId) {
        setActiveProjects([]);
        return;
      }

      try {
        setActiveProjects(
          await projectService.getProjectsByWorkspace(activeWorkspaceId, token),
        );
      } catch {
        setActiveProjects([]);
      }
    }

    loadProjects();
  }, [activeWorkspaceId, token]);

  useEffect(() => {
    async function loadDecisions() {
      if (!token || !activeProjectId) {
        setActiveDecisions([]);
        return;
      }

      try {
        setActiveDecisions(
          await decisionService.getDecisionsByProject(activeProjectId, token),
        );
      } catch {
        setActiveDecisions([]);
      }
    }

    loadDecisions();
  }, [activeProjectId, token]);

  return (
    <div className="min-h-screen bg-[#F6F8FB] text-slate-950 md:grid md:grid-cols-[316px_1fr]">
      <aside className="border-b border-slate-200 bg-[#F9FBFD] md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r">
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-200 bg-white px-5 py-4">
            <Link to="/" className="flex items-center gap-3 text-slate-950">
              <div className="grid h-10 w-10 place-items-center rounded bg-[#339CFF] text-base font-bold text-white shadow-sm shadow-[#339CFF]/25">
                R
              </div>
              <div className="min-w-0">
                <div className="font-bold leading-tight">Rationale</div>
                <div className="truncate text-xs text-slate-500">
                  {organization?.name || "Decision workspace"}
                </div>
              </div>
            </Link>
          </div>

          <div className="border-b border-slate-200 bg-white/70 p-3">
            <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-slate-950">
                    {organization?.name || "Organization"}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {workspaces.length} workspaces
                  </div>
                </div>
                <Link
                  to="/"
                  className="rounded bg-[#EAF5FF] px-2.5 py-1 text-xs font-bold text-[#147AD6]"
                >
                  Open
                </Link>
              </div>
            </div>
            <input
              value={workspaceSearch}
              onChange={(e) => setWorkspaceSearch(e.target.value)}
              placeholder="Search workspaces"
              className="mt-3 h-9 rounded border-slate-200 bg-[#F6F8FB] px-3 py-2 text-sm shadow-none"
            />
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `mb-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
                  isActive
                    ? "bg-white text-[#147AD6] shadow-sm ring-1 ring-slate-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`
              }
            >
              <span className="grid h-6 w-6 place-items-center rounded bg-slate-100 text-[10px] text-slate-500">
                W
              </span>
              <span>All workspaces</span>
            </NavLink>

            <div className="flex items-center justify-between px-3 pb-2">
              <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                Workspaces
              </div>
              <div className="text-[11px] font-semibold text-slate-400">
                {filteredWorkspaces.length}
              </div>
            </div>

            <div className="space-y-2">
              {filteredWorkspaces.length === 0 && (
                <div className="rounded bg-slate-50 px-3 py-2 text-xs text-slate-500">
                  {workspaces.length === 0
                    ? "No workspaces yet"
                    : "No matching workspaces"}
                </div>
              )}

              {filteredWorkspaces.map((workspace) => {
                const isWorkspaceActive = activeWorkspaceId === workspace.id;
                const workspaceIsOpen =
                  isWorkspaceActive && !isWorkspaceCollapsed(workspace.id);

                return (
                  <div
                    key={workspace.id}
                    className={`rounded-xl ${
                      isWorkspaceActive
                        ? "bg-white p-1 shadow-sm ring-1 ring-slate-200"
                        : ""
                    }`}
                  >
                    <NavLink
                      to={`/workspaces/${workspace.id}/projects`}
                      onClick={(event) => {
                        if (isWorkspaceActive) {
                          event.preventDefault();
                          toggleWorkspace(workspace.id);
                        } else {
                          setCollapsedWorkspaceIds((current) =>
                            current.filter((id) => id !== workspace.id),
                          );
                        }
                      }}
                      className={`group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
                        isWorkspaceActive
                          ? "bg-[#F7FBFF] text-[#147AD6]"
                          : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                      }`}
                    >
                      {isWorkspaceActive && (
                        <span className="absolute bottom-2 left-0 top-2 w-1 rounded-r bg-[#339CFF]" />
                      )}
                      <span
                        className={`ml-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[10px] font-bold ${
                          isWorkspaceActive
                            ? "bg-[#339CFF] text-white"
                            : "bg-white text-slate-500 ring-1 ring-slate-200"
                        }`}
                      >
                        {workspace.name.slice(0, 1).toUpperCase()}
                      </span>
                      <span className="block min-w-0 flex-1 truncate">
                        {workspace.name}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] ${
                          isWorkspaceActive
                            ? "bg-white text-[#147AD6]"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {workspaceIsOpen ? "-" : "+"}
                      </span>
                    </NavLink>

                    {workspaceIsOpen && (
                      <div className="mt-2 rounded-lg bg-[#F6F8FB] p-2">
                        <div className="mb-1 flex items-center justify-between px-2">
                          <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                            Projects
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400">
                            {activeProjects.length}
                          </span>
                        </div>
                        {activeProjects.length === 0 && (
                          <div className="rounded bg-slate-50 px-2 py-2 text-xs text-slate-500">
                            No projects
                          </div>
                        )}
                        {activeProjects.map((project) => {
                          const isProjectActive = activeProjectId === project.id;
                          const projectIsOpen =
                            isProjectActive && !isProjectCollapsed(project.id);

                          return (
                            <div key={project.id}>
                              <NavLink
                                to={`/projects/${project.id}/decisions`}
                                onClick={(event) => {
                                  if (isProjectActive) {
                                    event.preventDefault();
                                    toggleProject(project.id);
                                  } else {
                                    setCollapsedProjectIds((current) =>
                                      current.filter((id) => id !== project.id),
                                    );
                                  }
                                }}
                                className={`group flex items-center gap-2 rounded-lg px-2 py-2 text-sm ${
                                  isProjectActive
                                    ? "bg-white font-semibold text-slate-950 shadow-sm"
                                    : "text-slate-600 hover:bg-white hover:text-slate-950"
                                }`}
                              >
                                <span
                                  className={`grid h-5 w-5 shrink-0 place-items-center rounded text-[9px] font-bold ${
                                    isProjectActive
                                      ? "bg-[#EAF5FF] text-[#147AD6]"
                                      : "bg-white text-slate-400 ring-1 ring-slate-200"
                                  }`}
                                >
                                  P
                                </span>
                                <span className="block min-w-0 flex-1 truncate">
                                  {project.name}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {projectIsOpen ? "-" : "+"}
                                </span>
                              </NavLink>

                              {projectIsOpen && (
                                <div className="ml-2 mt-1 rounded-lg border border-slate-200 bg-white p-1.5">
                                  <div className="mb-1 flex items-center justify-between px-2">
                                    <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                      Decisions
                                    </span>
                                    <span className="text-[11px] font-semibold text-slate-400">
                                      {activeDecisions.length}
                                    </span>
                                  </div>
                                  {activeDecisions.length === 0 && (
                                    <div className="px-2 py-1.5 text-xs text-slate-500">
                                      No decisions
                                    </div>
                                  )}
                                  {activeDecisions.map((decision) => (
                                    <NavLink
                                      key={decision.id}
                                      to={`/decisions/${decision.id}`}
                                      className={({ isActive }) =>
                                        `flex items-center gap-2 rounded-md px-2 py-1.5 text-xs ${
                                          isActive ||
                                          routeIds.decisionId === decision.id
                                            ? "bg-[#EAF5FF] font-semibold text-[#147AD6]"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                                        }`
                                      }
                                    >
                                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-60" />
                                      <span className="block min-w-0 flex-1 truncate">
                                        {decision.title}
                                      </span>
                                    </NavLink>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>

          <div className="hidden border-t border-slate-200 bg-white/80 p-4 md:block">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded bg-slate-100 text-xs font-bold text-slate-600">
                {(user?.name || user?.email || "U").slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-slate-800">
                  {user?.name || user?.email || "User"}
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-950"
                >
                  Log out
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-w-0">
        <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
