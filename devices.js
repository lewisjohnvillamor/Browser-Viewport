// Device catalog: CSS viewport sizes (dp), grouped for the picker.
// `on` marks the devices enabled on first run.
const DEVICE_GROUPS = [
  {
    group: "Phones",
    devices: [
      { id: "iphone-se", name: "iPhone SE", w: 375, h: 667 },
      { id: "iphone-12-pro", name: "iPhone 12 Pro", w: 390, h: 844 },
      { id: "iphone-16-pro-max", name: "iPhone 16 Pro Max", w: 440, h: 956, on: true },
      { id: "pixel-9", name: "Pixel 9", w: 412, h: 923 },
      { id: "galaxy-s20-ultra", name: "Galaxy S20 Ultra", w: 412, h: 915 },
      { id: "galaxy-z-fold", name: "Galaxy Z Fold 5", w: 344, h: 882 },
    ],
  },
  {
    group: "Tablets",
    devices: [
      { id: "ipad-mini", name: "iPad Mini", w: 768, h: 1024 },
      { id: "ipad-air", name: "iPad Air", w: 820, h: 1180, on: true },
      { id: "ipad-pro", name: "iPad Pro 12.9", w: 1024, h: 1366 },
      { id: "surface-pro-7", name: "Surface Pro 7", w: 912, h: 1368 },
    ],
  },
  {
    group: "Laptops",
    devices: [
      { id: "macbook-air", name: "MacBook Air 13", w: 1280, h: 715, on: true },
      { id: "macbook-pro-16", name: "MacBook Pro 16", w: 1512, h: 857 },
      { id: "windows-laptop", name: "Windows Laptop", w: 1366, h: 768 },
    ],
  },
  {
    group: "Desktops",
    devices: [
      { id: "desktop-hd", name: "Desktop HD", w: 1920, h: 1080, on: true },
      { id: "desktop-2k", name: "Desktop 2K", w: 2560, h: 1440 },
      { id: "big-screen-4k", name: "Big Screen 4K", w: 3840, h: 2160 },
    ],
  },
];
