# Listado de IDs de WooCommerce para Vouchers

**Fecha de generación:** $(date)

## Resumen de Actualizaciones Necesarias

### ✅ Vouchers con ID Correcto (No requieren cambios)
- **Monetary Gift Voucher** → ID: `3656` ✅

### ⚠️ Vouchers que Necesitan Actualización

| Voucher Name | ID Actual en ACF | ID Correcto WC | Estado |
|--------------|------------------|----------------|--------|
| 9 holes on the New Course | 162 | **3606** | ⚠️ Cambiar |
| 18 holes on the Old Course | 163 | **3580** | ⚠️ Cambiar |
| 4 golfers, 18 holes on the Old Course | 164 | **4160** ⚠️ | ⚠️ Revisar manualmente |
| 2 golfers, 9 holes on the New Course & refreshments | 165 | **4160** ⚠️ | ⚠️ Revisar manualmente |
| 2 golfers, 18 holes on the Old Course, buggy & refreshments | 167 | **4160** ⚠️ | ⚠️ Revisar manualmente |
| 1 golfer, 18 holes on the Old Course & refreshments | 168 | **4160** ⚠️ | ⚠️ Revisar manualmente |
| 1 golfer, 9 holes on the New Course & refreshments | No configurado | **4160** ⚠️ | ⚠️ Revisar manualmente |

### ❌ Vouchers Sin Match Automático (Revisar Manualmente)

| Voucher Name | ID Actual en ACF | Acción Requerida |
|--------------|------------------|------------------|
| Wine and Golf | 158 | Buscar producto "Wine and Golf" en WooCommerce |
| 10 x 45 minute individual lessons | 159 | Buscar producto de lecciones en WooCommerce |
| 45 minute individual lesson | 160 | Buscar producto de lección individual en WooCommerce |

---

## 📦 Todos los Productos Disponibles en WooCommerce

| ID  | Nombre del Producto | Precio |
|-----|---------------------|--------|
| 4160 | a wine tour for 2 at Stanlake Park and 9 holes for 2 golfers | £70.00 |
| 4058 | Test Booking Product | £0.01 |
| 4044 | voucher for 1 hour of shuffleboard | £20.00 |
| 3974 | Shuffleboard bookings | £20.00 |
| 3730 | a Billingbear beanie or bobble hat | £22.00 |
| 3728 | a Billingbear cap | £18.00 |
| **3656** | **Monetary Gift Voucher** | £10.00 |
| **3606** | **2 golfers, 9 holes on the New Course & refreshments** | £55 |
| 3605 | 2 golfers, 9 holes on the Old Course & refreshments | £65 |
| 3583 | 1 golfer, 9 holes on the New Course, refreshments, equipment | £65.00 |
| **3581** | **1 golfer, 9 holes on the New Course & refreshments** | £27 |
| **3580** | **2 golfers, 18 holes on the Old course & refreshments** | £90 |
| 3566 | discounted drinks with our Billingbear reuseable mug or bottle | £15 |
| 3400 | Gift Card | £N/A |
| 3351 | Gift Card | £10 |

---

## ⚠️ Notas Importantes

1. **Varios vouchers apuntan al mismo producto (4160)**: Esto parece incorrecto. El producto 4160 es "a wine tour for 2 at Stanlake Park and 9 holes for 2 golfers", pero varios vouchers diferentes están usando este ID. **Revisa manualmente** cada uno de estos vouchers:
   - "4 golfers, 18 holes on the Old Course"
   - "2 golfers, 9 holes on the New Course & refreshments"
   - "2 golfers, 18 holes on the Old Course, buggy & refreshments"
   - "1 golfer, 18 holes on the Old Course & refreshments"
   - "1 golfer, 9 holes on the New Course & refreshments"

2. **Vouchers sin match**: Los siguientes vouchers no encontraron producto coincidente automáticamente:
   - Wine and Golf
   - 10 x 45 minute individual lessons
   - 45 minute individual lesson
   
   **Acción:** Busca estos productos manualmente en WooCommerce > Products y actualiza el campo `woo_product_id` en ACF.

3. **Productos que podrían ser los correctos** (basado en nombres similares):
   - "1 golfer, 9 holes on the New Course & refreshments" → Podría ser **3581** (£27)
   - "2 golfers, 9 holes on the New Course & refreshments" → Podría ser **3606** (£55) ✅ (ya detectado)
   - "2 golfers, 18 holes on the Old course & refreshments" → Podría ser **3580** (£90) ✅ (ya detectado)

---

## 📝 Instrucciones para Actualizar en ACF

1. Ve a WordPress Admin
2. Edita cada voucher (Vouchers > [Nombre del Voucher])
3. En el campo ACF "WooCommerce Product ID", actualiza con el ID correcto de la tabla arriba
4. Guarda los cambios

---

## 🔄 Para Regenerar Este Listado

Ejecuta el script:
```bash
node scripts/get-voucher-woo-ids.mjs
```
