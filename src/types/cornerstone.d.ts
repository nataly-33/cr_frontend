// Type declarations for cornerstone-legacy libraries

declare module "cornerstone-core" {
  export interface Viewport {
    scale: number;
    translation: { x: number; y: number };
    voi: { windowWidth: number; windowCenter: number };
    invert: boolean;
    rotation: number;
    hflip: boolean;
    vflip: boolean;
    pixelReplication?: boolean;
    colormap?: string;
    labelmap?: boolean;
  }

  export interface EnabledElementOptions {
    renderer?: "webgl" | "canvas";
  }

  export interface Image {
    imageId: string;
    minPixelValue: number;
    maxPixelValue: number;
    slope: number;
    intercept: number;
    windowCenter: number;
    windowWidth: number;
    rows: number;
    columns: number;
    height: number;
    width: number;
    color: boolean;
    rgba: boolean;
    columnPixelSpacing: number;
    rowPixelSpacing: number;
    sizeInBytes: number;
  }

  export function enable(element: HTMLElement, options?: EnabledElementOptions): void;
  export function disable(element: HTMLElement): void;
  export function loadImage(imageId: string): Promise<Image>;
  export function displayImage(element: HTMLElement, image: Image, viewport?: Viewport): void;
  export function getViewport(element: HTMLElement): Viewport | undefined;
  export function setViewport(element: HTMLElement, viewport: Viewport): void;
  export function reset(element: HTMLElement): void;
  export function getEnabledElement(element: HTMLElement): { image: Image; viewport: Viewport } | undefined;
  export function updateImage(element: HTMLElement): void;
  export function registerImageLoader(scheme: string, loader: (imageId: string) => Promise<Image>): void;
  export function getDefaultViewportForImage(element: HTMLElement, image: Image): Viewport;
}

declare module "cornerstone-wado-image-loader" {
  export const external: {
    cornerstone: typeof import("cornerstone-core");
    dicomParser: typeof import("dicom-parser");
  };

  export function configure(options: {
    useWebWorkers?: boolean;
    decodeConfig?: {
      convertFloatPixelDataToInt?: boolean;
    };
    beforeSend?: (xhr: XMLHttpRequest) => void;
  }): void;

  export const webWorkerManager: {
    initialize(config: {
      maxWebWorkers?: number;
      startWebWorkersOnDemand?: boolean;
      taskConfiguration?: Record<string, unknown>;
      webWorkerPath?: string;
    }): void;
  };

  export const wadouri: {
    loadImage(imageId: string): Promise<import("cornerstone-core").Image>;
  };
}

declare module "dicom-parser" {
  export interface DataSet {
    string(tag: string): string | undefined;
    uint16(tag: string): number | undefined;
    uint32(tag: string): number | undefined;
    int16(tag: string): number | undefined;
    int32(tag: string): number | undefined;
    float(tag: string): number | undefined;
    double(tag: string): number | undefined;
    intString(tag: string): number | string | undefined;
    floatString(tag: string): number | undefined;
    elements: Record<string, Element>;
    byteArray: Uint8Array;
  }

  export interface Element {
    tag: string;
    vr: string;
    length: number;
    dataOffset: number;
  }

  export function parseDicom(byteArray: Uint8Array): DataSet;
}
