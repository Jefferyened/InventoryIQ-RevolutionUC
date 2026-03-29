import { useState, useEffect } from 'react'
import './App.css'

function App() {
  // This variable holds your inventory data once it arrives from Python
  const [inventory, setInventory] = useState({})

  // useEffect is a React hook that runs exactly once when the page loads
  useEffect(() => {
    // 1. Ask Python for the data
    fetch('http://localhost:5000/api/inventory')
      .then(response => response.json())
      // 2. Save the data into our React state
      .then(data => setInventory(data))
      .catch(error => console.error("Error fetching data:", error))
  }, [])

  return (
    <div className="app-container">
      <h1>🍔 Restaurant Management System</h1>
      
      <div className="table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Unit</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {/* We loop through your Python dictionary using Object.entries */}
            {Object.entries(inventory).map(([id, info]) => (
              <tr key={id}>
                <td><strong>{id}</strong></td>
                <td>{info.name}</td>
                <td>{info.category}</td>
                <td>{info.quantity}</td>
                <td>{info.unit}</td>
                <td>
                  {info.quantity <= info.reorder_threshold 
                    ? "⚠️ LOW" 
                    : "✅ OK"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default App