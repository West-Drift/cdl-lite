// app/(app)/layout.tsx
import { AuthProvider } from "@/components/AuthProvider";
import Sidebar from "@/components/Sidebar";
import "@/app/globals.css";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-background">{children}</main>
      </div>
    </AuthProvider>
  );
}
