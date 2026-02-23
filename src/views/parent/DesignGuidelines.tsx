// src/views/parent/DesignGuidelines.tsx
// Storybook-style design system reference page.
// Linked from /parent/settings →"Design Guidelines".

import { useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import AppIcon, { ICON_MAP } from '@/components/ui/AppIcon';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import FormField from '@/components/ui/FormField';
import EmptyState from '@/components/ui/EmptyState';
import ThemeToggle from '@/components/ui/ThemeToggle';
import ProgressBar from '@/components/ui/ProgressBar';
import StatCard from '@/components/ui/StatCard';
import IconCircle from '@/components/ui/IconCircle';
import CircularProgress from '@/components/ui/CircularProgress';
import AvatarCircle from '@/components/ui/AvatarCircle';
import { PageLayout } from '@/components/layout';
import type { IconKey } from '@/components/ui/AppIcon';
import type { BadgeVariant, BadgeStyle } from '@/components/ui/Badge';
import type { ButtonVariant, ButtonSize } from '@/components/ui/Button';
import type { CardVariant } from '@/components/ui/Card';
import type { ProgressBarColor, ProgressBarSize } from '@/components/ui/ProgressBar';
import type { IconCircleColor, IconCircleVariant, IconCircleSize } from '@/components/ui/IconCircle';

// ============================================================================
// SECTION LAYOUT HELPERS
// ============================================================================

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
 return (
 <div id={id} className="scroll-mt-6">
 <div className="mb-4 pb-2 border-b border-neutral-200">
 <h2 className="text-xl font-bold text-neutral-700">{title}</h2>
 </div>
 <div className="space-y-6">{children}</div>
 </div>
 );
}

function SubSection({ title, children }: { title: string; children: ReactNode }) {
 return (
 <div>
 <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
 {title}
 </h3>
 {children}
 </div>
 );
}

function DemoPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
 return (
 <div
 className={`bg-neutral-0 rounded-xl border border-neutral-200 p-6 ${className}`}
 >
 {children}
 </div>
 );
}

// ============================================================================
// NAV
// ============================================================================

const NAV_SECTIONS = [
 { id: 'colors', label: 'Colors' },
 { id: 'typography', label: 'Typography' },
 { id: 'spacing', label: 'Spacing' },
 { id: 'radius', label: 'Border Radius' },
 { id: 'shadows', label: 'Shadows' },
 { id: 'icons', label: 'Icons' },
 { id: 'buttons', label: 'Button' },
 { id: 'cards', label: 'Card' },
 { id: 'alerts', label: 'Alert' },
 { id: 'badges', label: 'Badge' },
 { id: 'spinners', label: 'LoadingSpinner' },
 { id: 'forms', label: 'FormField' },
 { id: 'empty-states', label: 'EmptyState' },
 { id: 'theme-toggle', label: 'ThemeToggle' },
 { id: 'progress-bar', label: 'ProgressBar' },
 { id: 'stat-card', label: 'StatCard' },
 { id: 'icon-circle', label: 'IconCircle' },
 { id: 'circular-progress', label: 'CircularProgress' },
 { id: 'avatar-circle', label: 'AvatarCircle' },
] as const;

// ============================================================================
// DESIGN TOKEN DATA
// ============================================================================

const primaryColors = [
 { shade: '50', hex: '#F7F4FF', tw: 'bg-primary-50', dark: false },
 { shade: '100', hex: '#EDE7FF', tw: 'bg-primary-100', dark: false },
 { shade: '200', hex: '#DDD3FF', tw: 'bg-primary-200', dark: false },
 { shade: '300', hex: '#C3B5FF', tw: 'bg-primary-300', dark: false },
 { shade: '400', hex: '#A890FF', tw: 'bg-primary-400', dark: false },
 { shade: '500', hex: '#8C6CFF', tw: 'bg-primary-500', dark: true },
 { shade: '600', hex: '#5B2CFF', tw: 'bg-primary-600', dark: true, main: true },
 { shade: '700', hex: '#4A1FDB', tw: 'bg-primary-700', dark: true },
 { shade: '800', hex: '#3D1AB3', tw: 'bg-primary-800', dark: true },
 { shade: '900', hex: '#32168A', tw: 'bg-primary-900', dark: true },
];

const neutralColors = [
 { shade: '0', hex: '#FFFFFF', tw: 'bg-neutral-0' },
 { shade: '50', hex: '#F9FAFB', tw: 'bg-neutral-50' },
 { shade: '100', hex: '#F3F4F6', tw: 'bg-neutral-100' },
 { shade: '200', hex: '#E5E7EB', tw: 'bg-neutral-200' },
 { shade: '300', hex: '#D1D5DB', tw: 'bg-neutral-300' },
 { shade: '400', hex: '#9CA3AF', tw: 'bg-neutral-400' },
 { shade: '500', hex: '#6B7280', tw: 'bg-neutral-500' },
 { shade: '600', hex: '#4B5563', tw: 'bg-neutral-600' },
 { shade: '700', hex: '#1F2330', tw: 'bg-neutral-700' },
 { shade: '800', hex: '#1A1D28', tw: 'bg-neutral-800' },
 { shade: '900', hex: '#111318', tw: 'bg-neutral-900' },
];

