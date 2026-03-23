import { useState, useCallback, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Code, Play, RotateCcw, Circle, Lock, ArrowLeft, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useStudentContext } from "@/components/StudentLayout";
import { usePyodide } from "@/hooks/usePyodide";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface MCQQuestion {
  question: string;
  options: string[];
  correct: number; // index
}

const quizzes: Record<string, MCQQuestion[]> = {
  "1": [
    { question: "What is a variable in Python?", options: ["A loop", "A named container for storing data", "A function", "A type of error"], correct: 1 },
    { question: "Which of these is a valid variable name?", options: ["2name", "my-var", "my_var", "class"], correct: 2 },
    { question: "What does `len('hello')` return?", options: ["4", "5", "6", "'hello'"], correct: 1 },
  ],
  "2": [
    { question: "What keyword starts a conditional in Python?", options: ["for", "while", "if", "def"], correct: 2 },
    { question: "What does `elif` stand for?", options: ["else if", "eliminate if", "elevate if", "else finally"], correct: 0 },
    { question: "Which operator checks equality?", options: ["=", "==", "!=", "==="], correct: 1 },
  ],
  "3": [
    { question: "Which loop runs a set number of times?", options: ["while loop", "for loop", "do loop", "repeat loop"], correct: 1 },
    { question: "What does `range(5)` generate?", options: ["1 to 5", "0 to 5", "0 to 4", "1 to 4"], correct: 2 },
    { question: "How do you exit a loop early?", options: ["stop", "exit", "break", "return"], correct: 2 },
  ],
  "4": [
    { question: "Which keyword defines a function?", options: ["func", "function", "def", "define"], correct: 2 },
    { question: "What does `return` do in a function?", options: ["Prints a value", "Sends a value back to the caller", "Stops the program", "Creates a variable"], correct: 1 },
    { question: "What are function inputs called?", options: ["Variables", "Returns", "Parameters", "Loops"], correct: 2 },
  ],
};

const exercises: Record<string, { title: string; prompt: string; starter: string }> = {
  "1": { title: "Hello, World! and Beyond", prompt: "Write a Python program that asks for the user's name and prints a personalized greeting.", starter: "# Week 1 Exercise: Hello, World! and Beyond\n# Ask the user for their name and print a greeting\n\nname = \"Alice\"\n\n# TODO: Print a greeting like \"Hello, [name]! Welcome to Kid2Kid CS!\"\nprint(\"Hello, \" + name + \"!\")\n\n# BONUS: Also print how many letters are in their name\nprint(\"Your name has\", len(name), \"letters!\")\n" },
  "2": { title: "Grade Calculator", prompt: "Write a program that takes a score (0-100) and prints the letter grade (A: 90+, B: 80+, C: 70+, D: 60+, F: below 60).", starter: "score = 85\n\n# Print the letter grade\n" },
  "3": { title: "Pattern Printer", prompt: "Write a program that prints a right triangle of stars with 5 rows.", starter: "# Print a right triangle\nfor i in range(1, 6):\n    print('*' * i)\n" },
  "4": { title: "Calculator App", prompt: "Write a function that takes two numbers and an operator (+, -, *, /) and returns the result.", starter: "def calculate(a, b, op):\n    # Your code here\n    pass\n\nprint(calculate(10, 3, '+'))\n" },
};

const LineNumbers = ({ count }: { count: number }) => (
  <div className="select-none text-right pr-4 pt-5 pb-5 pl-4 text-muted-foreground/30 font-mono text-sm leading-relaxed">
    {Array.from({ length: count }, (_, i) => (
      <div key={i}>{i + 1}</div>
    ))}
  </div>
);

