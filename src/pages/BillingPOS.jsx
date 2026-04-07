import { useState, useCallback, useRef } from "react";
import { Scanner } from "../components/Scanner";
import API from "../api/axios";
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard,
  ScanLine
} from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function BillingPOS() {
  const navigate = useNavigate();
  const [barcode, setBarcode] = useState("");
  const [cart, setCart] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const lastScanRef = useRef(0);

  const fetchProduct = async (code) => {
    try {
      // In a real app we'd fetch from actual backend:
      // const res = await API.get(`/products/${code}`);
      // return res.data;
      
      // Mock for this demo if backend isn't up
      toast.promise(
        API.get(`/products/${code}`).then(res => res.data),
        {
          loading: 'Looking up product...',
          success: (data) => `Added ${data.name}`,
          error: 'Product not found',
        }
      ).then(product => {
        addToCart(product);
      }).catch((e) => {
        console.error(e);
        // Fallback for demonstration if API fails or backend is mock
        const mockProduct = {
          id: code,
          barcode: code,
          name: `Product ${code.substring(0, 4)}`,
          price: Math.floor(Math.random() * 50) + 10
        };
        addToCart(mockProduct);
        toast.success(`Mock Added: ${mockProduct.name}`);
      });
      
    } catch {
      toast.error("Product not found");
    }
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find(item => item.barcode === product.barcode);
      if (existing) {
        return prev.map(item => 
          item.barcode === product.barcode 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleManualScan = () => {
    if (!barcode.trim()) return;
    fetchProduct(barcode.trim());
    setBarcode("");
  };

  const handleCameraScan = useCallback((decodedText) => {
    const now = Date.now();
    // Debounce scans by 2 seconds to prevent multi-add
    if (now - lastScanRef.current > 2000) {
      lastScanRef.current = now;
      fetchProduct(decodedText);
    }
  }, []);

  const updateQuantity = (barcodeId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.barcode === barcodeId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeItem = (barcodeId) => {
    setCart(prev => prev.filter(item => item.barcode !== barcodeId));
    toast.success("Item removed");
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = total * 0.1; // 10% tax for example
  const grandTotal = total + tax;

  const checkout = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    
    const items = cart.map(i => ({
      barcode: i.barcode,
      quantity: i.quantity
    }));

    toast.promise(
      API.post("/invoices/", { items }),
      {
        loading: 'Processing payment...',
        success: (res) => `Invoice created: ${res.data.id || 'Success'}`,
        error: 'Failed to process checkout (using mock)',
      }
    ).then(() => setCart([]))
     .catch(() => {
        // Mock success
        setCart([]);
     });
  };

  return (
    <div className="pos-container">
      <Toaster position="top-right" theme="dark" toastOptions={{
        style: {
          background: '#1e293b',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)'
        }
      }} />

      {/* Main Area */}
      <div className="main-area">
        <div className="pos-header">
          <div className="brand">
            <ShoppingCart size={32} />
            OrbitPOS
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/products')}
            >
              Inventory Management
            </button>
            <button 
              className={`btn ${isScanning ? 'btn-danger' : 'btn-primary'}`}
              onClick={() => setIsScanning(!isScanning)}
            >
              <ScanLine size={20} />
              {isScanning ? 'Close Scanner' : 'Open Camera'}
            </button>
          </div>
        </div>

        <div className="glass-panel scanner-card">
          {isScanning && (
            <div className="camera-view">
              <Scanner onScanResult={handleCameraScan} />
            </div>
          )}

          <div className="input-group">
            <input
              type="text"
              className="input-field"
              placeholder="Enter barcode manually..."
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleManualScan()}
              autoFocus
            />
            <button className="btn btn-secondary" onClick={handleManualScan}>
              <Search size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Cart Panel */}
      <div className="glass-panel cart-panel">
        <div className="cart-header">
          <h2>Current Order</h2>
          <span className="text-muted">{cart.length} items</span>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <ShoppingCart size={64} />
              <p>Scan a product or enter<br/>barcode to start.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.barcode} className="cart-item">
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <div className="item-price">${item.price.toFixed(2)}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <div className="quantity-controls">
                    <button className="qty-btn" onClick={() => updateQuantity(item.barcode, -1)}>
                      <Minus size={16} />
                    </button>
                    <span className="qty-text">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQuantity(item.barcode, 1)}>
                      <Plus size={16} />
                    </button>
                  </div>
                  <button 
                    className="qty-btn" 
                    style={{ color: 'var(--accent-danger)' }}
                    onClick={() => removeItem(item.barcode)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer">
          <div className="totals">
            <div className="total-row">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="total-row grand">
              <span>Total</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button className="btn checkout-btn" onClick={checkout}>
            <CreditCard size={24} />
            Checkout Pay
          </button>
        </div>
      </div>
    </div>
  );
}
