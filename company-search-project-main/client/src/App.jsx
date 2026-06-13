import { useState, useEffect } from "react";
import "./App.css";


function App() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  async function handleSearch(targetPage = page) {
    const response = await fetch("http://localhost:3002/api/companies", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        search,
        page: targetPage,
        pageSize: 20,
      }),
    });

    const result = await response.json();

    setData(result.companies || []);
    setTotal(result.total || 0);
  }

  useEffect(() => {
    if (search.trim().length >= 3) {
      handleSearch(page);
    }
  }, [page]);

  return (
    <div>
      <h1>Företagssök</h1>

      <input
        type="text"
        placeholder="Sök företag"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <button
        onClick={() => {
          setPage(1);
          handleSearch(1);
        }}
      >
        Sök
      </button>

      <p>Antal träffar: {total}</p>

      {data.map((company) => (
        <div key={company.OrgNr}>
          <h3>{company["Företagsnamn"]}</h3>
          <p>Org.nr: {company.OrgNr}</p>
          <p>Kommun: {company["Säteskommun"]}</p>
          <p>Ort: {company.PostOrt}</p>
        </div>
      ))}

      <div>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Föregående
        </button>

        <span> Sida {page} </span>

        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={page * 20 >= total}
        >
          Nästa
        </button>
      </div>
    </div>
  );
}

export default App;