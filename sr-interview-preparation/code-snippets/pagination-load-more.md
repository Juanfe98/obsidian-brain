# Pagination / Load More Pattern

Use this pattern when the API returns data in pages and the user can load more results.

```ts
import { useEffect, useState } from "react";

type Product = {
  id: string;
  name: string;
  price: number;
};

type ProductsResponse = {
  items: Product[];
  nextPage: number | null;
};

async function fetchProducts(page: number): Promise<ProductsResponse> {
  const response = await fetch(`/api/products?page=${page}`);

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);

  const [nextPage, setNextPage] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasMore = nextPage !== null;

  useEffect(() => {
    const controller = new AbortController();

    const loadProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/products?page=${page}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data: ProductsResponse = await response.json();

        setProducts((prev) => {
          // Page 1 replaces the list.
          // Other pages append to the current list.
          if (page === 1) {
            return data.items;
          }

          return [...prev, ...data.items];
        });

        setNextPage(data.nextPage);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        setError("Could not load products");
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();

    return () => {
      controller.abort();
    };
  }, [page]);

  const handleLoadMore = () => {
    if (nextPage === null) {
      return;
    }

    setPage(nextPage);
  };

  if (products.length === 0 && isLoading) {
    return <p>Loading products...</p>;
  }

  if (products.length === 0 && error) {
    return <p>{error}</p>;
  }

  return (
    <section>
      <h2>Products</h2>

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <ul>
          {products.map((product) => (
            <li key={product.id}>
              <strong>{product.name}</strong> - ${product.price}
            </li>
          ))}
        </ul>
      )}

      {error && <p>{error}</p>}

      {hasMore && (
        <button onClick={handleLoadMore} disabled={isLoading}>
          {isLoading ? "Loading..." : "Load more"}
        </button>
      )}
    </section>
  );
}
```
