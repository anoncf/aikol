import "./App.css";
import Agents from "./Agents";
import { Routes, Route, Outlet } from "react-router-dom";
import { AboutPage } from "./pages/about-page";

function Layout() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <Agents />
            <Outlet />
        </div>
    );
}

function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<Agents />} />
                <Route path=":agentId">
                    <Route path="chat" element={<Agents />} />
                    <Route path="character" element={<Agents />} />
                    <Route path="about" element={<AboutPage />} />
                </Route>
            </Route>
        </Routes>
    );
}

export default App;
