declare global {
  namespace JSX {
    interface IntrinsicElements {
      'mux-player': React.HTMLAttributes<HTMLElement> & {
        ref?: React.Ref<any>;
        'stream-type': string;
        'playback-id': string;
        'metadata-video-title': string;
        'accent-color': string;
        poster: string;
        placeholder: string;
      }
    }
  }
}