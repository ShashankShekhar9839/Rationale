import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import * as decisionService from "../services/decisions";

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
  const [mode, setMode] = useState<"read" | "patch" | "new" | "history">("read");
  const [label, setLabel] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const latestVersion = decision?.latest_version || null;
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
        setError(
          err instanceof Error ? err.message : "Failed to load decision.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDecision();
  }, [numericDecisionId, token]);

  if (!token) return <Navigate to="/login" replace />;
  if (!numericDecisionId) return <Navigate to="/" replace />;

  function startPatch() {
    if (!latestVersion) return;
    setLabel(latestVersion.label);
    setContent(latestVersion.content);
    setSelectedVersion(latestVersion);
    setMode("patch");
  }

  function startNewVersion() {
    setLabel("");
    setContent(latestVersion?.content || "");
    setSelectedVersion(latestVersion);
    setMode("new");
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

  async function handlePatch(e: FormEvent) {
    e.preventDefault();
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

  async function handleNewVersion(e: FormEvent) {
    e.preventDefault();
    if (!token) return;

    setError("");
    setSaving(true);

    try {
      await decisionService.createDecisionVersion(
        numericDecisionId,
        { label: label.trim() || "Major update", content },
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load version.");
    }
  }

  const activeVersion = selectedVersion || latestVersion;

  return (
    <div className="space-y-6">
      <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <Link
          to={decision ? `/projects/${decision.project_id}/decisions` : "/"}
          className="text-sm font-semibold"
        >
          Back to decisions
        </Link>
        <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#147AD6]">
              Decision document
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              {decision?.title || "Decision"}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              {decision?.description || "No summary added yet."}
            </p>
          </div>
          <div className="rounded-lg bg-[#EAF5FF] px-5 py-4 text-[#147AD6]">
            <div className="text-3xl font-bold">
              v{activeVersion?.version_number || 0}
            </div>
            <div className="text-xs font-semibold">
              {isViewingLatest ? "Latest version" : "Historical version"}
            </div>
          </div>
        </div>
      </section>

      {error && <div className="error-text">{error}</div>}

      <section className="flex flex-wrap gap-3">
        <Button type="button" onClick={startPatch} disabled={!latestVersion}>
          Patch Latest
        </Button>
        <Button type="button" onClick={startNewVersion} disabled={!latestVersion}>
          Create New Version
        </Button>
        <Button type="button" onClick={() => setMode("history")}>
          History
        </Button>
      </section>

      {loading && (
        <div className="rounded border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
          Loading decision...
        </div>
      )}

      {!loading && !activeVersion && (
        <section className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <h2 className="text-lg font-bold text-slate-950">No version yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            Create a new version to start this decision document.
          </p>
          <Button type="button" className="mt-5" onClick={startNewVersion}>
            Create New Version
          </Button>
        </section>
      )}

      {mode === "read" && activeVersion && (
        <article className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#147AD6]">
                  Version {activeVersion.version_number}
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">
                  {activeVersion.label || "Untitled version"}
                </h2>
              </div>
              {!isViewingLatest && (
                <span className="rounded bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                  Read-only history
                </span>
              )}
            </div>
          </div>
          <div className="whitespace-pre-wrap p-6 text-sm leading-7 text-slate-800">
            {activeVersion.content || "No content added."}
          </div>
        </article>
      )}

      {(mode === "patch" || mode === "new") && (
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-semibold text-[#147AD6]">
              {mode === "patch" ? "Patch latest version" : "Create new version"}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              {mode === "patch"
                ? "Make a small correction"
                : "Capture a major change"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {mode === "patch"
                ? "Patch edits update only the latest version."
                : "A new version preserves the previous version in history."}
            </p>
          </div>
          <form onSubmit={mode === "patch" ? handlePatch : handleNewVersion}>
            <div className="form-group">
              <label htmlFor="version-label">Version label</label>
              <input
                id="version-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Why this version exists"
                maxLength={100}
              />
            </div>
            <div className="form-group">
              <label htmlFor="version-content">Document content</label>
              <textarea
                id="version-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[360px] font-mono text-sm leading-6"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={saving}>
                {saving
                  ? "Saving..."
                  : mode === "patch"
                    ? "Save Patch"
                    : "Create Version"}
              </Button>
              <Button type="button" onClick={() => setMode("read")}>
                Cancel
              </Button>
            </div>
          </form>
        </section>
      )}

      {mode === "history" && (
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <p className="text-sm font-semibold text-[#147AD6]">Version history</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              All versions
            </h2>
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
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-bold text-slate-950">
                      Version {version.version_number}:{" "}
                      {version.label || "Untitled version"}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {new Date(version.created_at).toLocaleString()}
                    </div>
                  </div>
                  <span className="rounded bg-[#EAF5FF] px-3 py-1 text-xs font-bold text-[#147AD6]">
                    View
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
