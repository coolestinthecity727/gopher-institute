export type BadgeDefinition = {
  key: string;
  name: string;
  description: string;
  icon: string;
};

export const BADGES: BadgeDefinition[] = [
  {
    key: "first-step",
    name: "First Step",
    description: "Complete your first lesson.",
    icon: "🏁",
  },
  {
    key: "dedicated-learner",
    name: "Dedicated Learner",
    description: "Complete 25% of your programme.",
    icon: "📚",
  },
  {
    key: "quiz-master",
    name: "Quiz Master",
    description: "Successfully pass 5 quizzes.",
    icon: "🧠",
  },
  {
    key: "practical-pro",
    name: "Practical Pro",
    description: "Complete a practical assessment.",
    icon: "🔧",
  },
  {
    key: "consistent-learner",
    name: "Consistent Learner",
    description: "Maintain consistent learning activity.",
    icon: "🔥",
  },
  {
    key: "programme-graduate",
    name: "Programme Graduate",
    description: "Complete 100% of your programme.",
    icon: "🎓",
  },
];