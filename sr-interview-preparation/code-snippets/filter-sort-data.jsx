// Filter and Sort alhorithms
import { useMemo, useState } from "react";


/**
 * Product shape returned by the API or static data.
 */
type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  inStock: boolean;
};

/**
 * Valid sorting options supported by the UI.
 */
type SortBy = "price-asc" | "price-desc" | "rating-desc" | "name-asc";

/**
 * Example data.
 * In a real app, this could come from an API request.
 */
const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "iPhone 15",
    category: "Phones",
    price: 999,
    rating: 4.8,
    inStock: true,
  },
  {
    id: "2",
    name: "Samsung Galaxy S24",
    category: "Phones",
    price: 899,
    rating: 4.6,
    inStock: true,
  },
  {
    id: "3",
    name: "MacBook Pro",
    category: "Laptops",
    price: 1999,
    rating: 4.9,
    inStock: false,
  },
  {
    id: "4",
    name: "Dell XPS 13",
    category: "Laptops",
    price: 1299,
    rating: 4.5,
    inStock: true,
  },
];

/**
 * Pure function.
 *
 * This function does not depend on React state directly.
 * It receives all the data it needs through parameters and returns a new array.
 *
 * Benefits:
 * - Easy to test
 * - Easy to reuse
 * - Keeps the component focused on UI/state
 * - Avoids mutating the original products array
 */
function getVisibleProducts(
  products: Product[],
  searchTerm: string,
  selectedCategory: string,
  sortBy: SortBy
): Product[] {
  /**
   * Normalize the search term once.
   *
   * trim() removes extra spaces.
   * toLowerCase() makes the search case-insensitive.
   *
   * Example:
   * "  IPHONE " becomes "iphone"
   */
  const normalizedSearch = searchTerm.trim().toLowerCase();

  /**
   * First step: filter the products.
   *
   * We only keep products that:
   * 1. Are in stock
   * 2. Match the search term
   * 3. Match the selected category, if a category is selected
   */
  const filteredProducts = products.filter((product) => {
    /**
     * If the search is empty, we allow all products.
     * Otherwise, the product name must include the search text.
     */
    const matchesSearch =
      normalizedSearch.length === 0 ||
      product.name.toLowerCase().includes(normalizedSearch);

    /**
     * If no category is selected, we allow all categories.
     * Otherwise, the product category must match the selected category.
     */
    const matchesCategory =
      selectedCategory.length === 0 || product.category === selectedCategory;

    /**
     * Final filter condition.
     *
     * The product must be in stock AND match all active filters.
     */
    return product.inStock && matchesSearch && matchesCategory;
  });

  /**
   * Second step: sort the filtered products.
   *
   * Important:
   * sort() mutates the array.
   *
   * We use [...filteredProducts] to create a copy before sorting.
   * This avoids accidental mutation and makes the function safer.
   */
  return [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;

      case "price-desc":
        return b.price - a.price;

      case "rating-desc":
        return b.rating - a.rating;

      case "name-asc":
        return a.name.localeCompare(b.name);

      default:
        return 0;
    }
  });
}

export default function ProductPage() {
  /**
   * Local UI state.
   *
   * These values represent the filters selected by the user.
   */
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("name-asc");

  /**
   * Derived data.
   *
   * We do not store visibleProducts in state because it can be calculated
   * from existing state: products + filters + sort option.
   *
   * useMemo prevents recalculating the list on every render unless one of
   * the dependencies changes.
   */
  const visibleProducts = useMemo(() => {
    return getVisibleProducts(
      PRODUCTS,
      searchTerm,
      selectedCategory,
      sortBy
    );
  }, [searchTerm, selectedCategory, sortBy]);

  return (
    <main>
      <h1>Products</h1>

      {/* Search input */}
      <label>
        Search by name
        <input
          type="text"
          value={searchTerm}
          placeholder="Search products..."
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </label>

      {/* Category filter */}
      <label>
        Category
        <select
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
        >
          <option value="">All categories</option>
          <option value="Phones">Phones</option>
          <option value="Laptops">Laptops</option>
        </select>
      </label>

      {/* Sort filter */}
      <label>
        Sort by
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as SortBy)}
        >
          <option value="name-asc">Name A-Z</option>
          <option value="price-asc">Price low to high</option>
          <option value="price-desc">Price high to low</option>
          <option value="rating-desc">Highest rating</option>
        </select>
      </label>

      {/* Results */}
      <section>
        <h2>Results: {visibleProducts.length}</h2>

        {visibleProducts.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <ul>
            {visibleProducts.map((product) => (
              <li key={product.id}>
                <article>
                  <h3>{product.name}</h3>
                  <p>Category: {product.category}</p>
                  <p>Price: ${product.price}</p>
                  <p>Rating: {product.rating}</p>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
