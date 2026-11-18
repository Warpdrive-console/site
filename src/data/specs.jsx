// Home console parts. `at` places the hotspot on the board diagram (percent).
export const PARTS = [
  {
    id: "soc",
    icon: "cpu",
    key: "Processor",
    val: "Qualcomm QCS6490",
    at: [44, 44],
    body: (
      <>
        The <strong>QCS6490</strong> is an industrial grade <em class="c">6nm</em> SoC with an octa
        core Kryo 670 CPU. It is designed for always on edge devices and has more than enough
        muscle for indie games. Its consumer counterpart is the Snapdragon 778G, so think{" "}
        <strong>Linux gaming performance</strong> on industrial silicon: stable clocks,{" "}
        <em class="p">low thermals</em>, and long term availability.
      </>
    ),
  },
  {
    id: "gpu",
    icon: "gpu",
    key: "GPU",
    val: "Adreno 643",
    at: [44, 44],
    inside: "soc",
    body: (
      <>
        The <strong>Adreno 643</strong> supports <em class="c">Vulkan 1.1</em> and{" "}
        <em class="c">OpenGL ES 3.2</em>. The real play is WebGPU through Chromium, which hands
        developers a <strong>modern GPU API</strong> with compute shaders and instanced rendering,
        plus enough headroom to push 2D hard and run 3D at respectable framerates. Hardware video
        decode covers media heavy menus and cutscenes. 4K at 60Hz is on the table if you know how
        to optimise.
      </>
    ),
  },
  {
    id: "ram",
    icon: "ram",
    key: "Memory",
    val: "8GB LPDDR5",
    at: [68, 30],
    body: (
      <>
        <em class="c">8GB of LPDDR5</em> shared between system and GPU. No dedicated VRAM, but the
        bandwidth is enormous next to what indie games actually ask for, and it is the main reason
        the home console pulls ahead of the LPDDR4X handhelds on busy scenes. Room to run your
        game, the social overlay and background downloads at once without choking.
      </>
    ),
  },
  {
    id: "storage",
    icon: "disk",
    key: "Storage",
    val: "0–256GB eMMC + Micro SD",
    at: [68, 66],
    body: (
      <>
        <strong>eMMC onboard</strong> from 0 to 256GB, plus a <em class="c">Micro SD</em> slot for
        expansion. Install disc games to storage and play without the disc later. The OS is light
        enough to leave <em class="p">most of the drive for your library</em>, and SD cards hot
        swap so you can carry a collection between units.
      </>
    ),
  },
  {
    id: "api",
    icon: "layers",
    key: "Graphics API",
    val: "Vulkan · WebGPU · Wayland",
    at: [24, 30],
    body: (
      <>
        <em class="c">WebGPU</em> is the primary path for web based games. Modern, fast, cross
        engine. <strong>Vulkan</strong> is there for native ARM titles that want direct GPU access.{" "}
        <em class="p">Wayland</em> composites the dashboard. Three layers, each doing one job, no
        bloat in between.
      </>
    ),
  },
  {
    id: "media",
    icon: "disc",
    key: "Media",
    val: "8x DVD drive + digital",
    at: [18, 70],
    body: (
      <>
        An <strong>8x DVD drive</strong> reads full size 4.7GB discs in custom{" "}
        <em class="p">purple collector cases</em>. Install once and play forever. The disc is proof
        of ownership, not a requirement, and buying it registers the game to your Rotur library so
        it also works on your handheld. <em class="c">Both paths are first class.</em>
      </>
    ),
  },
  {
    id: "os",
    icon: "terminal",
    key: "Operating system",
    val: "Custom Armbian derivative",
    at: [86, 48],
    body: (
      <>
        A <strong>custom Armbian based Linux build</strong>, stripped down for Warpdrive, tweakers
        and modders alike. Open firmware, <em class="c">fully auditable and fully moddable</em>. The
        dashboard is a web app you can theme and hack, and the homebrew launcher ships out of the
        box. It is <em class="p">your console</em>.
      </>
    ),
  },
  {
    id: "node",
    icon: "atom",
    key: "Process node",
    val: "6nm",
    at: [44, 44],
    inside: "soc",
    body: (
      <>
        <strong>6nm fabrication</strong> means good <em class="c">power efficiency</em> and low
        heat. No fan needed in most scenarios. The chip sips power next to older nodes, which keeps
        the console <em class="p">quiet, cool and compact</em>. Industrial silicon also means long
        production availability. If you want the honest version: we were told 6nm is good, and we
        are repeating it with confidence.
      </>
    ),
  },
];

// Handheld vs home console, row by row.
export const COMPARE = [
  ["Processor", "Unified across the whole line", "Qualcomm QCS6490"],
  ["Memory", "LPDDR4X, identical on every unit", "8GB LPDDR5, higher bandwidth"],
  ["Graphics", "Shared handheld GPU, one profile", "Adreno 643, higher tier"],
  ["Output", "Built in display", "Television, up to 4K at 60Hz"],
  ["Media", "Digital and installed titles", "Digital plus 8x DVD drive"],
  ["Build target", "One handheld build", "One console build"],
  ["Library", "Your Rotur library", "The same Rotur library"],
];

export const FORMS = {
  handheld: {
    title: "Unified specs. Diverse forms.",
    body: (
      <>
        Every handheld in the ecosystem ships with the{" "}
        <strong>same processor and the same LPDDR4X memory</strong>. Optimise your handheld build
        once and it performs identically on every device in the line. The shells, the screens and
        the layouts change. The silicon does not.
      </>
    ),
    list: [
      ["Shared SoC", "across every handheld we make"],
      ["LPDDR4X memory", "same configuration everywhere"],
      ["One build target", "no per device profiling"],
      ["Form factor freedom", "different sizes, layouts and price points"],
    ],
  },
  console: {
    title: "The powerhouse. Built for the TV.",
    body: (
      <>
        The home console targets the big screen, so it moves up a performance tier. It swaps the
        handheld memory for <strong>faster, higher bandwidth LPDDR5</strong> and carries a{" "}
        <strong>noticeably stronger GPU</strong> to hold higher resolutions and steadier
        framerates. Complex scenes stop fighting the memory bus.
      </>
    ),
    list: [
      ["8GB LPDDR5", "more bandwidth for busy scenes"],
      ["Adreno 643 GPU", "comfortable at higher resolutions"],
      ["Disc drive", "physical games and collector cases"],
      ["Comparable architecture", "so cross porting stays simple"],
    ],
  },
};
