cat << 'EOS' > src/types/custom-elements.d.ts
declare namespace JSX {
  interface IntrinsicElements {
    'mux-player': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      ref?: React.RefObject<HTMLElement>;
      playbackId?: string;
      streamType?: string;
      playing?: boolean;
      muted?: boolean;
      audio?: boolean;
      style?: React.CSSProperties;
    };
  }
}
EOS