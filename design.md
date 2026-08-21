# Signal / learn — Design System

## 1. Design Direction

Signal / learn is a practical technology and AI learning platform for non-technical professionals.

The visual direction is derived from the design language of Homin.tech:

- Editorial rather than conventional SaaS
- Bold rather than corporate
- Expressive but controlled
- Large typography with generous whitespace
- Warm neutral backgrounds contrasted with near-black sections
- Bright accent colors used as intentional visual signals
- Rounded containers without excessive "soft UI"
- Organic, slightly imperfect rotations and compositions
- Minimal interface chrome
- Visual hierarchy driven primarily by scale, contrast, spacing and composition

The goal is to make technology feel approachable without making the product look childish or overly "AI-themed."

---

# 2. Design Principles

## 2.1 Make the important thing visually obvious

Use size and contrast before decoration.

Priority order:

1. Main message
2. User action
3. Supporting explanation
4. Secondary navigation
5. Metadata

Avoid giving every element equal visual weight.

## 2.2 Use contrast as structure

The system alternates between:

- Warm off-white surfaces
- Near-black surfaces
- Bright accent blocks

Large color changes define sections rather than relying heavily on borders or shadows.

## 2.3 Prefer composition over decoration

Visual interest should come from:

- Typography
- Scale
- Position
- Color blocks
- Pills
- Slight rotations
- Abstract objects

Avoid:

- Generic gradients
- Glassmorphism
- Excessive shadows
- Decorative icons everywhere
- Generic SaaS illustrations

## 2.4 Technology should feel approachable

The product serves non-technical professionals.

The visual language should therefore communicate:

> "This is sophisticated technology, but you can understand it."

Do not use overly technical visual metaphors such as terminal windows, code-heavy interfaces or dense dashboards unless the lesson itself requires them.

---

# 3. Color System

## Primary

| Token | Value | Usage |
|---|---|---|
| `--ink` | `#171919` | Primary dark surface, primary text |
| `--paper` | `#FFFCF5` | Main page background |
| `--lime` | `#C9FF36` | Primary action / emphasis |
| `--lav` | `#B3AFFF` | Secondary accent |
| `--blue` | `#6C63F5` | Interactive / progress accent |
| `--mint` | `#59C995` | Secondary highlight |
| `--line` | `rgba(23,25,25,.18)` | Borders/dividers |
| `--muted` | `rgba(23,25,25,.62)` | Secondary text |

## Color rules

### Warm neutral

Use `#FFFCF5` instead of pure white for the main background.

This prevents the interface from feeling sterile.

### Near-black

Use `#171919` instead of `#000000`.

Black sections should feel dense and intentional without looking harsh.

### Bright accents

Accent colors should appear in relatively large, confident areas:

- CTA
- Highlighted word
- Learning tag
- Card background
- Progress indicator
- Abstract illustration

Do not scatter accent colors across every UI element.

### Contrast

Text on dark backgrounds should use:

- Primary: `#FFFCF5`
- Secondary: approximately `rgba(255,252,245,.62-.75)`

Text on accent surfaces should generally use `#171919`.

---

# 4. Typography

## Font

Primary typeface:

`Manrope`

Fallback:

`Arial, sans-serif`

The design relies heavily on geometric sans-serif typography with strong weight contrast.

## Display typography

Large headings use:

- Weight: `700`
- Letter spacing: approximately `-0.06em` to `-0.075em`
- Line height: approximately `0.88–0.95`

Example:

```css
font-size: clamp(56px, 7.2vw, 112px);
line-height: .88;
letter-spacing: -.075em;
font-weight: 700;
```

Large typography should feel almost poster-like.

## Section headings

Typical range:

- Desktop: `60–76px`
- Tablet: `48–64px`
- Mobile: `42–58px`

Use compact line-height.

## Card headings

Typical range:

- Desktop: `36–44px`
- Mobile: `32–38px`

## Body text

Typical range:

- Large introductory copy: `16–18px`
- Standard body: `14–16px`
- Metadata: `11–13px`

Body copy should remain visually subordinate to headings.

## Eyebrows / labels

Use:

- `10–12px`
- `700–800`
- Uppercase
- Letter spacing around `.12em–.15em`

Example:

```css
text-transform: uppercase;
letter-spacing: .14em;
font-size: 12px;
font-weight: 800;
```

---

# 5. Spacing System

Use a generous spacing rhythm.

Recommended base unit:

`4px`

Common values:

