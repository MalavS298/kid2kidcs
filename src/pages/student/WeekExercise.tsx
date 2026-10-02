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
import { isInPerson, syncExerciseCode } from "@/lib/inPerson";

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
    { question: "Which function displays text on the screen?", options: ["show()", "display()", "print()", "write()"], correct: 2 },
    { question: "What type of data is `\"42\"` (with quotes)?", options: ["Integer", "String", "Float", "Boolean"], correct: 1 },
    { question: "What does `input()` do?", options: ["Prints text", "Reads text typed by the user", "Deletes a variable", "Ends the program"], correct: 1 },
    { question: "What is the result of `\"Hi\" + \"There\"`?", options: ["Hi There", "HiThere", "Error", "Hi+There"], correct: 1 },
    { question: "Which symbol starts a comment in Python?", options: ["//", "#", "/*", "--"], correct: 1 },
    { question: "What does `int(\"7\")` give you?", options: ["\"7\"", "7", "7.0", "Error"], correct: 1 },
    { question: "What is `type(3.5)`?", options: ["int", "str", "float", "bool"], correct: 2 },
  ],
  "2": [
    { question: "What keyword starts a conditional in Python?", options: ["for", "while", "if", "def"], correct: 2 },
    { question: "What does `elif` stand for?", options: ["else if", "eliminate if", "elevate if", "else finally"], correct: 0 },
    { question: "Which operator checks equality?", options: ["=", "==", "!=", "==="], correct: 1 },
    { question: "Which operator means 'not equal'?", options: ["<>", "!=", "=!", "~="], correct: 1 },
    { question: "What is `5 > 3 and 2 > 4`?", options: ["True", "False", "Error", "None"], correct: 1 },
    { question: "What is `5 > 3 or 2 > 4`?", options: ["True", "False", "Error", "None"], correct: 0 },
    { question: "What must come at the end of an `if` line?", options: [";", ":", "{", "then"], correct: 1 },
    { question: "How does Python know which code is inside an `if`?", options: ["Curly braces", "Indentation", "Parentheses", "The word 'end'"], correct: 1 },
    { question: "What does `10 % 3` return?", options: ["3", "1", "3.33", "0"], correct: 1 },
    { question: "When does the `else` block run?", options: ["Always", "When all conditions above are False", "When the first condition is True", "Never"], correct: 1 },
  ],
  "3": [
    { question: "Which loop runs a set number of times?", options: ["while loop", "for loop", "do loop", "repeat loop"], correct: 1 },
    { question: "What does `range(5)` generate?", options: ["1 to 5", "0 to 5", "0 to 4", "1 to 4"], correct: 2 },
    { question: "How do you exit a loop early?", options: ["stop", "exit", "break", "return"], correct: 2 },
    { question: "What does `continue` do in a loop?", options: ["Ends the loop", "Skips to the next repetition", "Restarts the program", "Pauses the loop"], correct: 1 },
    { question: "What does `range(2, 6)` generate?", options: ["2,3,4,5", "2,3,4,5,6", "3,4,5,6", "2,6"], correct: 0 },
    { question: "A `while` loop runs as long as...", options: ["Its condition is True", "Its condition is False", "10 times", "Forever, always"], correct: 0 },
    { question: "What does `range(0, 10, 2)` generate?", options: ["0,2,4,6,8", "0,2,4,6,8,10", "2,4,6,8,10", "0 to 9"], correct: 0 },
    { question: "How many times does `for i in range(3): print('hi')` print?", options: ["2", "3", "4", "1"], correct: 1 },
    { question: "What is `'*' * 3`?", options: ["'***'", "9", "Error", "'* 3'"], correct: 0 },
    { question: "What happens if a while loop's condition never becomes False?", options: ["It stops after 100 runs", "It runs forever (infinite loop)", "Python fixes it", "It errors immediately"], correct: 1 },
  ],
  "4": [
    { question: "Which keyword defines a function?", options: ["func", "function", "def", "define"], correct: 2 },
    { question: "What does `return` do in a function?", options: ["Prints a value", "Sends a value back to the caller", "Stops the program", "Creates a variable"], correct: 1 },
    { question: "What are function inputs called?", options: ["Variables", "Returns", "Parameters", "Loops"], correct: 2 },
    { question: "How do you call a function named `greet`?", options: ["call greet", "greet()", "def greet", "run greet"], correct: 1 },
    { question: "What does a function return if it has no `return`?", options: ["0", "\"\"", "None", "False"], correct: 2 },
    { question: "In `def add(a, b):`, what are `a` and `b`?", options: ["Returns", "Parameters", "Loops", "Strings"], correct: 1 },
    { question: "Why use functions?", options: ["To make code slower", "To reuse code and organize it", "Python requires them", "To add comments"], correct: 1 },
    { question: "What does `add(2, 3)` return if `add` returns `a + b`?", options: ["23", "5", "None", "Error"], correct: 1 },
    { question: "Can a function call another function?", options: ["Yes", "No", "Only built-in ones", "Only once"], correct: 0 },
    { question: "What is a default parameter, like `def hi(name=\"friend\")`?", options: ["A required value", "A value used if none is given", "A global variable", "An error"], correct: 1 },
  ],
};

