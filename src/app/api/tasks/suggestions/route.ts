import { NextRequest } from "next/server";
import { requireAuth, errorResponse, jsonResponse } from "@/lib/api-utils";

interface Subtask {
  title: string;
  priority: string;
}

function generateSubtaskSuggestions(
  title: string,
  description?: string
): Subtask[] {
  const text = `${title} ${description || ""}`.toLowerCase();
  const suggestions: Subtask[] = [];

  // Pattern-based task breakdown
  if (
    text.includes("website") ||
    text.includes("landing page") ||
    text.includes("web app")
  ) {
    suggestions.push(
      { title: "Design wireframes and mockups", priority: "P2" },
      { title: "Set up project structure", priority: "P2" },
      { title: "Implement responsive layout", priority: "P2" },
      { title: "Add content and assets", priority: "P3" },
      { title: "Test across browsers and devices", priority: "P3" },
      { title: "Deploy to production", priority: "P1" }
    );
  } else if (text.includes("api") || text.includes("endpoint")) {
    suggestions.push(
      { title: "Define API schema and routes", priority: "P2" },
      { title: "Implement request validation", priority: "P2" },
      { title: "Write business logic", priority: "P1" },
      { title: "Add error handling", priority: "P2" },
      { title: "Write API tests", priority: "P3" },
      { title: "Document API endpoints", priority: "P3" }
    );
  } else if (
    text.includes("bug") ||
    text.includes("fix") ||
    text.includes("issue")
  ) {
    suggestions.push(
      { title: "Reproduce the issue", priority: "P1" },
      { title: "Identify root cause", priority: "P1" },
      { title: "Implement fix", priority: "P1" },
      { title: "Write regression tests", priority: "P2" },
      { title: "Verify fix in staging", priority: "P2" }
    );
  } else if (
    text.includes("feature") ||
    text.includes("implement") ||
    text.includes("build")
  ) {
    suggestions.push(
      { title: "Define requirements and acceptance criteria", priority: "P2" },
      { title: "Design solution architecture", priority: "P2" },
      { title: "Implement core functionality", priority: "P1" },
      { title: "Add edge case handling", priority: "P3" },
      { title: "Write tests", priority: "P2" },
      { title: "Code review and refactor", priority: "P3" }
    );
  } else if (
    text.includes("test") ||
    text.includes("testing") ||
    text.includes("qa")
  ) {
    suggestions.push(
      { title: "Write unit tests", priority: "P2" },
      { title: "Write integration tests", priority: "P2" },
      { title: "Perform manual testing", priority: "P3" },
      { title: "Fix failing tests", priority: "P1" },
      { title: "Update test documentation", priority: "P4" }
    );
  } else if (
    text.includes("deploy") ||
    text.includes("release") ||
    text.includes("launch")
  ) {
    suggestions.push(
      { title: "Prepare release notes", priority: "P2" },
      { title: "Run final test suite", priority: "P1" },
      { title: "Back up current state", priority: "P2" },
      { title: "Deploy to staging", priority: "P1" },
      { title: "Verify staging deployment", priority: "P1" },
      { title: "Deploy to production", priority: "P1" }
    );
  } else if (
    text.includes("meeting") ||
    text.includes("presentation") ||
    text.includes("report")
  ) {
    suggestions.push(
      { title: "Prepare agenda / outline", priority: "P2" },
      { title: "Gather data and materials", priority: "P2" },
      { title: "Create slides / document", priority: "P2" },
      { title: "Review and rehearse", priority: "P3" },
      { title: "Share with stakeholders", priority: "P3" }
    );
  } else {
    // Generic breakdown
    suggestions.push(
      { title: "Research and planning", priority: "P3" },
      { title: "Implementation", priority: "P2" },
      { title: "Testing and validation", priority: "P2" },
      { title: "Documentation", priority: "P4" },
      { title: "Review and finalize", priority: "P3" }
    );
  }

  return suggestions;
}

function suggestPriority(
  dueDate?: string,
  title?: string,
  description?: string
): { priority: string; reason: string } {
  const text = `${title || ""} ${description || ""}`.toLowerCase();

  // Urgency keywords
  if (
    text.includes("urgent") ||
    text.includes("critical") ||
    text.includes("asap") ||
    text.includes("emergency")
  ) {
    return { priority: "P1", reason: "Contains urgency keywords" };
  }

  if (
    text.includes("important") ||
    text.includes("high priority") ||
    text.includes("blocker")
  ) {
    return { priority: "P2", reason: "Contains high-importance keywords" };
  }

  // Due date proximity
  if (dueDate) {
    const due = new Date(dueDate);
    const now = new Date();
    const daysUntilDue = Math.ceil(
      (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilDue < 0) {
      return { priority: "P1", reason: "Task is overdue" };
    }
    if (daysUntilDue <= 1) {
      return { priority: "P1", reason: "Due within 24 hours" };
    }
    if (daysUntilDue <= 3) {
      return { priority: "P2", reason: "Due within 3 days" };
    }
    if (daysUntilDue <= 7) {
      return { priority: "P3", reason: "Due within a week" };
    }
    return { priority: "P4", reason: "Due date is more than a week away" };
  }

  if (
    text.includes("nice to have") ||
    text.includes("low priority") ||
    text.includes("someday")
  ) {
    return { priority: "P4", reason: "Contains low-priority keywords" };
  }

  return { priority: "P3", reason: "Default medium priority" };
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return errorResponse("Unauthorized", 401);

  try {
    const { title, description, dueDate } = await req.json();
    if (!title?.trim()) return errorResponse("Title is required");

    const subtasks = generateSubtaskSuggestions(title, description);
    const priorityRecommendation = suggestPriority(dueDate, title, description);

    return jsonResponse({
      subtasks,
      priority: priorityRecommendation,
    });
  } catch (error) {
    console.error("Suggestions error:", error);
    return errorResponse("Failed to generate suggestions", 500);
  }
}
