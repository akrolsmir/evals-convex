import { v } from "convex/values";
import { query, mutation, action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    return await ctx.db
      .query("projects")
      .order("desc")
      .take(limit);
  },
});

export const getById = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const syncProjects = action({
  args: {},
  handler: async (ctx) => {
    try {
      const response = await fetch("https://manifund.org/api/v0/projects");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const projects = await response.json();
      
      for (const project of projects) {
        // Calculate funding metrics from transactions
        const totalRaised = project.txns?.reduce((sum: number, txn: any) => {
          return sum + (txn.amount || 0);
        }, 0) || 0;

        await ctx.runMutation(internal.projects.upsertProject, {
          manifundId: project.id,
          title: project.title || "Untitled Project",
          description: project.description || project.blurb || "",
          creator: project.profiles?.full_name || project.creator || "Unknown",
          slug: project.slug || "",
          blurb: project.blurb || "",
          amountRaised: totalRaised,
          fundingGoal: project.funding_goal || 0,
          minFunding: project.min_funding || 0,
          stage: project.stage || "active",
          type: project.type || "grant",
          createdAt: new Date(project.created_at || Date.now()).getTime(),
          causes: project.causes?.map((cause: any) => cause.title).join(", ") || "",
        });
      }
      
      return { success: true, count: projects.length };
    } catch (error) {
      console.error("Failed to sync projects:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  },
});

export const upsertProject = internalMutation({
  args: {
    manifundId: v.string(),
    title: v.string(),
    description: v.string(),
    creator: v.string(),
    slug: v.string(),
    blurb: v.string(),
    amountRaised: v.number(),
    fundingGoal: v.number(),
    minFunding: v.number(),
    stage: v.string(),
    type: v.string(),
    createdAt: v.number(),
    causes: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("projects")
      .withIndex("by_manifund_id", (q) => q.eq("manifundId", args.manifundId))
      .unique();

    const projectData = {
      ...args,
      lastSynced: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, projectData);
      return existing._id;
    } else {
      return await ctx.db.insert("projects", projectData);
    }
  },
});
