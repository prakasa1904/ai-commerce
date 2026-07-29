import React from 'react'
import ReactDOM from 'react-dom/client'

const App = () => (
  <div style={{ padding: '40px', fontFamily: 'system-ui, sans-serif' }}>
    <h1 style={{ color: '#15803d', fontSize: '2.5rem' }}>Farm Marketplace</h1>
    <p style={{ color: '#57534e', fontSize: '1.2rem' }}>🧑‍🌾 Fresh farm produce delivered to your door</p>
    <div style={{ marginTop: '30px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
      <button style={{ padding: '12px 24px', background: '#15803d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}>Shop Now</button>
      <button style={{ padding: '12px 24px', background: '#fff', border: '2px solid #15803d', color: '#15803d', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}>Sell Products</button>
    </div>
  </div>
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
