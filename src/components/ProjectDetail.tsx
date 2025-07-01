import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { EvaluationPanel } from "./EvaluationPanel";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface ProjectDetailProps {
  projectId: Id<"projects">;
}

export function ProjectDetail({ projectId }: ProjectDetailProps) {
  const project = useQuery(api.projects.getById, { id: projectId });

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStageColor = (stage: string) => {
    switch (stage.toLowerCase()) {
      case "active":
      case "funding":
        return "bg-green-100 text-green-700";
      case "completed":
      case "funded":
        return "bg-blue-100 text-blue-700";
      case "draft":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const manifundUrl = `https://manifund.org/projects/${project.slug}`;

  return (
    <div className="flex-1 flex">
      {/* Project Content */}
      <div className="flex-1 bg-white overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
              {project.title}
            </h1>

            {project.blurb && (
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                {project.blurb}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span>by {project.creator}</span>
              </div>

              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>{formatDate(project.createdAt)}</span>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStageColor(project.stage)}`}
              >
                {project.stage}
              </span>

              <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                {project.type}
              </span>

              <a
                href={manifundUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                View on Manifund
              </a>
            </div>

            {/* Funding Info */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    Amount Raised
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(project.amountRaised)}
                  </div>
                </div>

                {project.fundingGoal > 0 && (
                  <>
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">
                        Funding Goal
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(project.fundingGoal)}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">
                        Progress
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {Math.round(
                          (project.amountRaised / project.fundingGoal) * 100
                        )}
                        %
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min((project.amountRaised / project.fundingGoal) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </>
                )}

                {project.minFunding > 0 && project.fundingGoal === 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">
                      Minimum Funding
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(project.minFunding)}
                    </div>
                  </div>
                )}
              </div>

              {project.causes && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm font-medium text-gray-500 mb-2">
                    Causes
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.causes.split(", ").map((cause, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                      >
                        {cause}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Project Description */}
          <MarkdownRenderer content={project.description} />
        </div>
      </div>

      {/* Evaluation Panel */}
      <div className="w-80 bg-gray-50 border-l border-gray-200">
        <EvaluationPanel projectId={projectId} />
      </div>
    </div>
  );
}
