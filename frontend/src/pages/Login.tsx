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
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto my-12 px-5">
      <h1 className="text-2xl font-bold mb-6">Log In</h1>
      {error && <div className="error-text">{error}</div>}
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="email">
            Email:
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
            Password:
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
            <p className="text-red-600 text-sm mt-1">{fieldErrors.password}</p>
          )}
        </div>
        <Button type="submit" disabled={loading || !email || !password}>
          {loading ? "Logging in..." : "Log In"}
        </Button>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        New here? <Link to="/signup">Create an account</Link>
      </p>
    </div>
  );
}
