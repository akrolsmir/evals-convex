import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  projects: defineTable({
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
    lastSynced: v.number(),
  }).index("by_manifund_id", ["manifundId"]),

  evaluations: defineTable({
    userId: v.id("users"),
    projectId: v.id("projects"),
    teamScore: v.number(), // 0-10
    ideaScore: v.number(), // 0-10
    notes: v.optional(v.string()),
  }).index("by_user_and_project", ["userId", "projectId"])
    .index("by_project", ["projectId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
