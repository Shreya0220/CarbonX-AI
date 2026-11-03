import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { LoginScreen } from '@/components/layout/login-screen';
import { OverviewPage } from '@/components/pages/overview-page';
import { ProjectsPage } from '@/components/pages/projects-page';
import { ProjectDetailsPage } from '@/components/pages/project-details-page';
import { AiVerificationPage } from '@/components/pages/ai-verification-page';
import { GeoEvidencePage } from '@/components/pages/geo-evidence-page';
import { CarbonAnalysisPage } from '@/components/pages/carbon-analysis-page';
import { RiskPage } from '@/components/pages/risk-page';
import { SimulatorPage } from '@/components/pages/simulator-page';
import { VerifierPage } from '@/components/pages/verifier-page';
import { BlockchainPage } from '@/components/pages/blockchain-page';
import { AnalyticsPage } from '@/components/pages/analytics-page';
import { ReportsPage } from '@/components/pages/reports-page';
import { SettingsPage } from '@/components/pages/settings-page';
import type { PageKey, Role } from '@/lib/types';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState<Role>('Verifier');
  const [page, setPage] = useState<PageKey>('overview');
  const [projectId, setProjectId] = useState<string | undefined>(undefined);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogin = (r: Role) => {
    setRole(r);
    setLoggedIn(true);
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setPage('overview');
    setProjectId(undefined);
  };

  const handleNavigate = (p: PageKey, pid?: string) => {
    setPage(p);
    setProjectId(pid);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!loggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (page) {
      case 'overview':
        return <OverviewPage onNavigate={handleNavigate} />;
      case 'projects':
        return <ProjectsPage onNavigate={handleNavigate} />;
      case 'project-details':
        return <ProjectDetailsPage projectId={projectId || 'CX-2024-001'} onNavigate={handleNavigate} />;
      case 'ai-verification':
        return <AiVerificationPage projectId={projectId} onNavigate={handleNavigate} />;
      case 'geo-evidence':
        return <GeoEvidencePage projectId={projectId} onNavigate={handleNavigate} />;
      case 'carbon-analysis':
        return <CarbonAnalysisPage projectId={projectId} onNavigate={handleNavigate} />;
      case 'risk':
        return <RiskPage onNavigate={handleNavigate} />;
      case 'simulator':
        return <SimulatorPage onNavigate={handleNavigate} />;
      case 'verifier':
        return <VerifierPage projectId={projectId} onNavigate={handleNavigate} />;
      case 'blockchain':
        return <BlockchainPage onNavigate={handleNavigate} />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'reports':
        return <ReportsPage onNavigate={handleNavigate} />;
      case 'settings':
        return <SettingsPage role={role} />;
      default:
        return <OverviewPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        current={page}
        onNavigate={handleNavigate}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="lg:pl-64">
        <Header
          role={role}
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />
        <main className="p-4 sm:p-6 max-w-7xl mx-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
