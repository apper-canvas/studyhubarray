import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Layout from "@/components/organisms/Layout";
import Dashboard from "@/components/pages/Dashboard";
import Students from "@/components/pages/Students";
import Classes from "@/components/pages/Classes";
import Grades from "@/components/pages/Grades";
import Attendance from "@/components/pages/Attendance";
import Reports from "@/components/pages/Reports";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="classes" element={<Classes />} />
            <Route path="grades" element={<Grades />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Routes>
        
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </div>
    </BrowserRouter>
  );
}

export default App;