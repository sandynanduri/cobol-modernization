
import React from 'react';
import Layout from '@/components/Layout';
import HomePage from '@/components/HomePage';
import AnalyzePage from '@/components/AnalyzePage';
import ConvertPage from '@/components/ConvertPage';
import DashboardPage from '@/components/DashboardPage';
import { useAppStore } from '@/store/appStore';

const Index = () => {
  const { currentStep } = useAppStore();

  const renderCurrentPage = () => {
    switch (currentStep) {
      case 'upload':
        return <HomePage />;
      case 'analyze':
        return <AnalyzePage />;
      case 'convert':
        return <ConvertPage />;
      case 'dashboard':
        return <DashboardPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <Layout>
      {renderCurrentPage()}
    </Layout>
  );
};

export default Index;
