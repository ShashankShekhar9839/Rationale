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
    <div className="min-h-screen bg-[#F6F8FB] text-slate-950 md:grid md:grid-cols-[292px_1fr]">
      <aside className="border-b border-slate-200 bg-[#FBFCFE] md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r">
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-200 px-5 py-4">
            <Link to="/" className="flex items-center gap-3 text-slate-950">
              <div className="grid h-9 w-9 place-items-center rounded bg-[#339CFF] text-base font-bold text-white shadow-sm">
                R
              </div>
              <div>
                <div className="font-bold leading-tight">Rationale</div>
                <div className="max-w-[190px] truncate text-xs text-slate-500">
                  {organization?.name || "Decision workspace"}
                </div>
              </div>
            </Link>
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `mb-4 block rounded px-3 py-2 text-sm font-semibold ${
                  isActive
                    ? "bg-[#EAF5FF] text-[#147AD6]"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`
              }
            >
              All workspaces
            </NavLink>

            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
              Workspaces
            </div>

            <div className="space-y-1">
              {workspaces.length === 0 && (
                <div className="rounded bg-slate-50 px-3 py-2 text-xs text-slate-500">
                  No workspaces yet
                </div>
              )}

              {workspaces.map((workspace) => {
                const isWorkspaceActive = activeWorkspaceId === workspace.id;

                return (
                  <div key={workspace.id}>
                    <NavLink
                      to={`/workspaces/${workspace.id}/projects`}
                      className={`block rounded px-3 py-2 text-sm font-semibold ${
                        isWorkspaceActive
                          ? "bg-white text-[#147AD6] shadow-sm ring-1 ring-slate-200"
                          : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                      }`}
                    >
                      <span className="block truncate">{workspace.name}</span>
                    </NavLink>

                    {isWorkspaceActive && (
                      <div className="ml-3 mt-1 border-l border-slate-200 pl-3">
                        <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                          Projects
                        </div>
                        {activeProjects.length === 0 && (
                          <div className="px-2 py-1 text-xs text-slate-500">
                            No projects
                          </div>
                        )}
                        {activeProjects.map((project) => {
                          const isProjectActive = activeProjectId === project.id;

                          return (
                            <div key={project.id}>
                              <NavLink
                                to={`/projects/${project.id}/decisions`}
                                className={`block rounded px-2 py-1.5 text-sm ${
                                  isProjectActive
                                    ? "bg-white font-semibold text-slate-950 shadow-sm ring-1 ring-slate-200"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                                }`}
                              >
                                <span className="block truncate">
                                  {project.name}
                                </span>
                              </NavLink>

                              {isProjectActive && (
                                <div className="ml-3 mt-1 border-l border-slate-200 pl-3">
                                  <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                    Decisions
                                  </div>
                                  {activeDecisions.length === 0 && (
                                    <div className="px-2 py-1 text-xs text-slate-500">
                                      No decisions
                                    </div>
                                  )}
                                  {activeDecisions.map((decision) => (
                                    <NavLink
                                      key={decision.id}
                                      to={`/decisions/${decision.id}`}
                                      className={({ isActive }) =>
                                        `block rounded px-2 py-1.5 text-xs ${
                                          isActive ||
                                          routeIds.decisionId === decision.id
                                            ? "bg-[#EAF5FF] font-semibold text-[#147AD6]"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                                        }`
                                      }
                                    >
                                      <span className="block truncate">
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

          <div className="hidden border-t border-slate-200 bg-white/60 p-4 md:block">
            <div className="mb-3 truncate text-sm font-semibold text-slate-800">
              {user?.name || user?.email || "User"}
            </div>
            <button
              type="button"
              onClick={logout}
              className="text-sm font-semibold text-slate-500 hover:text-slate-950"
            >
              Log out
            </button>
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
