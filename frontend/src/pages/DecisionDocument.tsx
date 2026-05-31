import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Button from "../components/Button";
import DocumentEditor from "../components/DocumentEditor";
import DocumentRenderer from "../components/DocumentRenderer";
import { useAuth } from "../context/AuthContext";
import * as decisionService from "../services/decisions";
import {
  formatAuditDate,
  formatAuditUser,
  formatCreatedBy,
  formatUpdatedBy,
} from "../utils/audit";

export default function DecisionDocument() {
  const { token } = useAuth();
  const { decisionId } = useParams();
  const numericDecisionId = Number(decisionId);
  const [decision, setDecision] =
    useState<decisionService.DecisionDetails | null>(null);
  const [selectedVersion, setSelectedVersion] =
    useState<decisionService.DecisionVersion | null>(null);
  const [history, setHistory] = useState<decisionService.DecisionVersionHistory[]>(
    [],
  );
  const [mode, setMode] = useState<"read" | "edit">("read");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const latestVersion = decision?.latest_version || null;
  const activeVersion = selectedVersion || latestVersion;
  const isViewingLatest = useMemo(() => {
    if (!selectedVersion || !latestVersion) return false;
    return selectedVersion.id === latestVersion.id;
  }, [latestVersion, selectedVersion]);

  useEffect(() => {
    async function loadDecision() {
      if (!token || !numericDecisionId) return;

      setError("");
      setLoading(true);

      try {
        const [decisionData, versionHistory] = await Promise.all([
          decisionService.getDecisionById(numericDecisionId, token),
          decisionService.getDecisionVersionHistory(numericDecisionId, token),
        ]);

        setDecision(decisionData);
        setSelectedVersion(decisionData.latest_version);
        setHistory(versionHistory);
        setLabel(decisionData.latest_version?.label || "");
        setContent(decisionData.latest_version?.content || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load decision.");
      } finally {
        setLoading(false);
      }
    }

    loadDecision();
  }, [numericDecisionId, token]);

  if (!token) return <Navigate to="/login" replace />;
  if (!numericDecisionId) return <Navigate to="/" replace />;

  function startEdit() {
    if (!latestVersion) return;
    setLabel(latestVersion.label);
    setContent(latestVersion.content);
    setSelectedVersion(latestVersion);
    setMode("edit");
  }

  async function reloadDecision() {
    if (!token) return;
    const [decisionData, versionHistory] = await Promise.all([
      decisionService.getDecisionById(numericDecisionId, token),
      decisionService.getDecisionVersionHistory(numericDecisionId, token),
    ]);
    setDecision(decisionData);
    setSelectedVersion(decisionData.latest_version);
    setHistory(versionHistory);
  }

  async function handlePatch(event?: { preventDefault: () => void }) {
    event?.preventDefault();
    if (!token || !latestVersion) return;

    setError("");
    setSaving(true);

    try {
      await decisionService.patchDecisionVersion(
        latestVersion.id,
        { label: label.trim(), content },
        token,
      );
      await reloadDecision();
      setMode("read");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to patch version.");
    } finally {
      setSaving(false);
    }
  }

  async function handleNewVersion(event?: { preventDefault: () => void }) {
    event?.preventDefault();
    if (!token) return;

    setError("");
    setSaving(true);

    try {
      await decisionService.createDecisionVersion(
        numericDecisionId,
        { label: label.trim() || latestVersion?.label || "Major update", content },
        token,
      );
      await reloadDecision();
      setMode("read");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create new version.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function viewVersion(versionId: number) {
    if (!token) return;

    setError("");

    try {
      const version = await decisionService.getDecisionVersion(versionId, token);
      setSelectedVersion(version);
      setMode("read");
      setHistoryOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load version.");
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="sticky top-0 z-20 -mx-4 border-b border-slate-200 bg-[#F6F8FB]/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              to={decision ? `/projects/${decision.project_id}/decisions` : "/"}
              className="text-xs font-semibold"
            >
              Back to decisions
            </Link>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>Decision document</span>
              <span>/</span>
              <span>
                {activeVersion ? `Version ${activeVersion.version_number}` : "No version"}
              </span>
              {activeVersion && !isViewingLatest && (
                <span className="rounded bg-amber-50 px-2 py-0.5 font-bold text-amber-700">
                  Read-only history
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setHistoryOpen(true)}
              className="action-button"
            >
              History
            </button>
          </div>
        </div>
      </div>

      {error && <div className="error-text mt-6">{error}</div>}

      <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-8 py-7">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#147AD6]">
            {mode === "read"
              ? isViewingLatest
                ? "Latest decision"
                : "Historical decision"
              : "Editing latest version"}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-normal text-slate-950 md:text-4xl">
            {decision?.title || "Decision"}
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            {decision?.description || "No summary added yet."}
          </p>
          {decision && (
            <p className="mt-4 text-xs font-medium text-slate-500">
              {formatCreatedBy(decision)} · {formatUpdatedBy(decision)}
            </p>
          )}
        </div>

        {loading && (
          <div className="p-8 text-sm text-slate-600">Loading decision...</div>
        )}

        {!loading && !activeVersion && (
          <div className="p-10 text-center">
            <h2 className="text-lg font-bold text-slate-950">No version yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              Create a new version to start this decision document.
            </p>
            <button
              type="button"
              className="action-button mt-5"
              onClick={() => setHistoryOpen(true)}
            >
              Open History
            </button>
          </div>
        )}

        {mode === "read" && activeVersion && (
          <article className="px-8 py-8">
            <div className="mb-8 flex flex-col gap-2 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-500">
                  Version {activeVersion.version_number}
                </div>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">
                  {activeVersion.label || "Untitled version"}
                </h2>
                <p className="mt-2 text-xs font-medium text-slate-500">
                  {formatCreatedBy(activeVersion)} · {formatUpdatedBy(activeVersion)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-fit rounded bg-[#EAF5FF] px-3 py-1 text-xs font-bold text-[#147AD6]">
                  {isViewingLatest ? "Latest version" : "Read-only history"}
                </span>
                {isViewingLatest && (
                  <button
                    type="button"
                    onClick={startEdit}
                    className="action-button-primary"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
            <div className="mx-auto max-w-3xl">
              <DocumentRenderer content={activeVersion.content} />
            </div>
          </article>
        )}

        {mode === "edit" && (
          <form
            onSubmit={(event) => event.preventDefault()}
            className="p-6"
          >
            <div className="mb-5 grid gap-4 md:grid-cols-[280px_1fr]">
              <div>
                <label htmlFor="version-label">Version label</label>
                <input
                  id="version-label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Why this change exists"
                  maxLength={100}
                />
              </div>
              <div className="rounded bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                You are editing the latest version. Save small corrections into
                the current version, or preserve this as a major change by
                saving it as a new version.
              </div>
            </div>

            <DocumentEditor value={content} onChange={setContent} />

            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setMode("read")}
                className="action-button"
              >
                Cancel
              </button>
              <button
                type="button"
                className="action-button"
                disabled={saving}
                onClick={handlePatch}
              >
                {saving ? "Saving..." : "Edit Current Version"}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleNewVersion}
                className="action-button-primary"
              >
                {saving ? "Saving..." : "Save as New Version"}
              </button>
            </div>
          </form>
        )}
      </section>

      {historyOpen && (
        <div className="fixed inset-0 z-40">
          <button
            type="button"
            aria-label="Close history"
            className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px]"
            onClick={() => setHistoryOpen(false)}
          />
          <aside className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 border-b border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#147AD6]">
                    Version history
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950">
                    All versions
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setHistoryOpen(false)}
                  className="rounded border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="grid gap-3 p-4">
              {history.length === 0 && (
                <div className="rounded bg-slate-50 p-5 text-sm text-slate-600">
                  No versions found.
                </div>
              )}
              {history.map((version) => (
                <button
                  key={version.id}
                  type="button"
                  onClick={() => viewVersion(version.id)}
                  className="rounded-lg border border-slate-200 p-4 text-left transition hover:border-[#339CFF] hover:shadow-md"
                >
                  <div className="font-bold text-slate-950">
                    Version {version.version_number}
                  </div>
                  <div className="mt-1 text-sm text-slate-700">
                    {version.label || "Untitled version"}
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    Created by {formatAuditUser(version.created_by)} ·{" "}
                    {formatAuditDate(version.created_at)}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Edited by {formatAuditUser(version.updated_by)} ·{" "}
                    {formatAuditDate(version.updated_at)}
                  </div>
                </button>
              ))}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
