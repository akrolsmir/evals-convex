import {
  Authenticated,
  Unauthenticated,
  useQuery,
  useAction,
} from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { SignInButton } from "./SignInButton";
import { Toaster } from "sonner";
import { ProjectList } from "./components/ProjectList";
import { ProjectDetail } from "./components/ProjectDetail";
import { useState, useEffect } from "react";
import { Id } from "../convex/_generated/dataModel";

export default function App() {
  const [selectedProjectId, setSelectedProjectId] =
    useState<Id<"projects"> | null>(null);
  const syncProjects = useAction(api.projects.syncProjects);
  const projects = useQuery(api.projects.list, { limit: 100 });

  // Sync projects on app load
  useEffect(() => {
    if (projects?.length === 0) {
      syncProjects();
    }
  }, [projects, syncProjects]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Project Evaluator
            </h1>
            <p className="text-sm text-gray-500">
              Evaluate and score grant proposals
            </p>
          </div>
          <Authenticated>
            <SignOutButton />
          </Authenticated>
          <Unauthenticated>
            <SignInButton />
          </Unauthenticated>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Project List */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-medium text-gray-900">Projects</h2>
              <p className="text-xs text-gray-500 mt-1">
                {projects?.length || 0} projects available
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ProjectList
                projects={projects || []}
                selectedProjectId={selectedProjectId}
                onSelectProject={setSelectedProjectId}
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex">
            {selectedProjectId ? (
              <ProjectDetail projectId={selectedProjectId} />
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a project to evaluate
                  </h3>
                  <p className="text-gray-500 max-w-sm">
                    Choose a project from the list to view its details and
                    provide your evaluation scores.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  );
}
