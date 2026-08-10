"use client";

const PHASES = [
  { id: "foundation", label: "Foundation", icon: "🎯", color: "bg-gray-200", activeColor: "bg-lms-accent", desc: "Archetype, mission, syllabus" },
  { id: "content", label: "Content", icon: "✍️", color: "bg-gray-200", activeColor: "bg-blue-500", desc: "Lessons, images, design tokens" },
  { id: "assessment", label: "Assessment", icon: "📊", color: "bg-gray-200", activeColor: "bg-violet-500", desc: "Item bank, quiz component, calibration" },
  { id: "review", label: "Review", icon: "🔍", color: "bg-gray-200", activeColor: "bg-amber-500", desc: "Student panels, expert reviews" },
  { id: "publish", label: "Publish", icon: "🚀", color: "bg-gray-200", activeColor: "bg-green-500", desc: "Export, deploy" },
];

const NEXT_STEPS: Record<string, { action: string; link?: string }[]> = {
  foundation: [
    { action: 'Set the course archetype in Settings', link: "#settings" },
    { action: "Write the mission statement" },
    { action: "Create modules with the + Add button below" },
  ],
  content: [
    { action: "Write lesson HTML for each module", link: "#modules" },
    { action: "Fetch a course hero image using the Pexels search" },
    { action: "Apply design tokens and WCAG checks" },
  ],
  assessment: [
    { action: "Create an item bank at assessments/item-bank.json" },
    { action: "Write quiz items with IRT parameters (a, b, c)" },
    { action: "Add quiz container HTML to each lesson" },
  ],
  review: [
    { action: "Run a student panel with 3-5 learners" },
    { action: "Complete learning design self-review" },
    { action: "Run content accuracy and accessibility reviews" },
  ],
  publish: [
    { action: "Run IMSCC export and verify the .imscc file" },
    { action: "Publish all modules", link: "#modules" },
    { action: "Deploy to production via git push" },
  ],
};

export function WorkflowProgress({ currentPhase, onPhaseChange }: {
  currentPhase: string;
  onPhaseChange: (phase: string) => void;
}) {
  const currentIdx = PHASES.findIndex(p => p.id === currentPhase);
  const nextSteps = NEXT_STEPS[currentPhase] || [];

  return (
    <div className="lms-card p-5">
      <h2 className="text-base font-semibold mb-4">Course Workflow</h2>

      {/* Phase steps */}
      <div className="flex items-center gap-0 mb-6">
        {PHASES.map((phase, idx) => {
          const isComplete = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isFuture = idx > currentIdx;
          return (
            <div key={phase.id} className="flex-1 flex flex-col items-center">
              <button
                onClick={() => onPhaseChange(phase.id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all cursor-pointer border-2 ${
                  isComplete ? "bg-lms-accent border-lms-accent text-white" :
                  isCurrent ? "bg-lms-accent border-lms-accent text-white scale-110 shadow-md" :
                  "bg-white border-gray-300 text-gray-400 hover:border-lms-accent"
                }`}
                title={phase.desc}
              >
                {isComplete ? "✓" : phase.icon}
              </button>
              <p className={`text-[10px] mt-1 text-center font-medium ${
                isCurrent ? "text-lms-accent" : isComplete ? "text-lms-text" : "text-gray-400"
              }`}>
                {phase.label}
              </p>
              {idx < PHASES.length - 1 && (
                <div className={`h-0.5 w-full -mt-5 ml-5 ${isComplete ? "bg-lms-accent" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Current phase info */}
      <div className="bg-lms-bg rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{PHASES[currentIdx]?.icon}</span>
          <span className="font-semibold text-sm">{PHASES[currentIdx]?.label}</span>
          <span className="text-xs text-lms-text-muted">— {PHASES[currentIdx]?.desc}</span>
        </div>

        <p className="text-xs text-lms-text-secondary mb-3">Next steps:</p>
        <ul className="space-y-1.5">
          {nextSteps.map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-lms-text">
              <span className="text-lms-accent mt-0.5 shrink-0">→</span>
              {step.link ? (
                <a href={step.link} className="hover:text-lms-accent no-underline">{step.action}</a>
              ) : (
                <span>{step.action}</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Phase navigation buttons */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => onPhaseChange(PHASES[Math.max(0, currentIdx - 1)].id)}
          disabled={currentIdx === 0}
          className="lms-btn lms-btn-outline text-xs !px-3 !py-1.5 disabled:opacity-30"
        >
          ← Previous: {PHASES[currentIdx - 1]?.label || "—"}
        </button>
        <button
          onClick={() => onPhaseChange(PHASES[Math.min(PHASES.length - 1, currentIdx + 1)].id)}
          disabled={currentIdx === PHASES.length - 1}
          className="lms-btn lms-btn-primary text-xs !px-3 !py-1.5 disabled:opacity-30"
        >
          Next: {PHASES[currentIdx + 1]?.label || "—"} →
        </button>
      </div>
    </div>
  );
}
