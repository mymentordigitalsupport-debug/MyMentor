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

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      "lottie-player": LottiePlayerProps;
    }
  }
}

declare module "react/jsx-dev-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      "lottie-player": LottiePlayerProps;
    }
  }
}

export {};
