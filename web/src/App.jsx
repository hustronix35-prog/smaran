import { Route, Routes } from "react-router-dom";
import Shell from "./components/Shell.jsx";
import Home from "./pages/Home.jsx";
import Upload from "./pages/Upload.jsx";
import Goal from "./pages/Goal.jsx";
import Plan from "./pages/Plan.jsx";
import Recall from "./pages/Recall.jsx";
import Progress from "./pages/Progress.jsx";
import Library from "./pages/Library.jsx";
import Settings from "./pages/Settings.jsx";
import Teach from "./pages/Teach.jsx";

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/goal" element={<Goal />} />
        <Route path="/plan" element={<Plan />} />
        <Route path="/recall" element={<Recall />} />
        <Route path="/teach/:unitId" element={<Teach />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/library" element={<Library />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Shell>
  );
}
