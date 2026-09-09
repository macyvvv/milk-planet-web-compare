# Change

MeltyMousse menu page `index_3.html` source-led reconstruction.

## Viewing situation

- FACT: visitors first need to understand the store's menu and price atmosphere, then inspect a specific menu category.
- FACT: the published source page presents seven tall menu sheets as the primary content.
- CONSTRAINT: the page must remain a static GitHub Pages document and use existing assets.

## Business and human outcome

- USER: create `index_3.html` for visual comparison while preserving the existing `index.html`.
- INFERENCE: a category index and readable responsive sizing reduce search cost before a visitor checks prices or decides to visit.
- CONSTRAINT: no new booking, purchase, or contact function is inferred from the source menu page.

## Source lock

- FACT: `proposal/branch5/shop/melty/menu/index.html` is the existing menu source.
- FACT: `menu1.jpg` through `menu6.jpg` plus `menu4.5.jpg` contain the menu typography, prices, illustrations, and promotional photography.
- FACT: `shop_melty_logo.jpg`, `cutline.png`, `proposal.css`, `navigation.css`, and the Melty CSS variables are existing store assets or shared presentation sources.

## Hierarchy

1. Store identity and menu purpose.
2. Main menu and price system.
3. Newcomer sets, drinks, champagne, food, and promotional champagne images.
4. Use the category index to move to the relevant source sheet.

## Commitments

1. Keep source sheets as the canonical visual/content surface; do not manually rewrite all image text into competing HTML.
2. Add semantic section headings, a local category index, meaningful alt summaries, and responsive single-column behavior.
3. Retain Melty's pink, lace, dessert, and character language through existing assets and restrained CSS rather than generic cards or invented decoration.

## Deliberate exclusions

- Do not generate or retouch menu images.
- Do not invent exact item text or prices outside what is visibly established in the source sheets.
- Do not add a hero photograph that is not part of the menu page's source sequence.
- Do not change the existing `index.html`, shared CSS, or other stores.

## Tradeoffs and unknowns

- FACT: image text remains less searchable and less editable than HTML text.
- INFERENCE: preserving the composite sheets is safer because their decorative typography and price placement are part of the product communication.
- UNKNOWN: whether an operational owner wants every item maintained as HTML in the future; this remains a follow-up rather than a guessed implementation.
