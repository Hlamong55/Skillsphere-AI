
/*
========================================
SkillSphere AI - Gesture Quiz Questions
========================================

Each question contains:
- 4 MCQ options
- 1 correct answer
- Topic
- Explanation

Gesture Mapping:
1 Finger  = Option 1
2 Fingers = Option 2
3 Fingers = Option 3
4 Fingers = Option 4

correctIndex:
0 = Option 1
1 = Option 2
2 = Option 3
3 = Option 4
*/

export const GESTURE_QUESTIONS = [
  {
    id: "q1",
    topic: "Web Development",
    question:
      "Which language defines the structure of a web page?",

    options: [
      "HTML",
      "CSS",
      "Python",
      "SQL",
    ],

    correctIndex: 0,

    explanation:
      "HTML is the markup language used to structure web content.",
  },

  {
    id: "q2",
    topic: "Frontend",
    question:
      "Which technology is primarily used to style web pages?",

    options: [
      "Node.js",
      "CSS",
      "MongoDB",
      "Git",
    ],

    correctIndex: 1,

    explanation:
      "CSS controls presentation such as colors, spacing, and layout.",
  },

  {
    id: "q3",
    topic: "JavaScript",
    question:
      "Which JavaScript method creates a new array by transforming each item?",

    options: [
      "push()",
      "find()",
      "map()",
      "sort()",
    ],

    correctIndex: 2,

    explanation:
      "Array.map() returns a new array of transformed values.",
  },

  {
    id: "q4",
    topic: "Version Control",
    question:
      "Which Git command records staged changes in local history?",

    options: [
      "git fetch",
      "git status",
      "git clone",
      "git commit",
    ],

    correctIndex: 3,

    explanation:
      "git commit saves a snapshot of staged changes locally.",
  },

  {
    id: "q5",
    topic: "React",
    question:
      "Which React hook stores state inside a function component?",

    options: [
      "useState",
      "useNavigate",
      "useMemo",
      "useId",
    ],

    correctIndex: 0,

    explanation:
      "useState supplies a state value and a state-update function.",
  },

  {
    id: "q6",
    topic: "Backend",
    question:
      "Which Node.js framework is commonly used to define REST API routes?",

    options: [
      "React",
      "Express",
      "Tailwind",
      "Vite",
    ],

    correctIndex: 1,

    explanation:
      "Express is a web framework for Node.js commonly used for REST APIs.",
  },

  {
    id: "q7",
    topic: "HTTP",
    question:
      "Which HTTP status code means the requested resource was not found?",

    options: [
      "200",
      "201",
      "404",
      "500",
    ],

    correctIndex: 2,

    explanation:
      "HTTP 404 indicates that the requested resource was not found.",
  },

  {
    id: "q8",
    topic: "Database",
    question:
      "MongoDB commonly organizes related documents in which structure?",

    options: [
      "Worksheet",
      "Component",
      "CSS class",
      "Collection",
    ],

    correctIndex: 3,

    explanation:
      "MongoDB stores documents in collections.",
  },
];