| Token | Size |
|---|---:|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-10` | 40px |
| `space-12` | 48px |
| `space-16` | 64px |
| `space-20` | 80px |
| `space-24` | 96px |
| `space-30` | 120px |

Major sections generally use:

`80–120px` vertical padding.

The design should feel spacious rather than dense.

---

# 6. Layout

## Maximum width

Primary content:

```css
max-width: 1320px;
```

Side margins:

```css
width: min(calc(100% - 48px), 1320px);
```

Mobile:

```css
width: calc(100% - 32px);
```

## Desktop grid

Primary editorial sections use approximately:

```text
50 / 50
```

or

```text
55 / 45
```

depending on content.

Cards generally use:

```text
3 columns
```

with relatively small gaps.

## Alignment

Prefer:

- Strong left alignment
- Large horizontal breathing room
- Asymmetric compositions
- Clear visual anchors

Avoid excessive centered layouts.

Centered elements are primarily used for:

- Hero objects
- Tag clouds
- Certain decorative compositions

---

# 7. Containers

## Large sections

Border radius:

```text
34–40px
```

## Cards

Border radius:

```text
24–30px
```

## Pills

Border radius:

```text
999px
```

## Inputs

Use relatively restrained geometry:

- Bottom-border fields
- Minimal chrome
- No large filled input containers unless the interaction requires it

---

# 8. Borders

Borders are subtle.

Default:

```css
border: 1px solid rgba(23,25,25,.18);
```

Dark surfaces:

```css
border-color: rgba(255,252,245,.16-.35);
```

Borders should structure a component without becoming a prominent visual element.

---

# 9. Shadows

The system generally avoids heavy UI shadows.

Use shadows only when an object needs physical separation.

Example:

```css
box-shadow:
  0 12px 26px rgba(0,0,0,.08);
```

Hero artwork may use stronger shadows to create depth.

Avoid:

- Large diffuse card shadows
- Neumorphism
- Persistent shadows on every component

---

# 10. Buttons

## Primary CTA

Shape:

```text
Pill
```

Height:

approximately `44–48px`

Padding:

approximately `14px 20px`

Background:

`--lime`

Text:

`--ink`

Weight:

`700–800`

Example:

```css
display: inline-flex;
align-items: center;
gap: 12px;
padding: 14px 20px;
border-radius: 999px;
background: var(--lime);
color: var(--ink);
font-weight: 700;
```

## Hover

Primary interaction:

```text
slight upward movement
+
subtle shadow
```

Do not dramatically change the button color.

---

# 11. Pills and Tags

Pills are an important part of the visual language.

They can represent:

- Topics
- Capabilities
- Categories
- Metadata
- Learning concepts

Recommended:

```text
border-radius: 999px
font-weight: 700
```

Some tags can have small rotational offsets:

```text
-4deg to +4deg
```

The rotation should feel deliberate but not chaotic enough to compromise readability.

---

# 12. Cards

Cards should feel like large editorial objects rather than conventional SaaS cards.

Characteristics:

- Large colored background
- Minimal border
- Large title
- Short description
- Small metadata
- Circular arrow/action element
- Generous internal padding

Typical padding:

```text
24–32px
```

Minimum desktop height:

approximately `400px`

Cards can lift slightly on hover.

```css
transform: translateY(-8px);
```

Do not add large shadows to compensate.

---

# 13. Navigation

Desktop:

- Floating dark navigation bar
- Pill-shaped outer container
- Small navigation labels
- Active item uses lime background
- Minimal visual noise

Mobile:

- Preserve floating navigation container
- Collapse links behind a menu control
- Keep brand visible

Navigation should remain secondary to the page content.

---

# 14. Hero

The hero is the strongest visual statement.

Structure:

```text
Dark background
    |
    +-- Editorial headline
    +-- Supporting copy
    +-- Primary CTA
    |
    +-- Abstract visual
    |
    +-- Floating topic pills
