interface ProductGalleryProps {
  imageUrl: string;
  title: string;
}

const ProductGallery = ({ imageUrl, title }: ProductGalleryProps) => (
  <figure className="hidden lg:block rounded-2xl border border-wheat/60 bg-card overflow-hidden shadow-sm group">
    <div className="aspect-[4/5] overflow-hidden bg-forest/5">
      <img
        src={imageUrl}
        alt={title}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
    </div>
  </figure>
);

export default ProductGallery;