const accentColors = [
 { name: 'Green', role: 'Success / Completion', hex: '#1EC592', tw: 'bg-accent-green' },
 { name: 'Amber', role: 'Warning / Attention', hex: '#FFB547', tw: 'bg-accent-amber' },
 { name: 'Red', role: 'Error / Danger', hex: '#EF4444', tw: 'bg-accent-red' },
 { name: 'Blue', role: 'Info / Links', hex: '#3B82F6', tw: 'bg-accent-blue' },
 { name: 'Purple', role: 'Accent', hex: '#8B5CF6', tw: 'bg-accent-purple' },
 { name: 'Pink', role: 'Accent', hex: '#EC4899', tw: 'bg-accent-pink' },
];

const semanticColors = [
 { name: 'Success', bg: 'bg-success-bg', border: 'border-success-border', text: 'text-success', hex: '#1EC592' },
 { name: 'Warning', bg: 'bg-warning-bg', border: 'border-warning-border', text: 'text-warning', hex: '#FFB547' },
 { name: 'Error', bg: 'bg-error-bg', border: 'border-error-border', text: 'text-error', hex: '#EF4444' },
 { name: 'Info', bg: 'bg-info-bg', border: 'border-info-border', text: 'text-info', hex: '#3B82F6' },
];

const fontSizes = [
 { label: 'xs', value: '12px', tw: 'text-xs' },
 { label: 'sm', value: '14px', tw: 'text-sm' },
 { label: 'base', value: '16px', tw: 'text-base' },
 { label: 'lg', value: '18px', tw: 'text-lg' },
 { label: 'xl', value: '20px', tw: 'text-xl' },
 { label: '2xl', value: '24px', tw: 'text-2xl' },
 { label: '3xl', value: '30px', tw: 'text-3xl' },
 { label: '4xl', value: '36px', tw: 'text-4xl' },
];

const fontWeights = [
 { label: 'normal', value: '400', tw: 'font-normal' },
 { label: 'medium', value: '500', tw: 'font-medium' },
 { label: 'semibold', value: '600', tw: 'font-semibold' },
 { label: 'bold', value: '700', tw: 'font-bold' },
];

const spacingScale = [
 { token: '1', px: '4px', tw: 'w-1' },
 { token: '2', px: '8px', tw: 'w-2' },
 { token: '3', px: '12px', tw: 'w-3' },
 { token: '4', px: '16px', tw: 'w-4' },
 { token: '5', px: '20px', tw: 'w-5' },
 { token: '6', px: '24px', tw: 'w-6' },
 { token: '8', px: '32px', tw: 'w-8' },
 { token: '10', px: '40px', tw: 'w-10' },
 { token: '12', px: '48px', tw: 'w-12' },
 { token: '16', px: '64px', tw: 'w-16' },
 { token: '20', px: '80px', tw: 'w-20' },
 { token: '24', px: '96px', tw: 'w-24' },
];

const radiusScale = [
 { label: 'sm', px: '6px', tw: 'rounded-sm' },
 { label: 'md', px: '8px', tw: 'rounded-md' },
 { label: 'lg', px: '12px', tw: 'rounded-lg' },
 { label: 'xl', px: '16px', tw: 'rounded-xl' },
 { label: '2xl', px: '24px', tw: 'rounded-2xl' },
 { label: 'full', px: '9999px', tw: 'rounded-full' },
];

const shadowScale = [
 { label: 'sm', tw: 'shadow-sm' },
 { label: 'md', tw: 'shadow-md' },
 { label: 'lg', tw: 'shadow-lg' },
 { label: 'xl', tw: 'shadow-xl' },
 { label: 'card', tw: 'shadow-card' },
 { label: 'card-hover',tw: 'shadow-card-hover'},
 { label: 'soft', tw: 'shadow-soft' },
 { label: 'button', tw: 'shadow-button' },
];

// ============================================================================
// COMPONENT PROP VARIANTS
// ============================================================================

