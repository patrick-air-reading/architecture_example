import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { z } from "zod";
import { ApiRequestError } from "../api/client.js";

export interface FieldConfig<K extends string> {
  name: K;
  label: string;
  type?: "text" | "email" | "select";
  options?: { value: string | number; label: string }[];
  placeholder?: string;
}

type Values<K extends string> = Record<K, string>;
type Errors = Record<string, string[] | undefined>;

/**
 * A small schema-driven form. Values are validated client-side with the same
 * zod schema the API uses (from @edu/common), and server-side field errors are
 * shown next to their inputs too.
 */
export function EntityForm<S extends z.ZodType<object>, K extends string>({
  schema,
  fields,
  initialValues,
  onSubmit,
  submitLabel,
  cancelTo,
}: {
  schema: S;
  fields: FieldConfig<K>[];
  initialValues: Values<K>;
  onSubmit: (input: z.output<S>) => Promise<unknown>;
  submitLabel: string;
  cancelTo: string;
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(undefined);

    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      setErrors(z.flattenError(parsed.error).fieldErrors as Errors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await onSubmit(parsed.data);
    } catch (err) {
      if (err instanceof ApiRequestError && err.details) setErrors(err.details);
      setFormError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      {formError && (
        <p className="alert" role="alert">
          {formError}
        </p>
      )}
      {fields.map((field) => {
        const id = `field-${field.name}`;
        const fieldErrors = errors[field.name];
        const common = {
          id,
          name: field.name,
          value: values[field.name],
          "aria-invalid": fieldErrors ? true : undefined,
          "aria-describedby": fieldErrors ? `${id}-error` : undefined,
          onChange: (e: { target: { value: string } }) =>
            setValues((v) => ({ ...v, [field.name]: e.target.value })),
        };
        return (
          <div className="field" key={field.name}>
            <label htmlFor={id}>{field.label}</label>
            {field.type === "select" ? (
              <select {...common}>
                <option value="">Select…</option>
                {field.options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : (
              <input {...common} type={field.type ?? "text"} placeholder={field.placeholder} />
            )}
            {fieldErrors && (
              <span className="field-error" id={`${id}-error`}>
                {fieldErrors.join(", ")}
              </span>
            )}
          </div>
        );
      })}
      <div className="form-actions">
        <button type="submit" className="button primary" disabled={submitting}>
          {submitting ? "Saving…" : submitLabel}
        </button>
        <Link to={cancelTo} className="button">
          Cancel
        </Link>
      </div>
    </form>
  );
}
