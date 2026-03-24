import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import JoinPage from "./pages/JoinPage";
import StudentApplication from "./pages/join/StudentApplication";
import VolunteerApplication from "./pages/join/VolunteerApplication";
import StudentLayout from "./components/StudentLayout";
import StudentHome from "./pages/student/StudentHome";
import WeekContent from "./pages/student/WeekContent";
import WeekExercise from "./pages/student/WeekExercise";
import StudentMeetings from "./pages/student/StudentMeetings";
import TeacherLayout from "./components/TeacherLayout";
import TeacherHome from "./pages/teacher/TeacherHome";
import TeacherMeetings from "./pages/teacher/TeacherMeetings";
import TeacherManage from "./pages/teacher/TeacherManage";
import TeacherContent from "./pages/teacher/TeacherContent";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminContent from "./pages/admin/AdminContent";
import AdminPairing from "./pages/admin/AdminPairing";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/join" element={<JoinPage />} />
            <Route path="/join/student" element={<StudentApplication />} />
            <Route path="/join/volunteer" element={<VolunteerApplication />} />

            <Route path="/student" element={<StudentLayout />}>
              <Route index element={<StudentHome />} />
              <Route path="week/:weekId/content" element={<WeekContent />} />
              <Route path="week/:weekId/exercise" element={<WeekExercise />} />
              <Route path="meetings" element={<StudentMeetings />} />
            </Route>

            <Route path="/teacher" element={<TeacherLayout />}>
              <Route index element={<TeacherHome />} />
              <Route path="content" element={<TeacherContent />} />
              <Route path="meetings" element={<TeacherMeetings />} />
              <Route path="manage" element={<TeacherManage />} />
            </Route>

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="pairing" element={<AdminPairing />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
