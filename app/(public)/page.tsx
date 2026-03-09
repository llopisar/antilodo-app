import Link from "next/link";

import { LandingSection, InfoCard } from "@/components/marketing/landing-section";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const featureItems = [
  { title: "Role-Based Access", description: "Operational routes and views are gated by user hierarchy." },
  { title: "Orders and Services", description: "Track kitchen and floor execution in one structured workflow." },
  { title: "Schedules and Shifts", description: "Manage shift coverage, handoffs, and staffing visibility." },
  { title: "Internal Tasks", description: "Assign action items with ownership and deadline tracking." },
  { title: "Alerts and Incidents", description: "Capture operational incidents and monitor their resolution." },
  { title: "Activity Trail", description: "Maintain historical records of important actions across modules." },
];

const roleItems = [
  { title: "Head Chef", description: "Leads kitchen execution, service readiness, and shift control." },
  { title: "Sous Chef", description: "Supports station flow, task completion, and handoff continuity." },
  { title: "Floor Manager", description: "Coordinates dining service flow, staffing, and floor incidents." },
  { title: "Manager", description: "Supervises operational health, escalations, and reporting outcomes." },
  { title: "General Manager", description: "Maintains executive oversight of performance, trends, and risk." },
];

const operationItems = [
  { title: "Plan", description: "Build schedules and service context before each shift." },
  { title: "Execute", description: "Run orders, tasks, and floor activity with real-time status." },
  { title: "Monitor", description: "Track alerts, bottlenecks, and SLA-sensitive incidents." },
  { title: "Review", description: "Analyze activity history, outcomes, and operational KPIs." },
];

const benefits = [
  "Consistent operational visibility across kitchen, floor, and management.",
  "Clear accountability through roles, ownership, and audit-ready history.",
  "Scalable module foundation ready for deeper business workflows.",
];

const primaryLinkClass =
  "inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90";

const secondaryLinkClass =
  "inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-10 md:py-14">
        <header className="space-y-6 rounded-xl border bg-card p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline">Public Home</Badge>
            <Badge variant="secondary">English UI</Badge>
            <Badge variant="secondary">Role-Secured Platform</Badge>
          </div>
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Antilodo Operations</p>
              <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">Restaurant Operations, Structured and Controlled</h1>
              <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
                A production-oriented operational workspace for kitchen, floor, and management teams with secure access and role-specific dashboards.
              </p>
            </div>
            <div className="flex flex-col gap-2 md:w-44">
              <Link href="/login" className={primaryLinkClass}>
                Log In
              </Link>
              <Link href="#features" className={secondaryLinkClass}>
                View Sections
              </Link>
            </div>
          </div>
        </header>

        <LandingSection
          title="Feature Overview"
          description="Core platform capabilities available in the operational modules."
          className="scroll-mt-20"
        >
          <div id="features" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featureItems.map((item) => (
              <InfoCard key={item.title} title={item.title} description={item.description} />
            ))}
          </div>
        </LandingSection>

        <LandingSection title="Role Overview" description="Each role receives the proper scope for daily execution or oversight.">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {roleItems.map((item) => (
              <InfoCard key={item.title} title={item.title} description={item.description} />
            ))}
          </div>
        </LandingSection>

        <LandingSection title="Operations Overview" description="How the platform supports day-to-day operational flow.">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {operationItems.map((item) => (
              <InfoCard key={item.title} title={item.title} description={item.description} />
            ))}
          </div>
        </LandingSection>

        <LandingSection title="Benefits" description="Practical outcomes for operational teams and leadership.">
          <div className="rounded-xl border bg-card p-5">
            <ul className="space-y-3 text-sm text-muted-foreground">
              {benefits.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </LandingSection>

        <section className="rounded-xl border bg-card p-6 text-center">
          <h2 className="text-xl font-semibold tracking-tight">Ready to access operations?</h2>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to continue to your role-specific dashboard.</p>
          <Link href="/login" className={`${primaryLinkClass} mt-4`}>
            Go to Login
          </Link>
        </section>

        <footer className="space-y-4 pb-2">
          <Separator />
          <div className="flex flex-col gap-2 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
            <p>Antilodo Operations Platform</p>
            <p>Public landing page remains accessible without authentication.</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
