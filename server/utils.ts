import { ZodError } from "zod";

export function zodErrorToString(error: ZodError): string {
  return error.issues.map(issue => {
    return `${issue.path.join('.')} - ${issue.message}`;
  }).join(', ');
}