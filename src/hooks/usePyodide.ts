import { useState, useRef, useCallback } from "react";

interface PyodideInstance {
  runPythonAsync: (code: string) => Promise<any>;
  setStdout: (options: { batched: (text: string) => void }) => void;
  setStderr: (options: { batched: (text: string) => void }) => void;
}

declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<PyodideInstance>;
  }
}

export const usePyodide = () => {
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const pyodideRef = useRef<PyodideInstance | null>(null);

  const loadPyodideRuntime = useCallback(async () => {
    if (pyodideRef.current) return pyodideRef.current;
    setLoading(true);

    // Load the Pyodide script if not already loaded
    if (!window.loadPyodide) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Pyodide"));
        document.head.appendChild(script);
      });
    }

    const pyodide = await window.loadPyodide!({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.5/full/",
    });

    pyodideRef.current = pyodide;
    setLoading(false);
    setReady(true);
    return pyodide;
  }, []);

  const runCode = useCallback(async (code: string): Promise<string> => {
    const pyodide = await loadPyodideRuntime();
    let output = "";

    pyodide.setStdout({
      batched: (text: string) => { output += text + "\n"; },
    });
    pyodide.setStderr({
      batched: (text: string) => { output += "[Error] " + text + "\n"; },
    });

    try {
      // Wrap input() to return empty string (can't do interactive input in browser)
      await pyodide.runPythonAsync(`
import builtins
_original_input = builtins.input
def _mock_input(prompt=""):
    print(prompt, end="")
    return ""
builtins.input = _mock_input
`);
      const result = await pyodide.runPythonAsync(code);
      if (result !== undefined && result !== null) {
        output += String(result);
      }
    } catch (err: any) {
      output += err.message || String(err);
    }

    return output.trim();
  }, [loadPyodideRuntime]);

  return { runCode, loading, ready };
};
