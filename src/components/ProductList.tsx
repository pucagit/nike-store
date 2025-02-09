import { wixClientServer } from "@/lib/wixClientServer";
import { products } from "@wix/stores";
import Image from "next/image";
import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";
import Pagination from "./Pagination";
import { Button } from "./ui/button";

const PRODUCT_PER_PAGE = 8;

const ProductList = async ({
  categoryId,
  limit,
  searchParams,
}: {
  categoryId: string;
  limit?: number;
  searchParams?: any;
}) => {
  const wixClient = await wixClientServer();
  let productQuery = wixClient.products
    .queryProducts()
    .startsWith("name", searchParams?.name || "")
    .eq("collectionIds", categoryId)
    .gt("priceData.price", searchParams?.min || 0)
    .lt("priceData.price", searchParams?.max || 999999)
    .limit(limit || PRODUCT_PER_PAGE)
    .skip(
      searchParams?.page
        ? parseInt(searchParams?.page) * (limit || PRODUCT_PER_PAGE)
        : 0
    ); // to get limited items per page

  if (searchParams?.sort) {
    const [sortType, sortBy] = searchParams.sort.split(" ");

    if (sortType === "asc") {
      productQuery = productQuery.ascending(sortBy);
    }
    if (sortType === "desc") {
      productQuery = productQuery.descending(sortBy);
    }
  }

  const res = await productQuery.find();
  console.log(res.items.at(1)?.priceData?.formatted?.discountedPrice);

  return (
    <div className="mt-12 flex gap-x-8 gap-y-16 justify-between lg:justify-center flex-wrap">
      {res.items.map((product: products.Product) => (
        <Link
          href={"/" + product.slug}
          className="w-full flex flex-col gap-4 sm:w-[45%] lg:w-[22%]"
          key={product._id}
        >
          <div className="relative w-full h-80">
            <Image
              src={product.media?.mainMedia?.image?.url || "/nike-logo.png"}
              alt=""
              fill
              sizes="25vw"
              className="absolute object-cover rounded-md z-10 hover:opacity-0 transition-opacity easy duration-500"
            />
            <Image
              src={product.media?.items?.at(1)?.image?.url || "/nike-logo.png"}
              alt=""
              fill
              sizes="25vw"
              className="absolute object-cover rounded-md"
            />
          </div>

          <span className="font-medium">{product.name}</span>

          <div
            className="text-sm text-gray-500"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(product.description || ""),
            }}
          />
          <Button variant={"outline"}>
            <span className="font-semibold">
              {product.convertedPriceData?.formatted?.discountedPrice ===
              product.convertedPriceData?.formatted?.price
                ? product.convertedPriceData?.formatted?.price
                : product.convertedPriceData?.formatted?.discountedPrice}
            </span>
          </Button>
        </Link>
      ))}
      {searchParams?.category || searchParams?.name ? (
        <Pagination
          currentPage={res.currentPage || 0}
          hasPrev={res.hasPrev()}
          hasNext={res.hasNext()}
        />
      ) : null}
    </div>
  );
};

export default ProductList;
