import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import MapArea from "./components/MapArea";
import DataPanel from "./components/DataPanel";
import "./App.css";

function App() {
  return (
    <div className="dashboard">
      <Sidebar />
      <Topbar />
      <MapArea />
      <DataPanel />
    </div>
  );
}

export default App;
