import { Outlet } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";

function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden">
      <Navbar />

      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default MainLayout;
