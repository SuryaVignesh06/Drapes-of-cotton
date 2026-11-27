import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Collection } from "@/types";

export function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <Link
      href={`/collections/${collection.slug}`}
      className="group flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[10px] bg-surface-cotton">
        {collection.coverImage && (
          <Image
            src={collection.coverImage}
            alt={`${collection.name} cotton saree collection`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          />
        )}
      </div>
      <div className="pt-3 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-medium text-foreground">
            {collection.name}
          </h3>
          <ArrowRight className="size-3.5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground" />
        </div>
        {collection.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {collection.description}
          </p>
        )}
      </div>
    </Link>
  );
}
