import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    barcode: "",
    price: "",
    stock: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  // 🔄 Load products
  const fetchProducts = async () => {
    try {
      const res = await API.get("/products/");
      setProducts(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ✏️ Handle input
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // ➕ Add product
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await API.post("/products/", {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock)
      });

      alert("Product added ✅");

      setForm({
        name: "",
        barcode: "",
        price: "",
        stock: ""
      });

      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.detail || "Error adding product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pos-container" style={{ gridTemplateColumns: "1fr" }}>
      <div className="main-area glass-panel" style={{ padding: "32px", maxHeight: "100vh" }}>
        
        <div className="pos-header">
          <h1 className="brand">
            <svg 
              className="icon" 
              style={{ width: 28, height: 28 }} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Product Management
          </h1>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/')}
          >
            Back to POS
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '32px' }}>
          
          {/* Form Section */}
          <div className="glass-panel" style={{ padding: '24px', height: 'fit-content' }}>
            <h2 style={{ marginBottom: '24px', fontSize: '1.25rem' }}>Add New Product</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="input-field" style={{ padding: '0', display: 'flex' }}>
                <input
                  name="name"
                  placeholder="Product Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  style={{ background: 'transparent', border: 'none', color: 'white', padding: '14px 16px', width: '100%', outline: 'none', fontSize: '1rem' }}
                />
              </div>

              <div className="input-field" style={{ padding: '0', display: 'flex' }}>
                <input
                  name="barcode"
                  placeholder="Barcode"
                  value={form.barcode}
                  onChange={handleChange}
                  required
                  style={{ background: 'transparent', border: 'none', color: 'white', padding: '14px 16px', width: '100%', outline: 'none', fontSize: '1rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-field" style={{ padding: '0', display: 'flex' }}>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={form.price}
                    onChange={handleChange}
                    required
                    style={{ background: 'transparent', border: 'none', color: 'white', padding: '14px 16px', width: '100%', outline: 'none', fontSize: '1rem' }}
                  />
                </div>

                <div className="input-field" style={{ padding: '0', display: 'flex' }}>
                  <input
                    name="stock"
                    type="number"
                    placeholder="Stock"
                    value={form.stock}
                    onChange={handleChange}
                    required
                    style={{ background: 'transparent', border: 'none', color: 'white', padding: '14px 16px', width: '100%', outline: 'none', fontSize: '1rem' }}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }} disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Product'}
              </button>
            </form>
          </div>

          {/* List Section */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ marginBottom: '24px', fontSize: '1.25rem' }}>Inventory Overview</h2>
            
            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr', padding: '16px', borderBottom: '1px solid var(--border-glass)', fontWeight: '600', color: 'var(--text-muted)' }}>
                <div>Product</div>
                <div>Barcode</div>
                <div>Price</div>
                <div>Stock</div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                {products.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                     No products available.
                  </div>
                ) : (
                  products.map((p) => (
                    <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr', padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
                      <div style={{ fontWeight: '500' }}>{p.name}</div>
                      <div style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{p.barcode}</div>
                      <div style={{ color: 'var(--accent-success)', fontWeight: '600' }}>
                        ${p.price && typeof p.price === 'number' ? p.price.toFixed(2) : p.price}
                      </div>
                      <div style={{ color: 'white' }}>{p.stock !== undefined ? p.stock : '-'}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Products;
