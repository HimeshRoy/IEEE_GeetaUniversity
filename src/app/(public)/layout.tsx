import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import MaintenanceScreen from "@/components/maintenance/MaintenanceScreen";
import { getMaintenanceStatus } from "@/lib/maintenance";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const maintenance = await getMaintenanceStatus();

  if (maintenance?.enabled) {
    return <MaintenanceScreen />;
  }

  return (
    <>
      <Navbar />

      <main>{children}</main>

      <Footer />
    </>
  );
}