const WeekExercise = () => {
  const { weekId } = useParams();
  const { unlockedWeeks } = useStudentContext();
  const weekNum = parseInt(weekId || "1");
  const ex = exercises[weekId || "1"];
  const quiz = quizzes[weekId || "1"] || [];

  // Persist code in localStorage
  const storageKey = `k2k_code_week_${weekId}`;
  const quizKey = `k2k_quiz_week_${weekId}`;

  const [code, setCode] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved || ex?.starter || "";
  });
  const [output, setOutput] = useState("");
  const { runCode, loading: pyodideLoading, ready: pyodideReady } = usePyodide();
  const [isRunning, setIsRunning] = useState(false);

  // Quiz state
  const [quizPassed, setQuizPassed] = useState(() => {
    return localStorage.getItem(quizKey) === "passed";
  });
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>(undefined);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  // Save code to localStorage on change
  useEffect(() => {
    localStorage.setItem(storageKey, code);
  }, [code, storageKey]);

  const lineCount = Math.max(code.split("\n").length, 12);

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setOutput("⏳ Loading Python runtime...");
    try {
      const result = await runCode(code);
      setOutput(result || "(No output)");
    } catch (err: any) {
      setOutput("Error: " + (err.message || String(err)));
    }
    setIsRunning(false);
  }, [code, runCode]);

  const handleAnswerSubmit = () => {
    if (selectedAnswer === undefined) return;
    const correct = parseInt(selectedAnswer) === quiz[currentQ].correct;
    setIsCorrect(correct);
    setShowResult(true);
    if (correct) setCorrectCount(prev => prev + 1);
  };

  const handleNext = () => {
    setShowResult(false);
    setSelectedAnswer(undefined);
    if (currentQ + 1 >= quiz.length) {
      // Quiz complete
      setQuizPassed(true);
      localStorage.setItem(quizKey, "passed");
    } else {
      setCurrentQ(prev => prev + 1);
    }
  };

  if (weekNum > unlockedWeeks) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-center px-4">
        <Lock className="w-10 h-10 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-medium mb-2">Week {weekId} is Locked</h2>
        <p className="text-muted-foreground text-sm">Your teacher hasn't unlocked this week yet.</p>
      </div>
    );
  }

  // Quiz gate
  if (!quizPassed) {
    const progress = ((currentQ) / quiz.length) * 100;
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background">
        <div className="h-12 flex items-center justify-between px-5 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-3">
            <Link to="/student" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <Code className="w-4 h-4 text-accent" />
            <span className="font-medium text-sm">Week {weekId}: Pre-Exercise Quiz</span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-lg">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>Question {currentQ + 1} of {quiz.length}</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQ}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="rounded-xl bg-card shadow-subtle border border-border p-8">
                  <h2 className="text-lg font-semibold mb-6">{quiz[currentQ].question}</h2>

                  <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} disabled={showResult}>
                    <div className="space-y-3">
                      {quiz[currentQ].options.map((opt, idx) => (
                        <label
                          key={idx}
                          className={cn(
                            "flex items-center gap-3 p-4 rounded-lg border transition-all cursor-pointer",
                            showResult && idx === quiz[currentQ].correct
                              ? "border-green-500 bg-green-500/5"
                              : showResult && parseInt(selectedAnswer || "-1") === idx && !isCorrect
                              ? "border-destructive bg-destructive/5"
                              : selectedAnswer === String(idx)
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <RadioGroupItem value={String(idx)} id={`q-${idx}`} />
                          <Label htmlFor={`q-${idx}`} className="flex-1 cursor-pointer font-normal">{opt}</Label>
                          {showResult && idx === quiz[currentQ].correct && (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          )}
                          {showResult && parseInt(selectedAnswer || "-1") === idx && !isCorrect && (
                            <XCircle className="w-5 h-5 text-destructive" />
                          )}
                        </label>
                      ))}
                    </div>
                  </RadioGroup>

                  <div className="mt-6 flex justify-end">
                    {!showResult ? (
                      <Button onClick={handleAnswerSubmit} disabled={selectedAnswer === undefined}>
                        Submit Answer
                      </Button>
                    ) : (
                      <div className="flex items-center gap-4">
                        <span className={cn("text-sm font-medium", isCorrect ? "text-green-500" : "text-destructive")}>
                          {isCorrect ? "Correct! 🎉" : "Not quite — the correct answer is highlighted."}
                        </span>
                        <Button onClick={handleNext}>
                          {currentQ + 1 >= quiz.length ? "Start Exercise →" : "Next Question →"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Top bar */}
      <div className="h-12 flex items-center justify-between px-5 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/student" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <Code className="w-4 h-4 text-accent" />
          <span className="font-medium text-sm">Week {weekId}: {ex?.title}</span>
          {pyodideLoading && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" /> Loading Python...
            </span>
          )}
          {pyodideReady && (
            <span className="text-xs text-green-500 flex items-center gap-1">
              <Circle className="w-2 h-2 fill-current" /> Python ready
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCode(ex?.starter || "")}>
            <RotateCcw className="w-3 h-3" /> Reset
          </Button>
          <Button size="sm" className="bg-primary" onClick={handleRun} disabled={isRunning}>
            {isRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
            {isRunning ? "Running..." : "Run"}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Prompt panel */}
        <div className="w-72 border-r border-border p-5 overflow-y-auto bg-card shrink-0">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground/60 mb-3">Exercise</div>
          <h3 className="font-bold mb-3">{ex?.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{ex?.prompt}</p>
        </div>

        {/* Editor area */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 p-3 min-h-0">
            <div className="h-full rounded-lg overflow-hidden" style={{
              backgroundColor: "#1e293b",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06), 0 4px 12px rgba(0,0,0,0.3)"
            }}>
              <div className="flex items-center justify-between px-4 py-2.5" style={{ backgroundColor: "#162032" }}>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#ef4444" }} />
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#f59e0b" }} />
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#22c55e" }} />
                  </div>
                  <span className="text-[12px] font-mono ml-2" style={{ color: "#94a3b8" }}>exercise.py</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Circle className="w-2 h-2" style={{ color: code !== ex?.starter ? "#22c55e" : "#475569" }} fill={code !== ex?.starter ? "#22c55e" : "transparent"} />
                  <span className="text-[11px]" style={{ color: "#475569" }}>{code !== ex?.starter ? "modified" : "saved"}</span>
                </div>
              </div>
              <div className="flex overflow-auto h-[calc(100%-36px)]">
                <LineNumbers count={lineCount} />
                <textarea
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="flex-1 bg-transparent font-mono text-sm pt-5 pb-5 pr-5 resize-none outline-none leading-relaxed"
                  style={{ color: "#e2e8f0", caretColor: "#38bdf8" }}
                  spellCheck={false}
                />
              </div>
            </div>
          </div>

          <div className="h-36 px-3 pb-3 shrink-0">
            <div className="h-full rounded-lg overflow-hidden" style={{
              backgroundColor: "#0f172a",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.04)"
            }}>
              <div className="flex items-center gap-2 px-4 py-2" style={{ backgroundColor: "#0c1322" }}>
                <span className="text-[11px] uppercase tracking-wider font-mono" style={{ color: "#475569" }}>Output</span>
              </div>
              <pre className="px-4 py-3 font-mono text-sm overflow-auto h-[calc(100%-32px)] whitespace-pre-wrap" style={{ color: "#4ade80" }}>
                {output || "Click 'Run' to execute your code"}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeekExercise;
