# Custome Card (Product Card)

## Product Card Implementation

Component that will probably be render inside a flex or grid container by iterating

```ts
type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  imageUrl: string;
};

type ProductCardProps = {
  product: Product;
};

.product-card {
  border: 1px solid #ddd;
  border-radius: 12px;
  overflow: hidden;
  background: white;
}

.product-card__image {
  width: 100%;
  height: 140px;
  object-fit: cover;
}

.product-card__content {
  padding: 16px;
  display: grid;
  gap: 8px;
}

function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="product-card">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="product-card__image"
      />

      <div className="product-card__content">
        <header>
          <h3>{product.name}</h3>
          <p>{product.category}</p>
        </header>

        <p>${product.price}</p>
        <p>Rating: {product.rating}</p>

        <footer>
          <button type="button">View details</button>
        </footer>
      </div>
    </article>
  );
}
```

## Parent (Container)

```ts
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}
function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return <p>No products found.</p>;
  }

  return (
    <section>
      <h2>Products</h2>

      <div className="cards-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

```

# List

```ts
type User = {
  id: string;
  name: string;
  email: string;
};

function UserList({ users }: { users: User[] }) {
  if (users.length === 0) {
    return <p>No users found.</p>;
  }

.user-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 8px;
}

.user-list__item {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
  return (
    <section>
      <h2>Users</h2>

      <ul className="user-list">
        {users.map((user) => (
          <li key={user.id} className="user-list__item">
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

# Table Layout

```ts
type ProductTableProps = {
  products: Product[];
};

function ProductTable({ products }: ProductTableProps) {
  if (products.length === 0) {
    return <p>No products found.</p>;
  }
.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.products-table {
  width: 100%;
  border-collapse: collapse;
}

.products-table th,
.products-table td {
  padding: 12px;
  border-bottom: 1px solid #ddd;
  text-align: left;
}

.products-table th {
  font-weight: 600;
}

  return (
    <section>
      <h2>Product Table</h2>

      <div className="table-wrapper">
        <table className="products-table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Category</th>
              <th scope="col">Price</th>
              <th scope="col">Rating</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>${product.price}</td>
                <td>{product.rating}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
```

# Sidebar Layout with Grid

```ts
function ProductsWithSidebar({ products }: { products: Product[] }) {
.layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 24px;
  padding: 24px;
}

.sidebar {
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 16px;
  align-self: start;
}

.content {
  min-width: 0;
}

@media (max-width: 768px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
  return (
    <main className="layout">
      <aside className="sidebar">
        <h2>Filters</h2>

        <label>
          Search
          <input type="text" />
        </label>

        <label>
          Category
          <select>
            <option value="">All</option>
            <option value="Tech">Tech</option>
            <option value="Furniture">Furniture</option>
          </select>
        </label>
      </aside>

      <section className="content">
        <h1>Products</h1>

        <div className="cards-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}

```
