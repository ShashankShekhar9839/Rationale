import Button from "../components/Button";
import { useHealth } from "../hooks/useHealth";

export default function Home() {
  const { data, isLoading, error } = useHealth();

  return (
    <div>
      <h1>Welcome to Rationale</h1>
      <div className="card">
        {isLoading && <div>Loading status...</div>}
        {error && <div>Failed to load status</div>}
        {data && <div>API status: {data.status ?? JSON.stringify(data)}</div>}
      </div>
      <div style={{ marginTop: 12 }}>
        <Button onClick={() => alert("Demo")}>Demo Button</Button>
      </div>
    </div>
  );
}
