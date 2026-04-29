import Dashboard from "./pages/Dashboard";
import CreateSession from "./pages/CreateSession";
import SessionsHistory from "./pages/SessionsHistory";
import User from "./pages/User";
import Session from "./pages/Session";
import NavBar from "./components/NavBar";
import { Navigate, Routes, Route, useParams } from "react-router-dom";

function SessionRoute() {
  const { sessionId } = useParams();
  return <Session key={sessionId} />;
}

function App() {
  return (
    <div className="App">
      <NavBar></NavBar>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sessions-history" element={<SessionsHistory />} />
          <Route path="/user" element={<User />} />
          <Route path="/create-session" element={<CreateSession />} />
          <Route path="/session/:sessionId" element={<SessionRoute />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

