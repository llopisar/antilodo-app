import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/forms/login-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-md space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Access your role-specific operations workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <LoginForm callbackUrl={params.callbackUrl} />
            <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Demo credentials</p>
              <p>Use any seeded user email with password: <span className="font-medium text-foreground">DemoPass123!</span></p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Secure session cookies</Badge>
              <Badge variant="secondary">Role-based route protection</Badge>
            </div>
          </CardContent>
        </Card>
        <p className="text-center text-xs text-muted-foreground">
          Back to <Link className="underline" href="/">landing page</Link>
        </p>
      </div>
    </main>
  );
}
