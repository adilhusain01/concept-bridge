import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import { WalletProvider } from "./contexts/WalletContext";
import Loader from "./components/Loader";
import { ContractProvider } from "./contexts/ContractContext";

// Lazy load components
const Home = lazy(() => import("./components/Home"));
const MindMap = lazy(() => import("./components/MindMap"));
const UserProfile = lazy(() => import("./components/UserProfile"));

export default function App() {
  return (
    <ContractProvider>
      <WalletProvider>
        <Router>
          <Navbar />
          <div className="pt-16">
            <Suspense fallback={<Loader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/mindmap" element={<MindMap />} />
                <Route path="/profile" element={<UserProfile />} />
              </Routes>
            </Suspense>
          </div>
        </Router>
      </WalletProvider>
    </ContractProvider>
  );
}
