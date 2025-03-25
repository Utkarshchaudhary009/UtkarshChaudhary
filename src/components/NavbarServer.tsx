import {checkRole} from "@/utils/roles"
import { Navbar } from "./Navbar";

export default async function NavbarServer() {
  const isAdmin =await checkRole("admin") 
  console.log(` isAdmin:${isAdmin}`);
  return <Navbar isAdmin={isAdmin}  />;
}
