"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function normalizeCallbackUrl(callbackUrl?: string) {
  if (!callbackUrl) {
    return "/dashboard";
  }

  return callbackUrl.startsWith("/") ? callbackUrl : "/dashboard";
}

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const safeCallbackUrl = normalizeCallbackUrl(callbackUrl);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: safeCallbackUrl,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid credentials.");
      return;
    }

    router.push(result?.url ?? safeCallbackUrl);
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button className="w-full" disabled={loading} type="submit">
        {loading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
