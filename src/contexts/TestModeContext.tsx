import { createContext, useContext, useState, ReactNode } from "react";

interface TestModeContextType {
  isTestMode: boolean;
  setIsTestMode: (value: boolean) => void;
}

const TestModeContext = createContext<TestModeContextType | undefined>(undefined);

export function TestModeProvider({ children }: { children: ReactNode }) {
  const [isTestMode, setIsTestMode] = useState(false);

  return (
    <TestModeContext.Provider value={{ isTestMode, setIsTestMode }}>
      {children}
    </TestModeContext.Provider>
  );
}

export function useTestMode() {
  const context = useContext(TestModeContext);
  if (context === undefined) {
    throw new Error("useTestMode must be used within a TestModeProvider");
  }
  return context;
}