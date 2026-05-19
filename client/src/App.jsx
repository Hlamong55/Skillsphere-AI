import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/common/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Feed from "./pages/Feed";

function App() {
  return (
    <BrowserRouter>
      <div
        className="
          min-h-screen
          bg-[#0B1120]
          text-white
          overflow-hidden
        "
      >
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route path="/feed" element={<Feed />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
