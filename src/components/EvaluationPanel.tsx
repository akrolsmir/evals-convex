import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface EvaluationPanelProps {
  projectId: Id<"projects">;
}

export function EvaluationPanel({ projectId }: EvaluationPanelProps) {
  const evaluation = useQuery(api.evaluations.getByProject, { projectId });
  const aggregateScores = useQuery(api.evaluations.getAggregateScores, { projectId });
  const upsertEvaluation = useMutation(api.evaluations.upsertEvaluation);

  const [teamScore, setTeamScore] = useState(0);
  const [ideaScore, setIdeaScore] = useState(0);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update local state when evaluation data loads
  useEffect(() => {
    if (evaluation) {
      setTeamScore(evaluation.teamScore);
      setIdeaScore(evaluation.ideaScore);
      setNotes(evaluation.notes || "");
    } else {
      setTeamScore(0);
      setIdeaScore(0);
      setNotes("");
    }
  }, [evaluation]);

  const handleSubmit = async () => {
    if (teamScore < 0 || teamScore > 10 || ideaScore < 0 || ideaScore > 10) {
      toast.error("Scores must be between 0 and 10");
      return;
    }

    setIsSubmitting(true);
    try {
      await upsertEvaluation({
        projectId,
        teamScore,
        ideaScore,
        notes: notes.trim() || undefined,
      });
      toast.success("Evaluation saved successfully");
    } catch (error) {
      toast.error("Failed to save evaluation");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ScoreSlider = ({ 
    label, 
    value, 
    onChange, 
    description 
  }: { 
    label: string; 
    value: number; 
    onChange: (value: number) => void;
    description: string;
  }) => {
    const [localValue, setLocalValue] = useState(value);
    const [isDragging, setIsDragging] = useState(false);

    // Update local value when prop changes (but not when dragging)
    useEffect(() => {
      if (!isDragging) {
        setLocalValue(value);
      }
    }, [value, isDragging]);

    const handleMouseDown = () => {
      setIsDragging(true);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      onChange(localValue);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value);
      setLocalValue(newValue);
      if (!isDragging) {
        onChange(newValue);
      }
    };

    const displayValue = isDragging ? localValue : value;

    return (
      <div className="space-y-3">
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <span className="text-lg font-semibold text-gray-900">{displayValue.toFixed(1)}</span>
          </div>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
        
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={displayValue}
            onChange={handleChange}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>0</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Evaluation</h2>
        <p className="text-sm text-gray-500">Rate this project on key criteria</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Your Scores */}
        <div className="space-y-6">
          <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Your Scores</h3>
          
          <ScoreSlider
            label="Team Quality"
            value={teamScore}
            onChange={setTeamScore}
            description="Assess the team's experience, track record, and capability"
          />

          <ScoreSlider
            label="Idea Strength"
            value={ideaScore}
            onChange={setIdeaScore}
            description="Evaluate the innovation, feasibility, and potential impact"
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your thoughts, concerns, or recommendations..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={4}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Saving..." : evaluation ? "Update Evaluation" : "Save Evaluation"}
          </button>
        </div>

        {/* Community Scores */}
        {aggregateScores && aggregateScores.teamScore.count > 0 && (
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
              Community Scores
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium text-gray-700">Team Quality</div>
                  <div className="text-xs text-gray-500">
                    {aggregateScores.teamScore.count} evaluation{aggregateScores.teamScore.count !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {aggregateScores.teamScore.average.toFixed(1)}
                  </div>
                  <div className="w-16 bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full"
                      style={{ width: `${(aggregateScores.teamScore.average / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium text-gray-700">Idea Strength</div>
                  <div className="text-xs text-gray-500">
                    {aggregateScores.ideaScore.count} evaluation{aggregateScores.ideaScore.count !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {aggregateScores.ideaScore.average.toFixed(1)}
                  </div>
                  <div className="w-16 bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full"
                      style={{ width: `${(aggregateScores.ideaScore.average / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
