// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    'nuxt-auth-utils',
    'nitro-cloudflare-dev',
    '@nuxt/image'
  ],

  runtimeConfig: {
    oauth: {
      github: {
        clientId: "",
        clientSecret: "",
      },
    },
  },

  ssr: true,

  nitro: {
    preset: 'cloudflare-pages'
  },

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css', 'leaflet/dist/leaflet.css'],

  routeRules: {
    '/': { prerender: false }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})