import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import AdminClient from "./components/AdminClient";
import ClientLogin from "./components/ClientLogin";
import ClientGallery from "./components/ClientGallery";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/login" />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/client/:id" element={<AdminClient />} />
        
        <Route path="/client/login" element={<ClientLogin />} />
        <Route path="/client" element={<ClientGallery />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
