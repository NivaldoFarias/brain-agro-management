import "styled-components";

import type { Theme } from "./theme";

declare module "styled-components" {
    /**
     * Extend styled-components DefaultTheme with our custom theme.
     * This enables type checking and autocomplete for theme properties.
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    export interface DefaultTheme extends Theme {}
}
