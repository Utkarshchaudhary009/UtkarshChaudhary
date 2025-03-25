import Footer from "@/components/footer";
import NavbarServer from "@/components/NavbarServer";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='px-12'>
      <NavbarServer />
      <div className='py-12'>{children}</div>
      <Footer />
    </div>
  );
}
