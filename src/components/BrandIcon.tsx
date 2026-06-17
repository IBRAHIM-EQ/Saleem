/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { T } from "../constants";

export function BrandIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M17 8C8 10 5.9 16.17 3.82 19.15C2.8 20.63 3.08 22 4.5 22C6.5 22 8.5 20 10 18C11.5 16 13.5 10 17 8Z"
        fill={T.mint}
      />
      <path
        d="M17 8C17 8 20 4 22 2C22 2 20 8 17 14C17 14 15 18 12 20C12 20 14 14 17 8Z"
        fill={T.mintDark}
      />
    </svg>
  );
}
