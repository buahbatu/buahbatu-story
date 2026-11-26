const PATHS = {
  hand: 'M9 12V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5V4a1.5 1.5 0 0 1 3 0v6.5m0-3a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-.5a6 6 0 0 1-4.8-2.4L3.6 14.2a1.5 1.5 0 0 1 2.3-1.9L9 15',
  jump: 'M12 20V6M6 11l6-6 6 6M5 21h14',
  run: 'M5 6l6 6-6 6M13 6l6 6-6 6',
  sliders: 'M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1M15 4v4M9 10v4M17 16v4',
  tool: 'M14.7 6.3a4 4 0 0 0-5.3 5.3L3.5 17.5l3 3 5.9-5.9a4 4 0 0 0 5.3-5.3l-2.6 2.6-2.4-.6-.6-2.4z',
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, class: cls }: { name: IconName; class?: string }) {
  return (
    <svg
      class={cls}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
