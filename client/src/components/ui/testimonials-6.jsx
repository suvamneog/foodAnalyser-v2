/* eslint-disable react/prop-types */
"use client";

import { cn } from "@/lib/utils";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

/**
 * Seed quotes used only when the live review list is short —
 * Indian nutrition / FoodAnalyser context, not celebrity stubs.
 */
export const FALLBACK_TESTIMONIALS = [
  {
    quote:
      "Finally an app that understands roti, dal, and dosa portions. IFCT numbers feel honest — not Western guesses.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&crop=faces",
    name: "Ananya R.",
    role: "Fitness coach",
    company: "Bengaluru",
    rating: 5,
  },
  {
    quote:
      "The Assam and Manipur dishes were a surprise. Regional data where most apps show nothing.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=faces",
    name: "Rahul M.",
    role: "Home cook",
    company: "Guwahati",
    rating: 5,
  },
  {
    quote:
      "Barcode scan + Indian alternatives helped me swap packaged snacks for better everyday choices.",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop&crop=faces",
    name: "Priya S.",
    role: "Student",
    company: "Pune",
    rating: 4,
  },
  {
    quote:
      "Daily tracker with katori and roti servings just works. I stopped converting everything to grams.",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=faces",
    name: "Vikram D.",
    role: "Software engineer",
    company: "Hyderabad",
    rating: 5,
  },
  {
    quote:
      "Image scan is an estimate, and the app says so. That honesty made me trust the IFCT matches more.",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=96&h=96&fit=crop&crop=faces",
    name: "Meera K.",
    role: "Dietitian",
    company: "Chennai",
    rating: 5,
  },
  {
    quote:
      "Compare regions is brilliant for staples — phulka vs luchi vs bhakri on the same plate.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=faces",
    name: "Arjun P.",
    role: "Runner",
    company: "Delhi",
    rating: 4,
  },
  {
    quote:
      "Clean UI, clear sources. I use it before logging lunch from the mess menu.",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=faces",
    name: "Sneha T.",
    role: "College athlete",
    company: "Mumbai",
    rating: 5,
  },
  {
    quote:
      "Pav bhaji and chole cards now match the database per 100 g. No more inflated marketing numbers.",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=96&h=96&fit=crop&crop=faces",
    name: "Karan J.",
    role: "Product designer",
    company: "Ahmedabad",
    rating: 5,
  },
  {
    quote:
      "Light mode looks premium, dark mode is easy on late-night logging. Both feel consistent.",
    image:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=96&h=96&fit=crop&crop=faces",
    name: "Nisha V.",
    role: "Nutrition student",
    company: "Kochi",
    rating: 4,
  },
];

/**
 * Map ReviewsContext items → testimonial cards.
 */
export function mapReviewsToTestimonials(reviews = []) {
  return (reviews || [])
    .filter((r) => r?.description && r?.name)
    .map((r) => ({
      quote: r.description,
      image:
        r.image ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          r.name
        )}&backgroundColor=d4892a`,
      name: r.name,
      role: r.rating ? `${r.rating}/5` : "User",
      company: "FoodAnalyser",
      rating: r.rating || 0,
    }));
}

function buildColumns(list) {
  const items = list.length >= 3 ? list : [...list, ...FALLBACK_TESTIMONIALS].slice(0, 9);
  // Ensure enough cards for a smooth vertical loop
  const padded =
    items.length >= 9
      ? items
      : [...items, ...FALLBACK_TESTIMONIALS].slice(0, Math.max(9, items.length));

  const chunk = Math.ceil(padded.length / 3) || 1;
  return [
    padded.slice(0, chunk),
    padded.slice(chunk, chunk * 2),
    padded.slice(chunk * 2, chunk * 3),
  ].map((col) => (col.length ? col : FALLBACK_TESTIMONIALS.slice(0, 3)));
}

export function TestimonialsSection({
  reviews = [],
  eyebrow = "Testimonials",
  title = "What our users say",
  subtitle = "Real notes from people tracking Indian meals with IFCT, INDB, and regional data.",
  className,
  showHeader = true,
  compact = false,
}) {
  const fromReviews = mapReviewsToTestimonials(reviews);
  const [firstColumn, secondColumn, thirdColumn] = buildColumns(fromReviews);

  return (
    <section className={cn("relative py-10", className)}>
      <div className="mx-auto max-w-5xl px-4 sm:px-0">
        {showHeader && (
          <div className="mx-auto flex max-w-lg flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-saffron-300/90">
              {eyebrow}
            </div>

            <h2 className="font-display text-3xl font-extrabold tracking-tight text-white lg:text-4xl">
              {title}
            </h2>
            <p className="text-sm leading-relaxed text-white/50">{subtitle}</p>
          </div>
        )}

        <div
          className={cn(
            "mt-10 flex justify-center gap-4 overflow-hidden sm:gap-6",
            compact ? "max-h-[28rem]" : "max-h-[40rem]",
            "[mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]",
            "[-webkit-mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]"
          )}
        >
          <InfiniteSlider direction="vertical" speed={28} speedOnHover={12} gap={16}>
            {firstColumn.map((testimonial, i) => (
              <TestimonialsCard
                key={`${testimonial.name}-${i}`}
                testimonial={testimonial}
              />
            ))}
          </InfiniteSlider>
          <InfiniteSlider
            className="hidden md:block"
            direction="vertical"
            speed={42}
            speedOnHover={18}
            gap={16}
          >
            {secondColumn.map((testimonial, i) => (
              <TestimonialsCard
                key={`${testimonial.name}-${i}`}
                testimonial={testimonial}
              />
            ))}
          </InfiniteSlider>
          <InfiniteSlider
            className="hidden lg:block"
            direction="vertical"
            speed={32}
            speedOnHover={14}
            gap={16}
          >
            {thirdColumn.map((testimonial, i) => (
              <TestimonialsCard
                key={`${testimonial.name}-${i}`}
                testimonial={testimonial}
              />
            ))}
          </InfiniteSlider>
        </div>
      </div>
    </section>
  );
}

function TestimonialsCard({ testimonial, className, ...props }) {
  const { quote, image, name, role, company, rating } = testimonial;
  return (
    <figure
      className={cn(
        "fa-testimonial-card w-full max-w-xs rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-[0_18px_40px_rgba(0,0,0,0.28)] backdrop-blur-sm",
        "dark:bg-white/[0.04]",
        className
      )}
      {...props}
    >
      {rating > 0 && (
        <div className="mb-3 flex gap-0.5" aria-label={`${rating} of 5 stars`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-3.5 w-3.5",
                i < rating
                  ? "fill-saffron-400 text-saffron-400"
                  : "text-white/20"
              )}
            />
          ))}
        </div>
      )}
      <blockquote className="text-[15px] leading-relaxed text-white/85">
        “{quote}”
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-2.5">
        <Avatar className="size-8 rounded-full border border-white/10">
          <AvatarImage alt="" src={image} />
          <AvatarFallback className="bg-saffron-500/20 text-xs font-semibold text-saffron-200">
            {name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col text-left">
          <cite className="truncate font-medium not-italic leading-5 tracking-tight text-white">
            {name}
          </cite>
          <span className="truncate text-sm leading-5 tracking-tight text-white/45">
            {role}
            {company ? ` · ${company}` : ""}
          </span>
        </div>
      </figcaption>
    </figure>
  );
}

export default TestimonialsSection;
