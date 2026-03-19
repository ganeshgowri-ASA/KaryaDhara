import { TaskPriority } from "@prisma/client";

interface TaskInput {
  title: string;
  description?: string | null;
  dueDate?: Date | null;
  priority?: TaskPriority;
}

interface SubtaskSuggestion {
  title: string;
  priority: TaskPriority;
}

const TASK_PATTERNS: Record<string, SubtaskSuggestion[]> = {
  "design|mockup|wireframe|ui": [
    { title: "Research existing designs and inspiration", priority: "P3" },
    { title: "Create low-fidelity wireframes", priority: "P2" },
    { title: "Design high-fidelity mockups", priority: "P2" },
    { title: "Review and iterate on feedback", priority: "P3" },
  ],
  "api|endpoint|backend|server": [
    { title: "Define API contract and schema", priority: "P2" },
    { title: "Implement endpoint logic", priority: "P1" },
    { title: "Add input validation and error handling", priority: "P2" },
    { title: "Write integration tests", priority: "P2" },
  ],
  "bug|fix|issue|error": [
    { title: "Reproduce the issue", priority: "P1" },
    { title: "Identify root cause", priority: "P1" },
    { title: "Implement fix", priority: "P1" },
    { title: "Test fix and verify no regressions", priority: "P2" },
  ],
  "test|testing|qa": [
    { title: "Write unit tests", priority: "P2" },
    { title: "Write integration tests", priority: "P2" },
    { title: "Perform manual testing", priority: "P3" },
    { title: "Document test results", priority: "P4" },
  ],
  "deploy|release|launch": [
    { title: "Run full test suite", priority: "P1" },
    { title: "Update documentation", priority: "P2" },
    { title: "Create release notes", priority: "P3" },
    { title: "Deploy to staging and verify", priority: "P1" },
    { title: "Deploy to production", priority: "P1" },
  ],
  "document|docs|readme|write": [
    { title: "Outline document structure", priority: "P3" },
    { title: "Write first draft", priority: "P2" },
    { title: "Add examples and code samples", priority: "P3" },
    { title: "Review and proofread", priority: "P3" },
  ],
  "meeting|present|demo": [
    { title: "Prepare agenda", priority: "P2" },
    { title: "Create presentation slides", priority: "P2" },
    { title: "Practice run-through", priority: "P3" },
    { title: "Send follow-up notes", priority: "P3" },
  ],
};

export function suggestSubtasks(task: TaskInput): SubtaskSuggestion[] {
  const text = `${task.title} ${task.description || ""}`.toLowerCase();

  for (const [pattern, suggestions] of Object.entries(TASK_PATTERNS)) {
    const regex = new RegExp(pattern, "i");
    if (regex.test(text)) {
      return suggestions;
    }
  }

  // Generic breakdown for unrecognized tasks
  return [
    { title: "Define requirements and scope", priority: "P2" },
    { title: "Plan implementation approach", priority: "P3" },
    { title: "Execute implementation", priority: "P2" },
    { title: "Review and verify completion", priority: "P3" },
  ];
}

export function suggestPriority(task: TaskInput): TaskPriority {
  const now = new Date();

  if (task.dueDate) {
    const daysUntilDue = Math.ceil(
      (task.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilDue < 0) return "P1"; // Overdue
    if (daysUntilDue <= 1) return "P1"; // Due today or tomorrow
    if (daysUntilDue <= 3) return "P2"; // Due within 3 days
    if (daysUntilDue <= 7) return "P3"; // Due within a week
    return "P4"; // More than a week away
  }

  const title = task.title.toLowerCase();
  if (
    title.includes("urgent") ||
    title.includes("critical") ||
    title.includes("asap")
  ) {
    return "P1";
  }
  if (title.includes("important") || title.includes("high")) {
    return "P2";
  }

  return "P3";
}
