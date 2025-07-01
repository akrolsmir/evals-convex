import { Id } from "../../convex/_generated/dataModel";

interface Project {
  _id: Id<"projects">;
  title: string;
  creator: string;
  blurb: string;
  amountRaised: number;
  fundingGoal: number;
  minFunding: number;
  stage: string;
  type: string;
  causes: string;
  createdAt: number;
}

interface ProjectListProps {
  projects: Project[];
  selectedProjectId: Id<"projects"> | null;
  onSelectProject: (id: Id<"projects">) => void;
}

export function ProjectList({ projects, selectedProjectId, onSelectProject }: ProjectListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStageColor = (stage: string) => {
    switch (stage.toLowerCase()) {
      case 'active':
      case 'funding':
        return 'bg-green-100 text-green-700';
      case 'completed':
      case 'funded':
        return 'bg-blue-100 text-blue-700';
      case 'draft':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="divide-y divide-gray-100">
      {projects.map((project) => (
        <button
          key={project._id}
          onClick={() => onSelectProject(project._id)}
          className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
            selectedProjectId === project._id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
          }`}
        >
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900 text-sm leading-tight line-clamp-2">
              {project.title}
            </h3>
            
            {project.blurb && (
              <p className="text-xs text-gray-600 line-clamp-2">
                {project.blurb}
              </p>
            )}
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>by {project.creator}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(project.stage)}`}>
                {project.stage}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Raised</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(project.amountRaised)}
                </span>
              </div>
              
              {project.fundingGoal > 0 && (
                <>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Goal</span>
                    <span className="text-gray-700">
                      {formatCurrency(project.fundingGoal)}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full transition-all"
                      style={{
                        width: `${Math.min((project.amountRaised / project.fundingGoal) * 100, 100)}%`
                      }}
                    />
                  </div>
                </>
              )}

              {project.minFunding > 0 && project.fundingGoal === 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Min funding</span>
                  <span className="text-gray-700">
                    {formatCurrency(project.minFunding)}
                  </span>
                </div>
              )}
            </div>

            {project.causes && (
              <div className="text-xs text-gray-400">
                {project.causes}
              </div>
            )}

            <div className="text-xs text-gray-400">
              {formatDate(project.createdAt)}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
