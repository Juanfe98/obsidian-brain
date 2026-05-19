# Filter + Sort Derived List

Use this pattern when you have original data and need to display a filtered/sorted version.

```ts
import { useMemo, useState } from "react";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
};

const PRODUCTS: Product[] = [
  { id: "1", name: "MacBook Pro", category: "laptop", price: 2200 },
  { id: "2", name: "iPhone", category: "phone", price: 999 },
  { id: "3", name: "Dell XPS", category: "laptop", price: 1800 },
  { id: "4", name: "Samsung Galaxy", category: "phone", price: 899 },
];

type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc";

export default function ProductList() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");

  // Extract categories from the data.
  // This avoids hardcoding dropdown values.
  const categories = useMemo(() => {
    return Array.from(
      new Set(PRODUCTS.map((product) => product.category)),
    ).sort();
  }, []);

  // Derived list:
  // We do not store this in state because it can be calculated from:
  // PRODUCTS + search + selectedCategory + sortBy
  const visibleProducts = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();

    return [...PRODUCTS]
      .filter((product) => {
        const matchesSearch = product.name
          .toLowerCase()
          .includes(normalizedSearch);

        const matchesCategory =
          selectedCategory === "" || product.category === selectedCategory;

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        // Important: sort mutates the array.
        // That is why we used [...PRODUCTS] before filtering/sorting.

        if (sortBy === "name-asc") {
          return a.name.localeCompare(b.name);
        }

        if (sortBy === "name-desc") {
          return b.name.localeCompare(a.name);
        }

        if (sortBy === "price-asc") {
          return a.price - b.price;
        }

        if (sortBy === "price-desc") {
          return b.price - a.price;
        }

        return 0;
      });
  }, [search, selectedCategory, sortBy]);

  return (
    <section>
      <h2>Products</h2>

      <input
        value={search}
        placeholder="Search products"
        onChange={(event) => setSearch(event.target.value)}
      />

      <select
        value={selectedCategory}
        onChange={(event) => setSelectedCategory(event.target.value)}
      >
        <option value="">All categories</option>

        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <select
        value={sortBy}
        onChange={(event) => setSortBy(event.target.value as SortOption)}
      >
        <option value="name-asc">Name: A-Z</option>
        <option value="name-desc">Name: Z-A</option>
        <option value="price-asc">Price: Low to high</option>
        <option value="price-desc">Price: High to low</option>
      </select>

      <p>
        Showing {visibleProducts.length} of {PRODUCTS.length} products
      </p>

      {visibleProducts.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <ul>
          {visibleProducts.map((product) => (
            <li key={product.id}>
              <strong>{product.name}</strong> - {product.category} - $
              {product.price}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
```
