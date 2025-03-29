import Footer from "@/components/footer";
import NavbarServer from "@/components/NavbarServer";
import Copilot from "@/components/Copilot";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='px-12'>
      <NavbarServer />
      <div className='py-12'>{children}</div>
      <Copilot />
      <Footer />
    </div>
  );
}
