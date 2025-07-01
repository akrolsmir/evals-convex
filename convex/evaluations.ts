import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("evaluations")
      .withIndex("by_user_and_project", (q) => 
        q.eq("userId", userId).eq("projectId", args.projectId)
      )
      .unique();
  },
});

export const getAggregateScores = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const evaluations = await ctx.db
      .query("evaluations")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    if (evaluations.length === 0) {
      return {
        teamScore: { average: 0, count: 0 },
        ideaScore: { average: 0, count: 0 },
      };
    }

    const teamSum = evaluations.reduce((sum, evaluation) => sum + evaluation.teamScore, 0);
    const ideaSum = evaluations.reduce((sum, evaluation) => sum + evaluation.ideaScore, 0);

    return {
      teamScore: {
        average: teamSum / evaluations.length,
        count: evaluations.length,
      },
      ideaScore: {
        average: ideaSum / evaluations.length,
        count: evaluations.length,
      },
    };
  },
});

export const upsertEvaluation = mutation({
  args: {
    projectId: v.id("projects"),
    teamScore: v.number(),
    ideaScore: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to evaluate projects");
    }

    // Validate scores are between 0 and 10
    if (args.teamScore < 0 || args.teamScore > 10 || args.ideaScore < 0 || args.ideaScore > 10) {
      throw new Error("Scores must be between 0 and 10");
    }

    const existing = await ctx.db
      .query("evaluations")
      .withIndex("by_user_and_project", (q) => 
        q.eq("userId", userId).eq("projectId", args.projectId)
      )
      .unique();

    const evaluationData = {
      userId,
      projectId: args.projectId,
      teamScore: args.teamScore,
      ideaScore: args.ideaScore,
      notes: args.notes,
    };

    if (existing) {
      await ctx.db.patch(existing._id, evaluationData);
      return existing._id;
    } else {
      return await ctx.db.insert("evaluations", evaluationData);
    }
  },
});
