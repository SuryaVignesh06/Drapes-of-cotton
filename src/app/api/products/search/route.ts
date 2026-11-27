import { NextRequest, NextResponse } from "next/server";
import { searchCatalogProducts } from "@/lib/services/product.service";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  if (query.trim().length === 0) {
    return NextResponse.json({ results: [] });
  }

  const results = await searchCatalogProducts(query, 6);
  return NextResponse.json({
    results: results.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      price: item.price,
      fabric: item.fabric,
      color: item.color,
      imageUrl: item.images[0]?.imageUrl ?? "/images/products/kora-ivory-olive-main.jpg",
      imageAlt: item.images[0]?.altText ?? item.name,
    })),
  });
}
