import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedUser,
  errorResponse,
  successResponse,
} from "@/lib/api-helpers";

function generateSubtaskSuggestions(title: string, description?: string | null): string[] {
  const text = `${title} ${description || ""}`.toLowerCase();
  const suggestions: string[] = [];

  if (text.includes("landing page") || text.includes("website")) {
    suggestions.push(
      "Design wireframe/mockup",
      "Set up project structure",
      "Build header and navigation",
      "Create hero section",
      "Add content sections",
      "Implement responsive design",
      "Add SEO meta tags",
      "Test across browsers"
    );
  } else if (text.includes("api") || text.includes("endpoint") || text.includes("backend")) {
    suggestions.push(
      "Define API schema/contract",
      "Set up route handlers",
      "Implement input validation",
      "Add authentication/authorization",
      "Write database queries",
      "Add error handling",
      "Write unit tests",
      "Document API endpoints"
    );
  } else if (text.includes("feature") || text.includes("implement") || text.includes("build")) {
    suggestions.push(
      "Research and plan approach",
      "Design component structure",
      "Implement core logic",
      "Add UI components",
      "Write tests",
      "Code review and refactor",
      "Update documentation"
    );
  } else if (text.includes("bug") || text.includes("fix") || text.includes("issue")) {
    suggestions.push(
      "Reproduce the issue",
      "Identify root cause",
      "Implement fix",
      "Write regression test",
      "Verify fix in staging"
    );
  } else if (text.includes("test") || text.includes("testing")) {
    suggestions.push(
      "Set up testing framework",
      "Write unit tests",
      "Write integration tests",
      "Set up CI/CD test pipeline",
      "Review test coverage"
    );
  } else if (text.includes("deploy") || text.includes("release")) {
    suggestions.push(
      "Run full test suite",
      "Update version numbers",
      "Build production bundle",
      "Deploy to staging",
      "Run smoke tests",
      "Deploy to production",
      "Monitor for issues"
    );
  } else if (text.includes("design") || text.includes("ui") || text.includes("ux")) {
    suggestions.push(
      "Research user needs",
      "Create wireframes",
      "Design high-fidelity mockups",
      "Get design feedback",
      "Create design system tokens",
      "Hand off to development"
    );
  } else if (text.includes("report") || text.includes("document") || text.includes("write")) {
    suggestions.push(
      "Gather requirements and data",
      "Create outline",
      "Write first draft",
      "Review and revise",
      "Get feedback from stakeholders",
      "Finalize and publish"
    );
  } else if (text.includes("meeting") || text.includes("presentation")) {
    suggestions.push(
      "Define agenda/objectives",
      "Prepare materials",
      "Send calendar invites",
      "Conduct meeting/presentation",
      "Send follow-up notes"
    );
  } else {
    suggestions.push(
      "Define requirements and scope",
      "Research and gather information",
      "Create implementation plan",
      "Execute main work",
      "Review and validate",
      "Finalize and deliver"
    );
  }

  return suggestions;
}

function suggestPriority(
  title: string,
  description?: string | null,
  dueDate?: Date | null
): "P1" | "P2" | "P3" | "P4" {
  const text = `${title} ${description || ""}`.toLowerCase();

  const urgentKeywords = ["urgent", "critical", "emergency", "asap", "blocker", "outage", "down", "broken"];
  const highKeywords = ["important", "deadline", "client", "customer", "security", "production"];
  const lowKeywords = ["nice to have", "someday", "maybe", "optional", "backlog", "cleanup", "minor"];

  if (urgentKeywords.some((kw) => text.includes(kw))) return "P1";
  if (highKeywords.some((kw) => text.includes(kw))) return "P2";
  if (lowKeywords.some((kw) => text.includes(kw))) return "P4";

  if (dueDate) {
    const now = new Date();
    const diff = dueDate.getTime() - now.getTime();
    const daysUntilDue = diff / (1000 * 60 * 60 * 24);
    if (daysUntilDue < 0) return "P1";
    if (daysUntilDue <= 1) return "P1";
    if (daysUntilDue <= 3) return "P2";
    if (daysUntilDue <= 7) return "P3";
  }

  return "P3";
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const { id } = await params;

  try {
    const task = await prisma.task.findFirst({
      where: { id, creatorId: user.id },
    });
    if (!task) return errorResponse("Task not found", 404);

    const body = await req.json();
    const { type } = body;

    if (type === "subtasks") {
      const suggestions = generateSubtaskSuggestions(task.title, task.description);
      return successResponse({ subtasks: suggestions.map((title, i) => ({ title, position: i })) });
    }

    if (type === "priority") {
      const priority = suggestPriority(task.title, task.description, task.dueDate);
      return successResponse({ priority, reason: getPriorityReason(priority, task.dueDate) });
    }

    return errorResponse("Invalid suggestion type. Use 'subtasks' or 'priority'.");
  } catch (err) {
    return errorResponse(
      "Failed to generate suggestions",
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}

function getPriorityReason(priority: string, dueDate: Date | null): string {
  if (dueDate) {
    const now = new Date();
    const diff = dueDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return `Task is ${Math.abs(days)} day(s) overdue`;
    if (days <= 1) return "Due within 24 hours";
    if (days <= 3) return `Due in ${days} days`;
    if (days <= 7) return `Due in ${days} days`;
  }
  switch (priority) {
    case "P1": return "Contains urgent/critical keywords";
    case "P2": return "Contains high-priority keywords";
    case "P4": return "Contains low-priority keywords";
    default: return "Default medium priority";
  }
}
