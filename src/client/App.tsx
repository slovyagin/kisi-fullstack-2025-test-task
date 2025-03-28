import {ErrorBoundary} from "react-error-boundary";
import {Suspense} from "react";
import {Header} from "./Header.tsx";
import {Sidebar} from "./Sidebar.tsx";
import {Heatmap} from "./Heatmap.tsx";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header/>
      <div className="flex-1 flex flex-row">
        <Sidebar/>
        <main className="px-10 flex-1 text-xs py-20 not-print:overflow-x-auto">
          <ErrorBoundary FallbackComponent={HeatmapErrorFallback}>
            <div className="m-auto w-fit grid gap-8">
              <Suspense fallback={<div className="text-base">Loading heatmap...</div>}>
                <Heatmap/>
              </Suspense>
            </div>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

function HeatmapErrorFallback({error}: { error: Error }) {
  return <div className="text-red-500">
    <p className="text-lg">Error loading heatmap</p>
    <p>
      {error.message ?? "Unknown error"}
    </p>
  </div>;
}


export default App;
