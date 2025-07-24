import Link from "next/link";
import { DashboardNav } from "@/components/DashboardNav";
import { AdminGuard } from "@/components/AuthGuard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminGuard>
        <div className="min-h-screen bg-gray-100">
          <DashboardNav />
          <main className="py-10">
            <div className="max-w-screen-lg mx-auto px-4">
              {children}
            </div>
          </main>
        </div>
      </AdminGuard>
    </>
  );
} 