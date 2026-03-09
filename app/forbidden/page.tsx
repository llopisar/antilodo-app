import Link from "next/link";

const primaryLinkClass =
  "mt-6 inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-lg rounded-lg border bg-card p-8 text-center">
        <h1 className="text-2xl font-semibold">Access Forbidden</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Your role does not have access to this route. Contact a manager if you need additional permissions.
        </p>
        <Link href="/dashboard" className={primaryLinkClass}>
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
