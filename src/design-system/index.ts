/**
 * Barrel for the Okwe Knowledge design system.
 *
 * Every consumer in the app imports by path, so nothing depends on this file —
 * it exists so the system has one readable inventory of what it offers. If a
 * component is not listed here, it is not part of the system.
 */

export { Logo } from "./components/brand/Logo";
export type { LogoProps, LogoVariant, LogoTone } from "./components/brand/Logo";
export { Seeds } from "./components/brand/Seeds";
export type { SeedsProps } from "./components/brand/Seeds";

export { Badge } from "./components/core/Badge";
export { Button } from "./components/core/Button";
export { Card } from "./components/core/Card";
export { Dialog } from "./components/core/Dialog";
export { IconButton } from "./components/core/IconButton";
export { Tabs } from "./components/core/Tabs";
export { Tag } from "./components/core/Tag";
export { Tooltip } from "./components/core/Tooltip";

export { Checkbox } from "./components/forms/Checkbox";
export { Field } from "./components/forms/Field";
export { Input } from "./components/forms/Input";
export { Radio } from "./components/forms/Radio";
export { Select } from "./components/forms/Select";
export { Switch } from "./components/forms/Switch";

export { CallNumber, callNumberString } from "./components/notation/CallNumber";
export { ManifestDiagram } from "./components/notation/ManifestDiagram";
export { MarginNote } from "./components/notation/MarginNote";
export { Tally } from "./components/notation/Tally";

export { DefinitionCard } from "./components/editorial/DefinitionCard";
export { FrameworkList } from "./components/editorial/FrameworkList";
export { PullQuote } from "./components/editorial/PullQuote";
export { StatBlock } from "./components/editorial/StatBlock";

export { PostCanvas, CANVASES, THEMES } from "./components/social/PostCanvas";
export type { CanvasName, ThemeName } from "./components/social/PostCanvas";
export { CarouselSlide } from "./components/social/CarouselSlide";
export type {
  CarouselSlideKind,
  CarouselSlideItem,
} from "./components/social/CarouselSlide";
export { StatCard } from "./components/social/StatCard";
export { ThumbnailCard } from "./components/social/ThumbnailCard";

/* The three data cards the template library documents. */
export { ComparisonCard } from "./components/social/ComparisonCard";
export type { ComparisonCardProps, ComparisonSide } from "./components/social/ComparisonCard";
export { RankCard } from "./components/social/RankCard";
export type { RankCardProps, RankRow } from "./components/social/RankCard";
export { TimelineCard } from "./components/social/TimelineCard";
export type { TimelineCardProps, TimelineEvent } from "./components/social/TimelineCard";

/* The article header (OKW-EDI-ARTICLE-01), in every size an article leaves in. */
export { ArticleCard, ARTICLE_CANVASES, ARTICLE_TYPE, LEDE_FIT, isArticleCanvas } from "./components/social/ArticleCard";
export type { ArticleCardProps, ArticleCanvas } from "./components/social/ArticleCard";
