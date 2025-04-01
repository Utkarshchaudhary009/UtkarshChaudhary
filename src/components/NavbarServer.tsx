import { checkRoleClerk } from "@/utils/roles";
import { Navbar } from "./Navbar";

export default async function NavbarServer() {
  const isAdmin = await checkRoleClerk("admin");
  console.log(` isAdmin:${isAdmin}`);
  return <Navbar isAdmin={isAdmin} />;
}
