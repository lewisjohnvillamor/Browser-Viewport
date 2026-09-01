// Device catalog: CSS viewport sizes (dp), grouped for the picker.
// `on` marks the devices enabled on first run.
//
// Sizes are the browser's CSS viewport, not the hardware pixel count, and a
// few vary slightly with browser chrome or OS scaling. Treat them as the
// standard breakpoints to design against, and edit freely — adding a device
// is one line.
const DEVICE_GROUPS = [
  {
    group: "Phones",
    devices: [
      { id: "galaxy-fold-folded", name: "Galaxy Fold (folded)", w: 280, h: 653 },
      { id: "iphone-se-1", name: "iPhone SE (1st gen)", w: 320, h: 568 },
      { id: "galaxy-z-fold", name: "Galaxy Z Fold 5", w: 344, h: 882 },
      { id: "android-small", name: "Android (small)", w: 360, h: 640 },
      { id: "galaxy-s8", name: "Galaxy S8", w: 360, h: 740 },
      { id: "iphone-13-mini", name: "iPhone 13 mini", w: 360, h: 780 },
      { id: "iphone-se", name: "iPhone SE", w: 375, h: 667 },
      { id: "iphone-x", name: "iPhone X / 11 Pro", w: 375, h: 812 },
      { id: "iphone-12-pro", name: "iPhone 12 / 13 / 14", w: 390, h: 844 },
      { id: "iphone-15", name: "iPhone 15 / 16", w: 393, h: 852 },
      { id: "iphone-16-pro", name: "iPhone 16 Pro", w: 402, h: 874 },
      { id: "galaxy-s20-ultra", name: "Galaxy S20 Ultra", w: 412, h: 915 },
      { id: "pixel-9", name: "Pixel 9", w: 412, h: 923 },
      { id: "iphone-xr", name: "iPhone XR / 11", w: 414, h: 896 },
      { id: "iphone-14-pro-max", name: "iPhone 13 / 14 Pro Max", w: 428, h: 926 },
      { id: "iphone-16-plus", name: "iPhone 16 Plus", w: 430, h: 932 },
      { id: "iphone-16-pro-max", name: "iPhone 16 Pro Max", w: 440, h: 956, on: true },
    ],
  },
  {
    group: "Tablets",
    devices: [
      { id: "nexus-7", name: "Nexus 7", w: 600, h: 960 },
      { id: "ipad-mini", name: "iPad Mini", w: 768, h: 1024 },
      { id: "android-tablet", name: "Android tablet", w: 800, h: 1280 },
      { id: "ipad-10", name: "iPad 10.2", w: 810, h: 1080 },
      { id: "ipad-air", name: "iPad Air", w: 820, h: 1180, on: true },
      { id: "ipad-pro-11", name: "iPad Pro 11", w: 834, h: 1194 },
      { id: "surface-pro-7", name: "Surface Pro 7", w: 912, h: 1368 },
      { id: "ipad-pro", name: "iPad Pro 12.9", w: 1024, h: 1366 },
    ],
  },
  {
    group: "Laptops",
    devices: [
      { id: "macbook-air", name: "MacBook Air 13", w: 1280, h: 715, on: true },
      { id: "chromebook", name: "Chromebook / small laptop", w: 1280, h: 800 },
      { id: "windows-laptop", name: "Windows Laptop", w: 1366, h: 768 },
      { id: "macbook-air-15", name: "MacBook Air 15", w: 1440, h: 900 },
      { id: "macbook-pro-16", name: "MacBook Pro 16", w: 1512, h: 857 },
      { id: "windows-scaled", name: "Windows (125% scaled)", w: 1536, h: 864 },
      { id: "laptop-wsxga", name: "Laptop WSXGA+", w: 1680, h: 1050 },
    ],
  },
  {
    group: "Desktops",
    devices: [
      { id: "desktop-hd", name: "Desktop HD", w: 1920, h: 1080, on: true },
      { id: "desktop-2k", name: "Desktop 2K", w: 2560, h: 1440 },
      { id: "ultrawide", name: "Ultrawide 21:9", w: 3440, h: 1440 },
      { id: "big-screen-4k", name: "Big Screen 4K", w: 3840, h: 2160 },
    ],
  },
  {
    group: "Legacy screens",
    devices: [
      { id: "svga", name: "SVGA (old monitor)", w: 800, h: 600 },
      { id: "xga", name: "XGA (classic 4:3)", w: 1024, h: 768 },
      { id: "sxga", name: "SXGA (5:4)", w: 1280, h: 1024 },
      { id: "wxga", name: "WXGA (netbook)", w: 1280, h: 720 },
    ],
  },
];
