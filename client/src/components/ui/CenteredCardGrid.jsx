import React from "react";

/**
 * The width one card gets at each breakpoint, as a fraction of the row.
 *
 * Each value is exactly `(100% - (n - 1) * gap) / n` for `n` cards per row with a
 * 1.25rem (`gap-5`) gutter, so `n` cards fill the row exactly with no leftover
 * space for a seventh one to squeeze into. Deriving it by hand from the gutter
 * is why the numbers look odd; the alternative is a `grid-template-columns` with
 * `1fr`, which stretches the cards in a short final row and is precisely the
 * uneven layout this is here to avoid.
 *
 * 2 / 3 / 4 / 5 per row as the viewport grows. Two on a phone, matching the
 * Executive Committee grid on the About page, which has always been
 * `grid-cols-2`; one per row made the committee scroll for no reason at a width
 * that comfortably fits a portrait card at half the column.
 */
export const CARD_BASIS =
  "basis-[calc(50%-0.625rem)] " +
  "md:basis-[calc(33.3333%-0.8333rem)] " +
  "lg:basis-[calc(25%-0.9375rem)] " +
  "xl:basis-[calc(20%-1rem)]";

/**
 * One and a half cards wide, for the counselor's spotlight card.
 *
 * Derived from CARD_BASIS as `1.5 * (100/n - (n-1)*gap/n)` rather than picked as
 * a pixel width, so the counselor stays exactly half again as wide as an Excom
 * card at every breakpoint. A fixed `max-w-sm` could not do that: the grid card
 * is ~154px on a phone but ~227px on a desktop, so any single cap is either
 * smaller than the cards on a wide screen or absurd on a narrow one.
 *
 * Widths rather than flex bases, because the spotlight sits outside the grid's
 * flex row - `basis-*` does nothing on a plain block child.
 */
export const FEATURE_BASIS =
  "w-[calc(75%-0.9375rem)] " +
  "md:w-[calc(50%-1.25rem)] " +
  "lg:w-[calc(37.5%-1.4063rem)] " +
  "xl:w-[calc(30%-1.5rem)]";

/**
 * A wrapping row of equally sized cards, with a short last row centred.
 *
 * Why flexbox rather than CSS grid: `grid-cols-5` leaves the final row's cards
 * stuck to the left edge, and `auto-fit` + `minmax()` makes them stretch to fill,
 * so the cards in a short row end up wider than the cards above them. Neither
 * gives "every card the same size, and the leftovers centred", which is what a
 * committee grid has to look like when the number of people is not a multiple of
 * the column count. `justify-content: center` on a wrapping flex row centres each
 * line independently, so the last line lands in the middle without any counting
 * in JavaScript.
 *
 * `items-stretch` makes every card in a line as tall as the tallest one, so a
 * long bio does not leave a ragged edge.
 *
 * The child width lives here rather than on each card, so no caller can forget
 * it and quietly get a mismatched row.
 */
export default function CenteredCardGrid(props) {
  // Destructured from `props` in the body rather than in the signature on
  // purpose: this repo's no-unused-vars config exempts uppercase *variables*
  // (the ones used as components) but not destructured *parameters*, so
  // `function C({ as: Tag })` would be reported as unused even though `<Tag>`
  // below is the only use of it.
  const {
    children,
    className = "",
    itemClassName = "",
    as: Tag = "ul",
    itemAs: ItemTag = "li",
    ...rest
  } = props;

  const items = React.Children.toArray(children);

  return (
    <Tag
      className={`flex flex-wrap justify-center items-stretch gap-5 ${className}`}
      {...rest}
    >
      {items.map((child, index) => (
        <ItemTag
          key={child.key ?? index}
          className={`${CARD_BASIS} max-w-full min-w-0 ${itemClassName}`}
        >
          {child}
        </ItemTag>
      ))}
    </Tag>
  );
}
