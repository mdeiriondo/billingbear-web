# 🚀 Guía de Deploy en Netlify

Esta guía te ayudará a configurar y deployar el proyecto Billingbear Web en Netlify.

## 📋 Pre-requisitos

1. ✅ Cuenta en GitHub (ya configurada)
2. ✅ Cuenta en Netlify
3. ✅ Repositorio sincronizado con GitHub

## 🔧 Configuración en Netlify

### Paso 1: Conectar el repositorio

1. Ve a [Netlify Dashboard](https://app.netlify.com)
2. Click en **"Add new site"** → **"Import an existing project"**
3. Selecciona **"GitHub"** como proveedor
4. Autoriza Netlify si es necesario
5. Selecciona el repositorio `mdeiriondo/billingbear-web`
6. Netlify detectará automáticamente la configuración de Astro

### Paso 2: Configurar variables de entorno

En la configuración del sitio en Netlify, ve a **Site settings** → **Environment variables** y agrega:

#### Variables de WooCommerce (requeridas):
```
WOOCOMMERCE_URL=https://billingbearpark.com
WOOCOMMERCE_CONSUMER_KEY=ck_3b12ac063ac27b6dd1cea80b8c0dc6b5ebb2a1b8
WOOCOMMERCE_CONSUMER_SECRET=cs_94d434cb263fd127a3146ae88c51fdd0728cf1cc
```

#### Variable de WordPress (opcional, tiene fallback):
```
WORDPRESS_URL=https://billingbearpark.com
```

**Nota:** Si no configuras `WORDPRESS_URL`, el sistema usará `https://billingbearpark.com` por defecto.

### Paso 3: Configuración de Build

Netlify debería detectar automáticamente:
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** 20 (configurado en `netlify.toml`)

Si necesitas ajustar manualmente:
- Ve a **Site settings** → **Build & deploy** → **Build settings**
- Verifica que los valores coincidan con los mencionados arriba

## 🔄 Sincronización con GitHub

### Estado actual:
- ✅ Repositorio remoto configurado: `https://github.com/mdeiriondo/billingbear-web.git`
- ✅ Working tree limpio

### Para hacer deploy:

1. **Asegúrate de que todos los cambios estén commiteados:**
   ```bash
   git status
   ```

2. **Si hay cambios sin commitear, haz commit y push:**
   ```bash
   git add .
   git commit -m "Preparación para deploy en Netlify"
   git push origin master
   ```

3. **Netlify detectará automáticamente el push y hará deploy**

### Deploy manual (opcional):

Si necesitas hacer deploy manual sin hacer push:
1. Ve a **Deploys** en el dashboard de Netlify
2. Click en **"Trigger deploy"** → **"Deploy site"**

## 📝 Archivos de configuración creados

### `netlify.toml`
- Configura el comando de build
- Define el directorio de publicación
- Configura la versión de Node.js
- Configura redirects para SSR

### `astro.config.mjs`
- Actualizado con el adaptador `@astrojs/netlify` para SSR

### `src/lib/wp.ts`
- Actualizado para usar variables de entorno en lugar de URL hardcodeada

## 🔍 Verificación post-deploy

Después del deploy, verifica:

1. ✅ El sitio carga correctamente
2. ✅ Las páginas SSR funcionan (endpoints API)
3. ✅ La conexión con WordPress funciona
4. ✅ La integración con WooCommerce funciona
5. ✅ Los formularios y checkout funcionan

## 🐛 Troubleshooting

### Error: "Function not found"
- Verifica que `output: 'server'` esté en `astro.config.mjs`
- Verifica que el adaptador `netlify()` esté configurado

### Error: "Environment variables not found"
- Verifica que las variables estén configuradas en Netlify
- Verifica que los nombres coincidan exactamente (case-sensitive)

### Error: "Build failed"
- Revisa los logs de build en Netlify
- Verifica que todas las dependencias estén en `package.json`
- Verifica que la versión de Node.js sea compatible

### Error de conexión con WordPress/WooCommerce
- Verifica que las URLs sean correctas (sin trailing slash)
- Verifica que las credenciales de WooCommerce sean válidas
- Verifica que el sitio WordPress esté accesible públicamente

## 📚 Recursos adicionales

- [Documentación de Astro + Netlify](https://docs.astro.build/en/guides/integrations-guide/netlify/)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)
- [Netlify Build Settings](https://docs.netlify.com/configure-builds/overview/)

---

**Última actualización:** Febrero 2026
