import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as authService from "../services/auth";
import { validateSignupForm } from "../utils/validation";
import Button from "../components/Button";

export default function Signup() {
  const navigate = useNavigate();
  const { login, completeFirstSignup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function handleFieldChange(field: string, value: string) {
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
    setError("");

    switch (field) {
      case "name":
        setName(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "password":
        setPassword(value);
        break;
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    // Validate form
    const validationError = validateSignupForm(name, email, password);
    if (validationError) {
      setFieldErrors({ [validationError.field]: validationError.message });
      setLoading(false);
      return;
    }

    try {
      const response = await authService.register({
        email,
        password,
        name,
      });
      login(response.token, response.user);
      completeFirstSignup();
      navigate("/organization", { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.",
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
            Decision workspace
          </p>
          <h1 className="max-w-md text-4xl font-bold leading-tight md:text-5xl">
            Start with a clear organization.
          </h1>
          <p className="mt-5 max-w-sm text-base leading-7 text-white/85">
            Keep teams, projects, and the reasoning behind each decision in one focused place.
          </p>
        </div>

        <div className="rounded-lg border border-white/25 bg-white/12 p-5 shadow-2xl backdrop-blur">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-white/80">Workspace preview</span>
            <span className="rounded bg-white px-2.5 py-1 text-xs font-bold text-[#147AD6]">
              New
            </span>
          </div>
          <div className="space-y-3">
            <div className="rounded bg-white p-4 text-slate-900">
              <div className="mb-2 h-2 w-24 rounded bg-[#339CFF]" />
              <div className="h-2 w-full rounded bg-slate-200" />
              <div className="mt-2 h-2 w-2/3 rounded bg-slate-200" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded bg-white/18 p-3">
                <div className="text-2xl font-bold">01</div>
                <div className="text-xs text-white/75">Org</div>
              </div>
              <div className="rounded bg-white/18 p-3">
                <div className="text-2xl font-bold">03</div>
                <div className="text-xs text-white/75">Projects</div>
              </div>
              <div className="rounded bg-white/18 p-3">
                <div className="text-2xl font-bold">12</div>
                <div className="text-xs text-white/75">Decisions</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex items-center p-6 md:p-10">
        <div className="w-full">
          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold text-[#147AD6]">Create account</p>
            <h2 className="text-3xl font-bold text-slate-950">Welcome to Rationale</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Sign up first, then create your organization to enter the main workspace.
            </p>
          </div>

          {error && <div className="error-text">{error}</div>}
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="name">
                Name
                <span className="text-red-600"> *</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                placeholder="John Doe"
                maxLength={50}
              />
              {fieldErrors.name && (
                <p className="text-red-600 text-sm mt-1">{fieldErrors.name}</p>
              )}
            </div>
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
                placeholder="Min. 8 chars, uppercase, lowercase, and number"
              />
              {fieldErrors.password && (
                <p className="text-red-600 text-sm mt-1">{fieldErrors.password}</p>
              )}
            </div>
            <Button
              type="submit"
              className="mt-2 w-full py-3"
              disabled={loading || !name || !email || !password}
            >
              {loading ? "Signing up..." : "Sign Up"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