```

Recommended characteristics:

- Large viewport height
- Near-black background
- Warm white text
- One highlighted word
- Bright accent CTA
- Abstract geometric object
- Floating tags

The visual should communicate the product idea before the user reads the details.

---

# 15. Imagery and Illustration

Use original abstract imagery.

Preferred characteristics:

- Geometric
- Slightly dimensional
- Bold accent colors
- Minimal detail
- Strong silhouette
- Soft physical depth

Avoid stock photography.

Avoid generic AI imagery such as:

- Robot heads
- Glowing brains
- Blue neural networks
- Generic circuit boards
- Human + hologram compositions

The abstract AI prism in the prototype is an original replacement for the reference site's distinctive artwork.

---

# 16. Iconography

Icons should be:

- Simple
- Small
- High contrast
- Geometric
- Used sparingly

The primary interaction symbol is an arrow:

`↗`

Circular arrow buttons can be used for navigation or card actions.

Do not introduce large icon libraries unless the product requires them.

---

# 17. Interaction States

## Hover

Use:

- Small translation
- Small rotation
- Background transition
- Subtle shadow

Avoid dramatic animation.

## Focus

Keyboard focus must remain visible.

Recommended:

```css
outline: 3px solid var(--blue);
outline-offset: 4px;
```

## Active

Use stronger contrast or the same accent treatment as the active navigation state.

## Disabled

Disabled elements should:

- Reduce opacity
- Remove hover movement
- Preserve layout geometry

Recommended opacity:

```text
0.4–0.5
```

## Loading

Prefer minimal loading indicators.

Do not introduce large skeleton systems unless required by the actual product.

---

# 18. Motion

Motion should reinforce the physical/editorial quality of the design.

Preferred easing:

```css
cubic-bezier(.2,.8,.2,1)
```

Typical duration:

```text
200–300ms
```

Hero artwork can use slow ambient movement.

Example:

```text
6 second floating loop
```

Animations should remain subtle.

Respect:

```css
prefers-reduced-motion: reduce
```

---

# 19. Responsive Behavior

## Desktop

`> 900px`

- Two-column hero
- Three-column learning paths
- Large typography
- Wide containers
- Floating navigation links

## Tablet

`600–900px`

- Two-column structures begin collapsing
- Cards become single-column
- Hero artwork remains visible
- Typography scales down

## Mobile

`< 560px`

- Single-column layout
- Navigation collapses
- Large headline remains intentionally large
- Cards stack
- Tag cloud wraps
- Footer form becomes single column
- Section padding reduces from approximately `120px` to `70–80px`

The mobile version should not become a generic mobile SaaS layout. Preserve the editorial character.

---

# 20. Content Design

Content should be:

- Short
- Direct
- Practical
- Non-technical
- Outcome-oriented

Prefer:

> "Can I trust an AI answer?"

over:

> "Introduction to AI Output Validation Methodologies"

Prefer:

> "Automate the boring bits"

over:

> "Workflow Automation Fundamentals"

The product should teach mental models rather than simply expose terminology.

---

# 21. Learning Experience Patterns

The visual system should support the following product patterns.

## Learning path

```text
Path
 ├── Goal
 ├── Number of lessons
 ├── Estimated time
 └── Start action
```

## Lesson

```text
Lesson
 ├── Concept
 ├── Real-world explanation
 ├── Example
 ├── Practice
 └── Completion
```

## Progress

Progress should emphasize:

> What should I do next?

rather than:

> How many badges have I earned?

The "next useful thing" pattern should remain a core UX principle.

---

# 22. Accessibility

Maintain:

- Keyboard navigation
- Visible focus states
- Semantic HTML
- Form labels
- Accessible buttons
- Reduced-motion support
- Sufficient text contrast

Color should never be the only mechanism for communicating meaning.

---

# 23. Design Tokens

Recommended starting token set:

```css
:root {
  --color-ink: #171919;
  --color-paper: #fffcf5;
  --color-lime: #c9ff36;
  --color-lavender: #b3afff;
  --color-blue: #6c63f5;
  --color-mint: #59c995;

  --color-text-muted: rgba(23,25,25,.62);
  --color-border: rgba(23,25,25,.18);

  --radius-card: 28px;
  --radius-section: 38px;
  --radius-pill: 999px;

  --container-max: 1320px;

  --space-unit: 4px;

  --ease-standard: cubic-bezier(.2,.8,.2,1);

  --duration-fast: 200ms;
  --duration-standard: 300ms;
}
```

---

# 24. What This System Should Avoid

Do not introduce:

- Purple/blue AI gradients as a default
- Glassmorphism
- Excessive rounded cards
- Generic dashboard layouts
- Excessive drop shadows
- Stock photography
- Generic robot/AI imagery
- Excessive iconography
- Dense information architecture
- Tiny typography
- Excessive badges
- Conventional corporate blue/white styling
- Excessive animations

The defining quality is **controlled visual boldness**.

---

# 25. Quality-Control Checklist

Before shipping a new page, check:

### Typography

- [ ] Is the main message immediately obvious?
- [ ] Are headings large enough?
- [ ] Is letter spacing tight enough?
- [ ] Is supporting text visually subordinate?

### Layout

- [ ] Is there enough whitespace?
- [ ] Are major elements aligned to the same container?
- [ ] Does the composition feel editorial rather than dashboard-like?

### Color

- [ ] Is the warm background preserved?
- [ ] Is near-black used for high-impact sections?
- [ ] Are bright colors concentrated rather than scattered?

### Components

- [ ] Are cards large and visually confident?
- [ ] Are pills actually useful?
- [ ] Are borders subtle?
- [ ] Are shadows restrained?

### Interaction

- [ ] Do interactive elements have a visible hover state?
- [ ] Is keyboard focus visible?
- [ ] Does motion remain subtle?
- [ ] Does reduced-motion work?

### Responsive

- [ ] Does the hero remain visually strong on mobile?
- [ ] Do cards stack cleanly?
- [ ] Does typography scale without becoming generic?
- [ ] Does navigation collapse appropriately?

### Product Fit

- [ ] Does the page make technology feel approachable?
- [ ] Does content focus on practical outcomes?
- [ ] Can a non-technical professional understand the next action immediately?
