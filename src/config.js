export const links = {
  discord: 'https://discord.gg/JQXkMrpuQu',
  github: 'https://github.com/warpdrive-console',
  roturDocs: 'https://docs.rotur.dev',
  originChats: 'https://originchats.mistium.com',
}

export const rotur = {
  // paste your app id from rotur.dev/me/developer (VITE_ROTUR_CLIENT_ID overrides this)
  clientId: import.meta.env.VITE_ROTUR_CLIENT_ID || '',
  api: 'https://api.rotur.dev',
}

export const engines = {
  web: ['TurboWarp', 'Scratch mods', 'GDevelop', 'Construct', 'GB Studio', 'PICO-8'],
  native: ['Godot', 'Unity', 'GameMaker Studio 2', 'GDevelop', 'Construct', 'Defold'],
}
