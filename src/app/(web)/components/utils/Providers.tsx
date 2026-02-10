"use client";

import {
  type BorderStyle,
  type ChartMode,
  type ChartVariant,
  DataThemeProvider,
  IconProvider,
  LayoutProvider,
  type NeutralColor,
  type ScalingSize,
  type Schemes,
  type SolidStyle,
  type SolidType,
  type SurfaceStyle,
  ThemeProvider,
  ToastProvider,
  type TransitionStyle,
} from "@once-ui-system/core";
import { style, dataStyle } from "@/web/resources";
import { iconLibrary } from "@/web/resources/icons";
import { AvailabilityProvider } from "@/web/components/utils/AvailabilityContext";
import { ToastServiceProvider } from "@/web/components/utils/ToastService";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LayoutProvider>
      <ThemeProvider
        brand={style.brand as Schemes}
        accent={style.accent as Schemes}
        neutral={style.neutral as NeutralColor}
        solid={style.solid as SolidType}
        solidStyle={style.solidStyle as SolidStyle}
        border={style.border as BorderStyle}
        surface={style.surface as SurfaceStyle}
        transition={style.transition as TransitionStyle}
        scaling={style.scaling as ScalingSize}
      >
        <DataThemeProvider
          variant={dataStyle.variant as ChartVariant}
          mode={dataStyle.mode as ChartMode}
          height={dataStyle.height}
          axis={{
            stroke: dataStyle.axis.stroke,
          }}
          tick={{
            fill: dataStyle.tick.fill,
            fontSize: dataStyle.tick.fontSize,
            line: dataStyle.tick.line,
          }}
        >
          <ToastProvider>
            <ToastServiceProvider>
              <IconProvider icons={iconLibrary}>
                <AvailabilityProvider>{children}</AvailabilityProvider>
              </IconProvider>
            </ToastServiceProvider>
          </ToastProvider>
        </DataThemeProvider>
      </ThemeProvider>
    </LayoutProvider>
  );
}
