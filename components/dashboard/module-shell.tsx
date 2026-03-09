import { SectionPanel } from "@/components/dashboard/metric-card";
import { Badge } from "@/components/ui/badge";

type ModuleShellProps = {
  title: string;
  description: string;
  highlights: Array<{ label: string; value: string }>;
};

export function ModuleShell({ title, description, highlights }: ModuleShellProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <SectionPanel title="Scaffold ready" description="This module shell is ready for feature implementation.">
        <div className="flex flex-wrap gap-2">
          {highlights.map((item) => (
            <Badge key={item.label} variant="secondary">
              {item.label}: {item.value}
            </Badge>
          ))}
        </div>
      </SectionPanel>
    </div>
  );
}
