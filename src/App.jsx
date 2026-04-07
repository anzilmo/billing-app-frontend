import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BillingPOS from './pages/BillingPOS';
import Products from './pages/Products';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BillingPOS />} />
        <Route path="/products" element={<Products />} />
      </Routes>
    </Router>
  );
}

export default App;
