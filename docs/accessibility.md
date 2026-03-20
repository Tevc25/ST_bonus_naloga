# Accessibility

GazeLearn is designed to remain usable and understandable with or without eye tracking.

## Implemented Accessibility Practices

- Semantic HTML with clear heading hierarchy.
- Keyboard accessible controls (buttons, links, switch, radio inputs).
- Visible focus indicators across interactive elements.
- Sufficient color contrast for text and key controls.
- Reduced-motion support through `prefers-reduced-motion` overrides.
- Descriptive labels/ARIA usage for calibration points, status regions, and controls.
- Camera-free fallback mode for users who cannot or do not want to use eye tracking.

## Reading UX Accessibility

- Reading-first layout with clear line length and spacing.
- Focus mode increases readability and reduces visual noise.
- Section tracker supports direct keyboard navigation via anchors.

## Testing/Verification

- Component tests cover key interaction surfaces.
- E2E tests validate fallback and flow completion without camera permission.

## Known Improvement Opportunities

- Add automated axe checks in CI for continuous accessibility regression protection.
- Add user-adjustable text scale presets and dyslexia-friendly font option.
