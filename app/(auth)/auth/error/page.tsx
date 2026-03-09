export default function AuthErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md rounded-lg border bg-card p-6 text-center">
        <h1 className="text-xl font-semibold">Authentication Error</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong during sign in. Please return to the login page and try again.
        </p>
      </div>
    </main>
  );
}
