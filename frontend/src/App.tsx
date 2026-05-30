import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";

export default function App() {
  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Header />
      <main style={{ flex: 1 }}>
        <div className="container">
            <h2>Shashank</h2>
          <Home />
        </div>
      </main>
      <Footer />
    </div>
  );
}
