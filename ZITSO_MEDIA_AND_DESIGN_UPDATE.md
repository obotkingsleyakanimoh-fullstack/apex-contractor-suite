# Zitso Energy — media optimisation and visual refinement

## Image upload behaviour

All image uploads now pass through `optimizeImageForUpload` in `src/lib/media.ts` before they are sent to Supabase Storage.

- JPEG, PNG and AVIF images are resized so the longest edge is no more than 2,048 pixels and encoded as WebP at 82% quality.
- Existing WebP images are uploaded without being recompressed a second time.
- GIFs are preserved as GIF so animated files do not become a still image.
- PDFs and supported Word/Excel documents are uploaded unchanged.
- The same shared upload layer is used by visitor quote attachments and administrator image uploads, including the media library and website content editors.
- The stored content type, filename extension and file size metadata reflect the optimised file.

The image conversion takes place in the visitor's browser, so it does not require a paid image-processing service or an additional server function. Browsers that cannot produce WebP receive an actionable upload error rather than silently storing a JPEG/PNG as though it were WebP.

## Performance and presentation

- Shipped WebP images in `public/images` were re-encoded at high quality while retaining their existing dimensions.
- Hero carousels prioritise the active image and only keep the next slide image in the DOM, reducing unnecessary image requests.
- Non-hero image components remain lazy-loaded and asynchronously decoded.
- Public listing cards, surfaces, forms, navigation focus states and motion preferences received a consistent, restrained visual refinement using the existing Zitso Energy green/gold palette.

## Deployment

No new package or database migration is required for this update. Deploy the updated project as usual. Existing images already stored in Supabase are not rewritten automatically; newly uploaded images are optimised. To convert legacy stored images, download and re-upload them through the website's Media Library or content editor.
