import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import * as authService from "../services/auth";
import { validateEmail } from "../utils/validation";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function handleFieldChange(field: string, value: string) {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
    setError("");

    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const emailError = validateEmail(email);
    if (emailError) {
      setFieldErrors({ [emailError.field]: emailError.message });
      return;
    }

    if (!password) {
      setFieldErrors({ password: "Password is required" });
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login({ email, password });
      login(response.token, response.user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto my-8 grid max-w-5xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl md:grid-cols-[1fr_0.95fr]">
      <section className="relative flex min-h-[560px] flex-col justify-between bg-[#339CFF] p-8 text-white md:p-10">
        <div>
          <div className="mb-10 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded bg-white text-lg font-bold text-[#147AD6]">
              R
            </div>
            <span className="text-lg font-bold">Rationale</span>
          </div>

          <p className="mb-3 text-sm font-semibold uppercase text-white/75">
            Welcome back
          </p>
          <h1 className="max-w-md text-4xl font-bold leading-tight md:text-5xl">
            Continue building clearer decisions.
          </h1>
          <p className="mt-5 max-w-sm text-base leading-7 text-white/85">
            Return to your workspaces, project decisions, and version history in one focused place.
          </p>
        </div>

        <div className="rounded-lg border border-white/25 bg-white/12 p-5 shadow-2xl backdrop-blur">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-white/80">
              Workspace activity
            </span>
            <span className="rounded bg-white px-2.5 py-1 text-xs font-bold text-[#147AD6]">
              Live
            </span>
          </div>
          <div className="space-y-3">
            <div className="rounded bg-white p-4 text-slate-900">
              <div className="mb-3 flex items-center justify-between">
                <div className="h-2 w-28 rounded bg-[#339CFF]" />
                <div className="rounded bg-[#EAF5FF] px-2 py-1 text-[10px] font-bold text-[#147AD6]">
                  v3
                </div>
              </div>
              <div className="h-2 w-full rounded bg-slate-200" />
              <div className="mt-2 h-2 w-3/4 rounded bg-slate-200" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded bg-white/18 p-3">
                <div className="text-2xl font-bold">08</div>
                <div className="text-xs text-white/75">Projects</div>
              </div>
              <div className="rounded bg-white/18 p-3">
                <div className="text-2xl font-bold">26</div>
                <div className="text-xs text-white/75">Decisions</div>
              </div>
              <div className="rounded bg-white/18 p-3">
                <div className="text-2xl font-bold">41</div>
                <div className="text-xs text-white/75">Versions</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex items-center p-6 md:p-10">
        <div className="w-full">
          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold text-[#147AD6]">
              Log in
            </p>
            <h2 className="text-3xl font-bold text-slate-950">
              Welcome back to Rationale
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Sign in to continue working on your organization, projects, and decision documents.
            </p>
          </div>

          {error && <div className="error-text">{error}</div>}
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="email">
                Email
                <span className="text-red-600"> *</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                placeholder="you@example.com"
              />
              {fieldErrors.email && (
                <p className="text-red-600 text-sm mt-1">{fieldErrors.email}</p>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="password">
                Password
                <span className="text-red-600"> *</span>
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => handleFieldChange("password", e.target.value)}
                placeholder="Enter your password"
              />
              {fieldErrors.password && (
                <p className="text-red-600 text-sm mt-1">
                  {fieldErrors.password}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="mt-2 w-full py-3"
              disabled={loading || !email || !password}
            >
              {loading ? "Logging in..." : "Log In"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            New here? <Link to="/signup">Create an account</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
