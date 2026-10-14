
import { useState, useEffect } from "react";
import "./App.css";

const API_URL = "http://localhost:8080/api/products";

const categories = ["Shirts", "Jackets", "Dresses", "Shoes", "Accessories"];

const categoryEmoji = {
  Shirts: "👕",
  Jackets: "🧥",
  Dresses: "👗",
  Shoes: "👟",
  Accessories: "👜",
};

function App() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "Shirts",
    price: "",
    condition: "Good",
  });

  // Load products from Spring Boot and MySQL
  async function loadProducts() {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Could not load products.");
      }

      const data = await response.json();

      setProducts(
        data.map((product) => ({
          ...product,
          emoji: categoryEmoji[product.category] || "♻️",
        }))
      );
    } catch (error) {
      setMessage(
        "Cannot connect to the backend. Make sure Spring Boot is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  // Save product in MySQL through Spring Boot
  async function handleSubmit(event) {
    event.preventDefault();

    const name = form.name.trim();
    const price = Number(form.price);

    if (!name || !Number.isFinite(price) || price <= 0) {
      setMessage("Please enter a product name and a valid price.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          category: form.category,
          price,
          condition: form.condition,
        }),
      });

      if (!response.ok) {
        throw new Error("Product could not be saved.");
      }

      const savedProduct = await response.json();

      setProducts((previous) => [
        {
          ...savedProduct,
          emoji: categoryEmoji[savedProduct.category] || "♻️",
        },
        ...previous,
      ]);

      setForm({
        name: "",
        category: "Shirts",
        price: "",
        condition: "Good",
      });

      setShowForm(false);
      setSearch("");
      setCategory("All");
      setMessage("Product saved successfully in MySQL!");

      document.getElementById("shop")?.scrollIntoView({
        behavior: "smooth",
      });
    } catch (error) {
      setMessage(
        "Could not save product. Check that Spring Boot and MySQL are running."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleInterest(product) {
    setMessage(
      `You are interested in ${product.name}. Seller contact and purchase features will be added next.`
    );
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || product.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="app">
      <header className="navbar">
        <a className="logo" href="#home">
          ♻ Rewear<span>AI</span>
        </a>

        <nav>
          <a href="#home">Home</a>
          <a href="#shop">Explore Clothes</a>
          <a href="#about">About Us</a>
        </nav>

        <button
          className="sell-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "✕ Close Form" : "+ List Your Clothes"}
        </button>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <p className="eyebrow">♻ FASHION WITH A SECOND LIFE</p>
            <h1>Wear Again.<br />Waste Less.</h1>
            <p className="hero-text">
              Give your pre-loved clothes a new home.
              Discover affordable fashion and make every outfit count.
            </p>

            <a className="primary-btn" href="#shop">
              Explore Collection →
            </a>

            <div className="hero-stats">
              <div>
                <strong>{products.length}+</strong>
                <span>Listed items</span>
              </div>
              <div>
                <strong>100%</strong>
                <span>Reuse mindset</span>
              </div>
              <div>
                <strong>₹₹</strong>
                <span>Budget friendly</span>
              </div>
            </div>
          </div>

          <div className="hero-art">
            <div className="circle circle-one"></div>
            <div className="circle circle-two"></div>
            <div className="fashion-emoji">👚</div>
            <div className="floating-card">🌱 Sustainable style</div>
            <div className="floating-card second-card">
              ✨ Find your next favourite
            </div>
          </div>
        </section>

        {showForm && (
          <section className="listing-section" id="listing-form">
            <h2>List Your Clothing</h2>
            <p>Fill in the details to give your clothes a new home.</p>

            <form className="listing-form" onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Product name"
                value={form.name}
                onChange={updateForm}
                maxLength={80}
                required
              />

              <select
                name="category"
                value={form.category}
                onChange={updateForm}
              >
                {categories.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>

              <input
                type="number"
                name="price"
                placeholder="Price (₹)"
                min="1"
                max="1000000"
                step="1"
                value={form.price}
                onChange={updateForm}
                required
              />

              <select
                name="condition"
                value={form.condition}
                onChange={updateForm}
              >
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>

              <button
                className="primary-btn"
                type="submit"
                disabled={saving}
              >
                {saving ? "Saving..." : "Publish Listing"}
              </button>
            </form>
          </section>
        )}

        {message && (
          <div className="notice" role="status">
            <span>{message}</span>
            <button
              type="button"
              aria-label="Dismiss message"
              onClick={() => setMessage("")}
            >
              ✕
            </button>
          </div>
        )}

        <section className="shop-section" id="shop">
          <div className="section-heading">
            <div>
              <p className="eyebrow">PRE-LOVED, RE-LOVED</p>
              <h2>Explore the Collection</h2>
              <p>Good style deserves another story.</p>
            </div>
            <span className="item-count">
              {filteredProducts.length} items
            </span>
          </div>

          <div className="filters">
            <input
              className="search-input"
              type="search"
              placeholder="🔍 Search clothing..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              aria-label="Filter by category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="All">All Categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="empty-state">Loading products...</p>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <article className="product-card" key={product.id}>
                  <div className="product-image">
                    <span className="condition">
                      {product.condition}
                    </span>
                    <span className="product-emoji">
                      {product.emoji || "♻️"}
                    </span>
                    <span className="recycle-tag">♻ Rewear</span>
                  </div>

                  <div className="product-info">
                    <p className="product-category">
                      {product.category}
                    </p>
                    <h3>{product.name}</h3>
                    <div className="product-bottom">
                      <strong>₹{product.price}</strong>
                      <button onClick={() => handleInterest(product)}>
                        I'm Interested ↗
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!loading && filteredProducts.length === 0 && (
            <p className="empty-state">
              No products found. Add a listing or try another search.
            </p>
          )}
        </section>

        <section className="about-section" id="about">
          <span className="about-icon">🌍</span>
          <p className="eyebrow">SMALL CHOICES, BIG IMPACT</p>
          <h2>Fashion can be kind to the planet.</h2>
          <p>
            Rewear AI encourages clothing reuse by helping people discover
            pre-loved fashion instead of letting usable clothes go to waste.
          </p>
          <button
            className="primary-btn"
            onClick={() => {
              setShowForm(true);
              document.getElementById("listing-form")?.scrollIntoView({
                behavior: "smooth",
              });
            }}
          >
            Give Clothes a Second Life
          </button>
        </section>
      </main>

      <footer>
        <a className="logo" href="#home">
          ♻ Rewear<span>AI</span>
        </a>
        <p>Reuse more. Waste less. Look good doing it.</p>
        <span>© 2026 Rewear AI</span>
      </footer>
    </div>
  );
}

export default App;
