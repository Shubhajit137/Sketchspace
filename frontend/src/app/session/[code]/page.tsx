"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CanvasWorkspace } from "@/components/canvas/CanvasWorkspace";

function SessionContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const code = (params.code as string)?.toUpperCase();
  const username = searchParams.get("username") ?? "Guest";

  return <CanvasWorkspace code={code} username={username} />;
}

export default function SessionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-canvas-bg text-muted">
          Loading session…
        </div>
      }
    >
      <SessionContent />
    </Suspense>
  );
}
