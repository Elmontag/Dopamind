import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useRef, useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AppProvider } from "./context/AppContext";
import { I18nProvider } from "./i18n/I18nContext";
import { SettingsProvider } from "./context/SettingsContext";
import { ResourceMonitorProvider } from "./context/ResourceMonitorContext";
import { MailProvider } from "./context/MailContext";
import { CalendarProvider } from "./context/CalendarContext";
import { FocusTimerProvider } from "./context/FocusTimerContext";
import { QuickAddProvider } from "./context/QuickAddContext";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import MobileNav from "./components/MobileNav";
import RewardToast from "./components/RewardToast";
import MicroConfettiManager from "./components/MicroConfettiManager";
import TaskTimerWidget from "./components/TaskTimerWidget";
import GlobalQuickAdd, { QuickAddEnterListener } from "./components/GlobalQuickAdd";
import TriageModal from "./components/TriageModal";
import ActivityBridge from "./components/ActivityBridge";
import HomePage from "./pages/HomePage";
import TasksPage from "./pages/TasksPage";
import PlannerPage from "./pages/PlannerPage";
import MailPage from "./pages/MailPage";
import SettingsPage from "./pages/SettingsPage";
import AchievementsPage from "./pages/AchievementsPage";
// Scroll the main content area to top on every route change
function ScrollToTop({ mainRef }) {
  const { pathname } = useLocation();
  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTo(0, 0);
  }, [pathname, mainRef]);
  return null;
}

function AppLayout() {
  const mainRef = useRef(null);
  return (
    <SettingsProvider>
      <AppProvider>
        <ResourceMonitorProvider>
          <MailProvider>
            <CalendarProvider>
              <FocusTimerProvider>
                <QuickAddProvider>
                  <div className="h-screen flex overflow-hidden">
                    <Sidebar />
                    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                      <Header />
                      <main ref={mainRef} className="flex-1 overflow-y-auto px-4 py-6 pb-24 lg:pb-6 max-w-7xl w-full mx-auto">
                        <ScrollToTop mainRef={mainRef} />
                        <Routes>
                          <Route path="/" element={<HomePage />} />
                          <Route path="/tasks" element={<TasksPage />} />
                          <Route path="/planner" element={<PlannerPage />} />
                          <Route path="/calendar" element={<Navigate to="/planner" replace />} />
                          <Route path="/mail" element={<MailPage />} />
                          <Route path="/settings" element={<SettingsPage />} />
                          <Route path="/achievements" element={<AchievementsPage />} />
                        </Routes>
                      </main>
                      <footer className="hidden lg:block text-center py-4 text-[10px] text-muted-light dark:text-muted-dark">
                        Dopamind &middot; For the ADHD Community
                      </footer>
                    </div>
                    <MobileNav />
                    <RewardToast />
                    <MicroConfettiManager />
                    <TaskTimerWidget />
                    <GlobalQuickAdd />
                    <QuickAddEnterListener />
                    <TriageModal />
                    <ActivityBridge />
                  </div>
                </QuickAddProvider>
              </FocusTimerProvider>
            </CalendarProvider>
          </MailProvider>
        </ResourceMonitorProvider>
      </AppProvider>
    </SettingsProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <I18nProvider>
        <ThemeProvider>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="/register" element={<Navigate to="/" replace />} />
              <Route path="/setup" element={<Navigate to="/" replace />} />
              <Route path="/*" element={<AppLayout />} />
            </Routes>
          </AuthProvider>
        </ThemeProvider>
      </I18nProvider>
    </BrowserRouter>
  );
}
