import { Skeleton } from "@/components/ui/Skeleton";

export default function AIAssistantLoading() {
  return (
    <div className="h-[calc(100vh-100px)] max-w-5xl mx-auto flex flex-col rounded-3xl border border-[hsl(var(--app-border))] bg-[hsl(var(--app-surface))] overflow-hidden p-6 space-y-4 animate-pulse">
      <Skeleton className="h-12 w-full rounded-2xl" />
      <div className="flex-1 space-y-4">
        <Skeleton className="h-16 w-3/4 rounded-2xl" />
        <Skeleton className="h-16 w-2/3 ml-auto rounded-2xl" />
        <Skeleton className="h-20 w-4/5 rounded-2xl" />
      </div>
      <Skeleton className="h-14 w-full rounded-2xl" />
    </div>
  );
}
