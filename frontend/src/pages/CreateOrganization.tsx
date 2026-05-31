import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as orgService from "../services/organizations";
import {
  validateOrganizationName,
  validateOrganizationDescription,
} from "../utils/validation";
import Button from "../components/Button";

export default function CreateOrganization() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

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
      case "description":
        setDescription(value);
        break;
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    // Validate organization name
    const nameError = validateOrganizationName(name);
    if (nameError) {
      setFieldErrors({ [nameError.field]: nameError.message });
      setLoading(false);
      return;
    }

    // Validate description if provided
    const descriptionError = validateOrganizationDescription(description);
    if (descriptionError) {
      setFieldErrors({ [descriptionError.field]: descriptionError.message });
      setLoading(false);
      return;
    }

    try {
      await orgService.createOrganization(
        {
          name,
          description,
        },
        token,
      );
      // After creating org, redirect to dashboard
      navigate("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create organization",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto my-12 px-5">
      <h1 className="text-2xl font-bold mb-6">Create Organization</h1>
      {error && <div className="error-text">{error}</div>}
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="name">
            Organization Name:
            <span className="text-red-600"> *</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => handleFieldChange("name", e.target.value)}
            placeholder="My Awesome Organization"
            maxLength={100}
          />
          {fieldErrors.organizationName && (
            <p className="text-red-600 text-sm mt-1">
              {fieldErrors.organizationName}
            </p>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="description">Description (optional):</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => handleFieldChange("description", e.target.value)}
            placeholder="Describe your organization..."
            maxLength={500}
            className="min-h-[100px]"
          />
          <p className="text-gray-500 text-xs mt-1">{description.length}/500</p>
          {fieldErrors.description && (
            <p className="text-red-600 text-sm mt-1">
              {fieldErrors.description}
            </p>
          )}
        </div>
        <Button type="submit" disabled={loading || !name.trim()}>
          {loading ? "Creating..." : "Create Organization"}
        </Button>
      </form>
    </div>
  );
}
