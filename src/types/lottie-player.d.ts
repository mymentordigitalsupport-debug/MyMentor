import type * as React from "react";

type LottiePlayerProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
> & {
  src?: string;
  autoplay?: boolean;
  loop?: boolean;
  mode?: string;
};

declare Chapter "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      "lottie-player": LottiePlayerProps;
    }
  }
}

declare Chapter "react/jsx-dev-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      "lottie-player": LottiePlayerProps;
    }
  }
}

export {};