const buttonVariants: ButtonVariant[] = ['primary', 'secondary', 'ghost', 'danger'];
const buttonSizes: ButtonSize[] = ['sm', 'md', 'lg'];
const cardVariants: CardVariant[] = ['default', 'elevated', 'outlined', 'flat'];
const badgeVariants: BadgeVariant[] = ['default', 'primary', 'success', 'warning', 'danger', 'info'];
const badgeStyles: BadgeStyle[] = ['soft', 'solid', 'outline'];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DesignGuidelines() {
 const navigate = useNavigate();
 const [formValue, setFormValue] = useState('');
 const [textareaValue, setTextareaValue] = useState('');

 const iconKeys = Object.keys(ICON_MAP) as IconKey[];

 const scrollTo = (id: string) => {
 document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
 };

 return (
 <PageLayout>
 <div className="min-h-screen bg-neutral-50">
 {/* ── Page Header ── */}
 <div className="bg-neutral-0 border-b border-neutral-200 px-6 py-4">
 <div className="max-w-7xl mx-auto flex items-center gap-4">
 <Button
 variant="ghost"
 size="sm"
 leftIcon="arrow-left"
 onClick={() => navigate('/parent/settings')}
 >
 Settings
 </Button>
 <div className="h-4 w-px bg-neutral-200" />
 <div>
 <h1 className="text-xl font-bold text-neutral-700">Design Guidelines</h1>
 <p className="text-xs text-neutral-500">
 Component library · Design token reference · Live examples
 </p>
 </div>
 </div>
 </div>

 {/* ── Body ── */}
 <div className="max-w-7xl mx-auto flex gap-8 px-6 py-8">
 {/* Sticky sidebar nav */}
 <aside className="w-44 shrink-0 hidden lg:block">
 <div className="sticky top-6">
 <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
 Contents
 </p>
 <nav className="space-y-0.5">
 {NAV_SECTIONS.map((s) => (
 <button
 key={s.id}
 onClick={() => scrollTo(s.id)}
 className="block w-full text-left text-sm px-2 py-1.5 rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
 >
 {s.label}
 </button>
 ))}
 </nav>
 </div>
 </aside>

 {/* ── Main scrollable content ── */}
 <main className="flex-1 min-w-0 space-y-14">

 {/* ════════════════════════════════ COLORS ════════════════════════════════ */}
 <Section id="colors" title="Colors">
 <SubSection title="Primary Palette">
 <div className="flex gap-2 flex-wrap">
 {primaryColors.map(({ shade, hex, tw, main }) => (
 <div key={shade} className="flex flex-col items-center gap-1.5">
 <div
 className={`w-12 h-12 rounded-xl ${tw} ${
 main ? 'ring-2 ring-offset-2 ring-primary-600' : ''
 }`}
 title={hex}
 />
 <span className="text-xs font-medium text-neutral-600">
 {shade}
 </span>
 <span className="text-xs text-neutral-400 font-mono">{hex}</span>
 </div>
 ))}
 </div>
 </SubSection>

 <SubSection title="Neutral Palette">
 <div className="flex gap-2 flex-wrap">
 {neutralColors.map(({ shade, hex, tw }) => (
 <div key={shade} className="flex flex-col items-center gap-1.5">
 <div
 className={`w-12 h-12 rounded-xl border border-neutral-200 ${tw}`}
 title={hex}
 />
 <span className="text-xs font-medium text-neutral-600">
 {shade}
 </span>
 <span className="text-xs text-neutral-400 font-mono">{hex}</span>
 </div>
 ))}
 </div>
 </SubSection>

 <SubSection title="Accent Colors">
 <div className="flex gap-5 flex-wrap">
 {accentColors.map(({ name, role, hex, tw }) => (
 <div key={name} className="flex flex-col items-center gap-1.5">
 <div className={`w-16 h-16 rounded-xl ${tw}`} title={hex} />
 <span className="text-xs font-semibold text-neutral-700">
 {name}
 </span>
 <span className="text-xs text-neutral-400 text-center max-w-[72px]">{role}</span>
 <span className="text-xs text-neutral-400 font-mono">{hex}</span>
 </div>
 ))}
 </div>
 </SubSection>

 <SubSection title="Semantic Colors">
 <div className="grid grid-cols-2 gap-3">
 {semanticColors.map(({ name, bg, border, text, hex }) => (
 <div key={name} className={`${bg} border ${border} rounded-xl p-3 flex items-center justify-between`}>
 <span className={`text-sm font-semibold ${text}`}>{name}</span>
 <span className="text-xs text-neutral-500 font-mono">{hex}</span>
 </div>
 ))}
 </div>
 </SubSection>
 </Section>

 {/* ════════════════════════════════ TYPOGRAPHY ════════════════════════════════ */}
 <Section id="typography" title="Typography">
 <SubSection title="Font Family">
 <DemoPanel>
 <div className="space-y-4">
 <div>
 <p className="text-xs text-neutral-400 mb-1 font-mono">
 --font-family-sans · Inter, system-ui, sans-serif
 </p>
 <p className="text-lg text-neutral-700">
 ABCDEFGHIJKLMNOPQRSTUVWXYZ · abcdefghijklmnopqrstuvwxyz · 0123456789
 </p>
 </div>
 <div>
 <p className="text-xs text-neutral-400 mb-1 font-mono">
 --font-family-mono · Fira Code, Monaco, Courier New
 </p>
 <p className="text-base text-neutral-700 font-mono">
 ABCDEFGHIJKLMNOPQRSTUVWXYZ · abcdefghijklmnopqrstuvwxyz
 </p>
 </div>
 </div>
 </DemoPanel>
 </SubSection>

 <SubSection title="Font Sizes">
 <DemoPanel className="p-0 divide-y divide-neutral-100">
 {fontSizes.map(({ label, value, tw }) => (
 <div key={label} className="flex items-center gap-4 px-6 py-3">
 <code className="text-xs bg-neutral-100 px-2 py-0.5 rounded text-neutral-600 w-20 shrink-0 font-mono">
 text-{label}
 </code>
 <span className="text-xs text-neutral-400 w-10 shrink-0">{value}</span>
 <span className={`${tw} text-neutral-700`}>
 The quick brown fox jumps over the lazy dog
 </span>
 </div>
 ))}
 </DemoPanel>
 </SubSection>

 <SubSection title="Font Weights">
 <DemoPanel className="p-0 divide-y divide-neutral-100">
 {fontWeights.map(({ label, value, tw }) => (
 <div key={label} className="flex items-center gap-4 px-6 py-3">
 <code className="text-xs bg-neutral-100 px-2 py-0.5 rounded text-neutral-600 w-24 shrink-0 font-mono">
 font-{label}
 </code>
 <span className="text-xs text-neutral-400 w-8 shrink-0">{value}</span>
 <span className={`${tw} text-neutral-700 text-lg`}>
 Doorslam GCSE Revision
 </span>
 </div>
 ))}
 </DemoPanel>
 </SubSection>
 </Section>

 {/* ════════════════════════════════ SPACING ════════════════════════════════ */}
 <Section id="spacing" title="Spacing">
 <p className="text-sm text-neutral-500 -mt-2">
 4px grid-based scale. Use Tailwind padding, margin, gap utilities (
 <code className="bg-neutral-100 px-1 py-0.5 rounded text-xs font-mono">
 p-*, m-*, gap-*
 </code>
 ).
 </p>
 <DemoPanel className="space-y-3">
 {spacingScale.map(({ token, px, tw }) => (
 <div key={token} className="flex items-center gap-3">
 <code className="text-xs bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-600 w-8 text-center shrink-0 font-mono">
 {token}
 </code>
 <span className="text-xs text-neutral-400 w-10 shrink-0">{px}</span>
 <div className={`${tw} h-5 bg-primary-400 rounded-sm`} />
 </div>
 ))}
 </DemoPanel>
 </Section>

 {/* ════════════════════════════════ BORDER RADIUS ════════════════════════════════ */}
 <Section id="radius" title="Border Radius">
 <div className="flex flex-wrap gap-8">
 {radiusScale.map(({ label, px, tw }) => (
 <div key={label} className="flex flex-col items-center gap-2">
 <div
 className={`w-20 h-20 bg-primary-100 border-2 border-primary-300 ${tw}`}
 />
 <code className="text-xs bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-600 font-mono">
 rounded-{label}
 </code>
 <span className="text-xs text-neutral-400">{px}</span>
 </div>
 ))}
 </div>
 </Section>

 {/* ════════════════════════════════ SHADOWS ════════════════════════════════ */}
 <Section id="shadows" title="Shadows">
 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
 {shadowScale.map(({ label, tw }) => (
 <div key={label} className="flex flex-col items-center gap-3">
 <div
 className={`w-full h-16 bg-neutral-0 rounded-xl ${tw}`}
 />
 <code className="text-xs bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-600 font-mono">
 shadow-{label}
 </code>
 </div>
 ))}
 </div>
 </Section>

 {/* ════════════════════════════════ ICONS ════════════════════════════════ */}
 <Section id="icons" title="Icons">
 <p className="text-sm text-neutral-500 -mt-2">
 All icons via{' '}
 <code className="bg-neutral-100 px-1 py-0.5 rounded text-xs font-mono">
 {'<AppIcon name="..." />'}
 </code>{' '}
 using Lucide. {iconKeys.length} registered names (includes aliases). Hover for name.
 </p>
 <DemoPanel>
 <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-1">
 {iconKeys.map((key) => (
 <div
 key={key}
 className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-neutral-100 transition-colors group cursor-default"
 title={key}
 >
 <AppIcon
 name={key}
 className="w-5 h-5 text-neutral-500 group-hover:text-primary-600"
 />
 <span
 className="text-neutral-400 text-center truncate w-full"
 style={{ fontSize: '9px' }}
 >
 {key}
 </span>
 </div>
 ))}
 </div>
 </DemoPanel>
 </Section>

 {/* ════════════════════════════════ BUTTON ════════════════════════════════ */}
 <Section id="buttons" title="Button">
 <SubSection title="Variants × Sizes">
 <DemoPanel className="space-y-4">
 {buttonSizes.map((size) => (
 <div key={size} className="flex items-center gap-3 flex-wrap">
 <code className="text-xs bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-500 font-mono w-7 text-center shrink-0">
 {size}
 </code>
 {buttonVariants.map((variant) => (
 <Button key={variant} variant={variant} size={size}>
 {variant.charAt(0).toUpperCase() + variant.slice(1)}
 </Button>
 ))}
 </div>
 ))}
 </DemoPanel>
 </SubSection>

 <SubSection title="With Icons">
 <DemoPanel className="flex flex-wrap gap-3">
 <Button variant="primary" leftIcon="plus">Add item</Button>
 <Button variant="secondary" leftIcon="arrow-left">Go back</Button>
 <Button variant="ghost" leftIcon="search">Search</Button>
 <Button variant="danger" leftIcon="trash-2">Delete</Button>
 <Button variant="primary" rightIcon="arrow-right">Continue</Button>
 <Button variant="secondary" rightIcon="chevron-down">More options</Button>
 </DemoPanel>
 </SubSection>

 <SubSection title="States">
 <DemoPanel className="flex flex-wrap gap-3">
 <Button variant="primary" loading>Saving...</Button>
 <Button variant="secondary" loading>Loading</Button>
 <Button variant="primary" disabled>Disabled</Button>
 <Button variant="secondary" disabled>Disabled</Button>
 </DemoPanel>
 </SubSection>

 <SubSection title="Full Width">
 <DemoPanel>
 <Button variant="primary" fullWidth>Full-width button</Button>
 </DemoPanel>
 </SubSection>
 </Section>

 {/* ════════════════════════════════ CARD ════════════════════════════════ */}
 <Section id="cards" title="Card">
 <SubSection title="Variants">
 <div className="grid grid-cols-2 gap-4">
 {cardVariants.map((variant) => (
 <Card key={variant} variant={variant} padding="md">
 <p className="text-sm font-semibold text-neutral-700 mb-1 capitalize">
 {variant}
 </p>
 <p className="text-xs text-neutral-500">
 This is the <strong>{variant}</strong> card variant. It uses{' '}
 {variant === 'default'
 ? 'a subtle shadow and light border'
 : variant === 'elevated'
 ? 'a prominent shadow'
 : variant === 'outlined'
 ? 'a border with no shadow'
 : 'a background colour with no border or shadow'}
 .
 </p>
 </Card>
 ))}
 </div>
 </SubSection>

 <SubSection title="With Header">
 <Card
 title="Card Title"
 subtitle="Optional subtitle"
 padding="md"
 action={<Button size="sm" variant="secondary">Action</Button>}
 >
 <p className="text-sm text-neutral-600">
 Card body content rendered below the header.
 </p>
 </Card>
 </SubSection>

 <SubSection title="Interactive">
 <Card variant="outlined" interactive padding="md">
 <p className="text-sm text-neutral-600">
 Interactive card — hover to see the border highlight effect.
 </p>
 </Card>
 </SubSection>
 </Section>

 {/* ════════════════════════════════ ALERT ════════════════════════════════ */}
 <Section id="alerts" title="Alert">
 <SubSection title="Variants">
 <div className="space-y-3">
 {(['error', 'success', 'warning', 'info'] as const).map((variant) => (
 <Alert key={variant} variant={variant}>
 This is a <strong>{variant}</strong> alert message.
 </Alert>
 ))}
 </div>
 </SubSection>

 <SubSection title="With Title">
 <Alert variant="warning" title="Session Expiring">
 Your session will expire in 5 minutes. Save your work.
 </Alert>
 </SubSection>

 <SubSection title="With Action">
 <Alert
 variant="info"
 title="Tip"
 action={<Button size="sm" variant="secondary">Learn more</Button>}
 >
 You can add multiple children from the parent dashboard.
 </Alert>
 </SubSection>
 </Section>

 {/* ════════════════════════════════ BADGE ════════════════════════════════ */}
 <Section id="badges" title="Badge">
 <SubSection title="Variants × Styles">
 <DemoPanel className="space-y-5">
 {badgeStyles.map((style) => (
 <div key={style}>
 <p className="text-xs text-neutral-400 font-mono mb-2">{style}</p>
 <div className="flex flex-wrap gap-2">
 {badgeVariants.map((variant) => (
 <Badge key={variant} variant={variant} badgeStyle={style}>
 {variant.charAt(0).toUpperCase() + variant.slice(1)}
 </Badge>
 ))}
 </div>
 </div>
 ))}
 </DemoPanel>
 </SubSection>

 <SubSection title="Sizes">
 <DemoPanel className="flex flex-wrap items-center gap-3">
 <Badge variant="primary" size="sm">Small</Badge>
 <Badge variant="primary" size="md">Medium</Badge>
 <Badge variant="primary" size="lg">Large</Badge>
 </DemoPanel>
 </SubSection>

 <SubSection title="With Icon & Dot">
 <DemoPanel className="flex flex-wrap gap-3">
 <Badge variant="success" icon="check-circle">Completed</Badge>
 <Badge variant="warning" icon="clock">Pending</Badge>
 <Badge variant="danger" icon="triangle-alert">Error</Badge>
 <Badge variant="info" icon="info">Info</Badge>
 <Badge variant="success" dot>Active</Badge>
 <Badge variant="warning" dot>Pending</Badge>
 <Badge variant="danger" dot>Offline</Badge>
 </DemoPanel>
 </SubSection>
 </Section>

 {/* ════════════════════════════════ LOADING SPINNER ════════════════════════════════ */}
 <Section id="spinners" title="LoadingSpinner">
 <SubSection title="Spinner variant · all sizes">
 <DemoPanel className="flex flex-wrap items-end gap-10">
 {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
 <div key={size} className="flex flex-col items-center gap-3">
 <LoadingSpinner size={size} />
 <code className="text-xs text-neutral-400 font-mono">{size}</code>
 </div>
 ))}
 </DemoPanel>
 </SubSection>

 <SubSection title="Dots variant · all sizes">
 <DemoPanel className="flex flex-wrap items-end gap-10">
 {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
 <div key={size} className="flex flex-col items-center gap-3">
 <LoadingSpinner size={size} variant="dots" />
 <code className="text-xs text-neutral-400 font-mono">{size}</code>
 </div>
 ))}
 </DemoPanel>
 </SubSection>

 <SubSection title="Centred with message">
 <DemoPanel>
 <LoadingSpinner size="md" message="Loading your dashboard..." centered />
 </DemoPanel>
 </SubSection>
 </Section>

 {/* ════════════════════════════════ FORM FIELD ════════════════════════════════ */}
 <Section id="forms" title="FormField">
 <DemoPanel className="grid grid-cols-2 gap-4">
 <FormField
 label="Normal input"
 placeholder="Enter something..."
 value={formValue}
 onChange={(e) => setFormValue(e.target.value)}
 name="demo-normal"
 />
 <FormField
 label="With error"
 placeholder="Enter something..."
 value=""
 onChange={() => undefined}
 error="This field is required"
 name="demo-error"
 />
 <FormField
 label="Required field"
 placeholder="Required..."
 value=""
 onChange={() => undefined}
 required
 name="demo-required"
 />
 <FormField
 label="Disabled input"
 value="Cannot be edited"
 onChange={() => undefined}
 disabled
 name="demo-disabled"
 />
 <div className="col-span-2">
 <FormField.Textarea
 label="Textarea"
 placeholder="Write your notes here..."
 value={textareaValue}
 onChange={(e) => setTextareaValue(e.target.value)}
 rows={3}
 helperText="Optional helper text appears below the field"
 name="demo-textarea"
 />
 </div>
 </DemoPanel>
 </Section>

 {/* ════════════════════════════════ EMPTY STATE ════════════════════════════════ */}
 <Section id="empty-states" title="EmptyState">
 <div className="grid grid-cols-3 gap-4">
 <DemoPanel>
 <EmptyState
 variant="default"
 icon="book"
 title="No resources"
 description="Add your first resource to get started."
 />
 </DemoPanel>
 <DemoPanel>
 <EmptyState
 variant="minimal"
 icon="calendar"
 title="No sessions"
 description="Schedule your first revision session."
 action={<Button size="sm">Add session</Button>}
 />
 </DemoPanel>
 <DemoPanel>
 <EmptyState
 icon="party-popper"
 title="All done!"
 description="You've completed everything."
 />
 </DemoPanel>
 </div>
 </Section>

 {/* ════════════════════════════════ THEME TOGGLE ════════════════════════════════ */}
 <Section id="theme-toggle" title="ThemeToggle">
 <DemoPanel>
 <div className="space-y-6">
 {(['switch', 'button', 'icon'] as const).map((variant) => (
 <div key={variant} className="flex items-center gap-4">
 <code className="text-xs bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-500 font-mono w-14 shrink-0">
 {variant}
 </code>
 <ThemeToggle variant={variant} />
 </div>
 ))}
 </div>
 </DemoPanel>
 </Section>

 {/* ════════════════════════════════ PROGRESS BAR ════════════════════════════════ */}
 <Section id="progress-bar" title="ProgressBar">
 <p className="text-sm text-neutral-500 -mt-2">
 Accessible horizontal progress bar used for session completion, topic coverage, subject progress, and rewards.
 </p>

 <SubSection title="Colors">
 <DemoPanel className="space-y-4">
 {(['primary', 'success', 'warning', 'danger', 'info'] as ProgressBarColor[]).map((color) => (
 <ProgressBar key={color} value={65} color={color} label={color} showValue size="md" />
 ))}
 </DemoPanel>
 </SubSection>

 <SubSection title="Sizes">
 <DemoPanel className="space-y-4">
 {(['sm', 'md', 'lg', 'xl'] as ProgressBarSize[]).map((size) => (
 <div key={size} className="flex items-center gap-4">
 <code className="text-xs bg-neutral-100 px-1.5 py-0.5 rounded font-mono text-neutral-500 w-7 text-center shrink-0">
 {size}
 </code>
 <div className="flex-1">
 <ProgressBar value={72} size={size} color="primary" />
 </div>
 </div>
 ))}
 </DemoPanel>
 </SubSection>

 <SubSection title="With label + value">
 <DemoPanel className="space-y-5">
 <ProgressBar value={40} color="success" size="lg" showValue label="Topic Coverage" />
 <ProgressBar value={85} color="primary" size="md" showValue label="Sessions Completed" />
 <ProgressBar value={20} color="warning" size="md" showValue label="Revision Plan" />
 <ProgressBar value={0} color="danger" size="sm" label="Not started" />
 <ProgressBar value={100} color="success" size="md" showValue label="All done!" />
 </DemoPanel>
 </SubSection>
 </Section>

 {/* ════════════════════════════════ STAT CARD ════════════════════════════════ */}
 <Section id="stat-card" title="StatCard">
 <p className="text-sm text-neutral-500 -mt-2">
 Compact KPI cell used in dashboard hero cards, insights widgets, and reward summaries.
 Renders a label, a primary value, and an optional sub-label.
 </p>

 <SubSection title="Sizes">
 <DemoPanel>
 <div className="grid grid-cols-3 gap-3">
 <StatCard size="sm" label="Small" value="4/7" sublabel="57% rate" />
 <StatCard size="md" label="Medium (default)" value="4/7" sublabel="57% rate" />
 <StatCard size="lg" label="Large" value="4/7" sublabel="57% rate" />
 </div>
 </DemoPanel>
 </SubSection>

 <SubSection title="Value colors">
 <DemoPanel>
 <div className="grid grid-cols-3 gap-3">
 <StatCard label="Default" value="4/7" valueColor="default" sublabel="Primary 900" />
 <StatCard label="Primary" value="+12%" valueColor="primary" sublabel="Brand purple" />
 <StatCard label="Success" value="85%" valueColor="success" sublabel="On track" />
 <StatCard label="Warning" value="42%" valueColor="warning" sublabel="Keep an eye" />
 <StatCard label="Danger" value="11%" valueColor="danger" sublabel="Needs attention" />
 <StatCard label="Muted" value="0/0" valueColor="muted" sublabel="Nothing yet" />
 </div>
 </DemoPanel>
 </SubSection>

 <SubSection title="Backgrounds">
 <DemoPanel className="flex gap-3">
 <StatCard background="neutral" label="Neutral (default)" value="4/7" sublabel="bg-neutral-50" className="flex-1" />
 <StatCard background="white" label="White" value="4/7" sublabel="bg-neutral-0" className="flex-1 border border-neutral-200" />
 <StatCard background="primary" label="Primary tint" value="4/7" sublabel="bg-primary-50" className="flex-1" />
 <StatCard background="none" label="Transparent" value="4/7" sublabel="no background" className="flex-1" />
 </DemoPanel>
 </SubSection>
 </Section>

 {/* ════════════════════════════════ ICON CIRCLE ════════════════════════════════ */}
 <Section id="icon-circle" title="IconCircle">
 <p className="text-sm text-neutral-500 -mt-2">
 A circular container holding a single AppIcon. Used in 12+ components for status indicators,
 empty states, insight rows, and section headers.
 </p>

 <SubSection title="Variants × Colors">
 <DemoPanel>
 {(['solid', 'soft', 'ghost'] as IconCircleVariant[]).map((variant) => (
 <div key={variant} className="mb-5 last:mb-0">
 <p className="text-xs text-neutral-400 font-mono mb-3">{variant}</p>
 <div className="flex flex-wrap gap-4">
 {(['primary', 'success', 'warning', 'danger', 'info', 'neutral'] as IconCircleColor[]).map((color) => (
 <div key={color} className="flex flex-col items-center gap-1.5">
 <IconCircle name="star" color={color} variant={variant} size="md" />
 <span className="text-xs text-neutral-400">{color}</span>
 </div>
 ))}
 </div>
 </div>
 ))}
 </DemoPanel>
 </SubSection>

 <SubSection title="Sizes">
 <DemoPanel className="flex flex-wrap items-end gap-6">
 {(['xs', 'sm', 'md', 'lg', 'xl'] as IconCircleSize[]).map((size) => (
 <div key={size} className="flex flex-col items-center gap-2">
 <IconCircle name="flame" color="warning" variant="soft" size={size} />
 <code className="text-xs text-neutral-400 font-mono">{size}</code>
 </div>
 ))}
 </DemoPanel>
 </SubSection>

 <SubSection title="Common usage patterns">
 <DemoPanel className="flex flex-wrap gap-4">
 <IconCircle name="check-circle" color="success" variant="soft" size="md" />
 <IconCircle name="triangle-alert" color="warning" variant="soft" size="md" />
 <IconCircle name="x-circle" color="danger" variant="soft" size="md" />
 <IconCircle name="info" color="info" variant="soft" size="md" />
 <IconCircle name="book" color="primary" variant="solid" size="sm" />
 <IconCircle name="calendar" color="neutral" variant="ghost" size="sm" />
 <IconCircle name="flame" color="warning" variant="solid" size="lg" />
 <IconCircle name="lightbulb" color="primary" variant="ghost" size="lg" />
 </DemoPanel>
 </SubSection>
 </Section>

 {/* ════════════════════════════════ CIRCULAR PROGRESS ════════════════════════════════ */}
 <Section id="circular-progress" title="CircularProgress">
 <p className="text-sm text-neutral-500 -mt-2">
 SVG ring progress indicator. Used for health scores, streak trackers, and pace rings.
 Accepts design-token colour names or any CSS colour string.
 </p>

 <SubSection title="Size presets">
 <DemoPanel className="flex flex-wrap items-end gap-8">
 {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
 <div key={size} className="flex flex-col items-center gap-3">
 <CircularProgress value={72} size={size} color="primary">
 <span className="text-xs font-bold text-primary-900">72%</span>
 </CircularProgress>
 <code className="text-xs text-neutral-400 font-mono">{size}</code>
 </div>
 ))}
 </DemoPanel>
 </SubSection>

 <SubSection title="Color tokens">
 <DemoPanel className="flex flex-wrap gap-8">
 {(['primary', 'success', 'warning', 'danger', 'info'] as const).map((color) => (
 <div key={color} className="flex flex-col items-center gap-3">
 <CircularProgress value={68} size="md" color={color}>
 <span className="text-sm font-bold text-neutral-700">68%</span>
 </CircularProgress>
 <code className="text-xs text-neutral-400 font-mono">{color}</code>
 </div>
 ))}
 </DemoPanel>
 </SubSection>

 <SubSection title="Real-world examples">
 <DemoPanel className="flex flex-wrap gap-10 items-start">
 {/* Health score style */}
 <div className="text-center">
 <CircularProgress value={82} max={100} color="success" size="lg">
 <span className="text-2xl font-bold text-neutral-800">82</span>
 </CircularProgress>
 <p className="text-xs text-neutral-500 mt-2">Health Score</p>
 </div>
 {/* Streak tracker style */}
 <div className="text-center">
 <CircularProgress value={5} max={7} color="primary" size="lg">
 <span className="text-2xl font-bold text-primary-900">5</span>
 <span className="text-xs text-neutral-500">day streak</span>
 </CircularProgress>
 <p className="text-xs text-neutral-500 mt-2">Streak</p>
 </div>
 {/* Pace ring style */}
 <div className="text-center">
 <CircularProgress value={63} max={100} color="warning" size="lg">
 <span className="text-2xl font-bold text-accent-amber">63%</span>
 <span className="text-xs text-neutral-500">weekly pace</span>
 </CircularProgress>
 <p className="text-xs text-neutral-500 mt-2">Pace</p>
 </div>
 {/* Zero state */}
 <div className="text-center">
 <CircularProgress value={0} max={100} color="neutral" size="md">
 <span className="text-sm font-bold text-neutral-500">—</span>
 </CircularProgress>
 <p className="text-xs text-neutral-500 mt-2">Empty state</p>
 </div>
 </DemoPanel>
 </SubSection>
 </Section>

 {/* ════════════════════════════════ AVATAR CIRCLE ════════════════════════════════ */}
 <Section id="avatar-circle" title="AvatarCircle">
 <p className="text-sm text-neutral-500 -mt-2">
 Circular user avatar — renders a photo when a src is provided, otherwise derives initials
 from the name prop. Used in the sidebar, child headers, and session participant lists.
 </p>

 <SubSection title="Initials fallback — sizes">
 <DemoPanel className="flex flex-wrap items-end gap-6">
 {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
 <div key={size} className="flex flex-col items-center gap-2">
 <AvatarCircle name="Alice Smith" size={size} />
 <code className="text-xs text-neutral-400 font-mono">{size}</code>
 </div>
 ))}
 </DemoPanel>
 </SubSection>

 <SubSection title="Color variants">
 <DemoPanel className="flex flex-wrap gap-6">
 <div className="flex flex-col items-center gap-2">
 <AvatarCircle name="Bob Jones" size="lg" color="primary" />
 <code className="text-xs text-neutral-400 font-mono">primary</code>
 </div>
 <div className="flex flex-col items-center gap-2">
 <AvatarCircle name="Clara Reed" size="lg" color="soft" />
 <code className="text-xs text-neutral-400 font-mono">soft</code>
 </div>
 <div className="flex flex-col items-center gap-2">
 <AvatarCircle name="Dan Park" size="lg" color="neutral" />
 <code className="text-xs text-neutral-400 font-mono">neutral</code>
 </div>
 </DemoPanel>
 </SubSection>

 <SubSection title="With border">
 <DemoPanel className="flex flex-wrap gap-6">
 <AvatarCircle name="Eve Adams" size="lg" bordered />
 <AvatarCircle name="Frank Hall" size="lg" bordered color="soft" />
 <AvatarCircle name="Grace Kim" size="xl" bordered />
 </DemoPanel>
 </SubSection>

 <SubSection title="With photo (src provided)">
 <DemoPanel className="flex flex-wrap gap-4 items-center">
 <AvatarCircle
 name="Picsum Photo"
 src="https://i.pravatar.cc/80?img=1"
 size="sm"
 />
 <AvatarCircle
 name="Picsum Photo"
 src="https://i.pravatar.cc/80?img=5"
 size="md"
 bordered
 />
 <AvatarCircle
 name="Picsum Photo"
 src="https://i.pravatar.cc/80?img=9"
 size="lg"
 bordered
 />
 {/* Broken src falls through to initials */}
 <AvatarCircle
 name="Broken Image"
 src={null}
 size="md"
 />
 </DemoPanel>
 </SubSection>
 </Section>

 </main>
 </div>
 </div>
 </PageLayout>
 );
}
