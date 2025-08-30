import { DashboardPage } from '@/components/dashboard-page';
import { Header } from '@/components/layout/header';

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">
        <DashboardPage />
      </main>
    </div>
  );
}