interface Exercise { title: string; prompt: string; starter: string }

const exercises: Record<string, Exercise[]> = {
  "1": [
    { title: "Personal Greeting", prompt: "Ask the user for their name using input(), then print a greeting like \"Hello, Alice! Welcome to Kid2Kid CS!\". Bonus: print how many letters are in their name.", starter: "# Exercise 1: Personal Greeting\n# Step 1: Ask the user for their name and store it in a variable\n\n\n# Step 2: Print a personalized greeting\n\n\n# BONUS: Print how many letters are in their name\n\n" },
    { title: "Age in the Future", prompt: "Ask the user for their age, convert it to a number with int(), and print how old they will be in 10 years.", starter: "# Exercise 2: Age in the Future\n# Step 1: Ask for the user's age (remember input() gives you text!)\n\n\n# Step 2: Convert it to a number\n\n\n# Step 3: Print their age in 10 years\n\n" },
  ],
  "2": [
    { title: "Grade Calculator", prompt: "Ask for a score (0-100) and print the letter grade: A for 90+, B for 80+, C for 70+, D for 60+, F below 60.", starter: "# Exercise 1: Grade Calculator\nscore = int(input(\"Enter your score: \"))\n\n# Use if / elif / else to print the letter grade\n\n" },
    { title: "Even or Odd", prompt: "Ask the user for a number and print whether it is even or odd. Hint: use the % operator.", starter: "# Exercise 2: Even or Odd\n# Ask for a number\n\n\n# Check if it is even or odd and print the answer\n\n" },
  ],
  "3": [
    { title: "Pattern Printer", prompt: "Use a for loop to print a right triangle of stars with 5 rows (1 star, then 2, ... up to 5).", starter: "# Exercise 1: Pattern Printer\n# Use a for loop to print a triangle of stars\n\n" },
    { title: "Countdown", prompt: "Use a while loop to count down from 10 to 1, then print \"Liftoff!\".", starter: "# Exercise 2: Countdown\ncount = 10\n\n# Write a while loop that prints count and makes it smaller\n\n\n# Print Liftoff! at the end\n\n" },
  ],
  "4": [
    { title: "Calculator Function", prompt: "Write a function calculate(a, b, op) that returns the result for +, -, * or /. Test it with a few calls.", starter: "# Exercise 1: Calculator Function\ndef calculate(a, b, op):\n    # Your code here\n    pass\n\nprint(calculate(10, 3, '+'))\nprint(calculate(10, 3, '*'))\n" },
    { title: "Biggest Number", prompt: "Write a function biggest(a, b, c) that returns the largest of three numbers without using max().", starter: "# Exercise 2: Biggest Number\ndef biggest(a, b, c):\n    # Your code here (don't use max!)\n    pass\n\nprint(biggest(4, 9, 2))\n" },
  ],
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
  const weekExercises = exercises[weekId || "1"] || [];
  const [exIdx, setExIdx] = useState(0);
  const ex = weekExercises[exIdx];
  const quiz = quizzes[weekId || "1"] || [];

  // Persist code in localStorage (v2 = no-answers starters, per exercise)
  const storageKey = `k2k_code_v2_week_${weekId}_ex_${exIdx + 1}`;
  const quizKey = `k2k_quiz_v2_week_${weekId}`;

  const [code, setCode] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved || ex?.starter || "";
  });

  useEffect(() => {
    setCode(localStorage.getItem(storageKey) || ex?.starter || "");
    setOutput("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);
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

  // In-person students: auto-sync work to the admin dashboard (debounced)
  useEffect(() => {
    if (!isInPerson()) return;
    const t = setTimeout(() => {
      syncExerciseCode(`${weekId || "1"}.${exIdx + 1}`, code).catch(() => {});
    }, 1500);
    return () => clearTimeout(t);
  }, [code, weekId, exIdx]);

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
