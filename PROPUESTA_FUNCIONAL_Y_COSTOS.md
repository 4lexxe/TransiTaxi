# Presupuesto Funcional y Técnico

## 1. Objetivo del Documento
Este documento define una propuesta completa para una plataforma de movilidad urbana bajo demanda, con dos perfiles operativos (cliente y conductor), incluyendo alcance funcional, trabajo de ingeniería, fases de ejecución con Proceso Unificado, estimación de horas y presupuesto orientativo para cliente.

El objetivo es que el cliente comprenda:
- Qué se construye.
- Qué incluye cada módulo.
- Cuánto esfuerzo requiere.
- Cuánto cuesta según escenario.

---

## Índice de Contenidos

1. [Objetivo del Documento](#1-objetivo-del-documento)
2. [Descripción General del Sistema](#2-descripción-general-del-sistema)
3. [Roles del Sistema](#3-roles-del-sistema)
4. [Módulos Funcionales (Alcance)](#4-módulos-funcionales-alcance)
5. [Detalle Funcional por Rol](#5-detalle-funcional-por-rol)
6. [Proceso de Desarrollo (Proceso Unificado)](#6-proceso-de-desarrollo-proceso-unificado)
7. [Estructura de Trabajo (WBS) con Horas](#7-estructura-de-trabajo-wbs-con-horas)
8. [Presupuesto Estimado](#8-presupuesto-estimado)
9. [Cronograma Referencial](#9-cronograma-referencial)
10. [Entregables al Cliente](#10-entregables-al-cliente)
11. [Supuestos](#11-supuestos)
12. [Exclusiones](#12-exclusiones-no-incluidas-en-este-presupuesto)
13. [Riesgos y Mitigación](#13-riesgos-y-mitigación)
14. [Propuesta de Implementación por Fases](#14-propuesta-de-implementación-por-fases)
15. [Forma de Pago Recomendada](#15-forma-de-pago-recomendada-presupuesto-total-ars-1200000)
16. [Cierre Ejecutivo](#16-cierre-ejecutivo)

---

## 2. Descripción General del Sistema
Plataforma digital multiplataforma para solicitar y gestionar viajes en tiempo real.

Características principales:
- App web responsive para cliente y conductor.
- Aplicación mobile nativa (iOS/Android) con misma funcionalidad que web.
- Motor de asignación y gestión de viajes en tiempo real.
- Mapa interactivo con origen, destino, ruta y estado de recorrido.
- Sistema de notificaciones push (mobile) y alertas en tiempo real.
- Correos transaccionales e integración de pagos.

---

## 3. Roles del Sistema

## 3.1 Cliente
Usuario que solicita viajes, visualiza tarifa, confirma servicio y da seguimiento al recorrido.

## 3.2 Conductor
Usuario que recibe solicitudes, acepta/rechaza viajes y ejecuta el recorrido hasta su cierre.

---

## 4. Módulos Funcionales (Alcance)

### Referencias visuales por parte

**Autenticación**

![Autenticación](Frontend/public/screens/user-auth.png)

**Módulo Usuario**

![Módulo Usuario](Frontend/public/screens/user-module.png)

**Módulo Conductor**

![Módulo Conductor](Frontend/public/screens/captain-module.png)

**Sidebar / Perfil e Historial**

![Sidebar](Frontend/public/screens/sidebar.png)

## 4.1 Autenticación y Acceso
Descripción breve:
Módulo de seguridad para registrar usuarios, iniciar sesión y recuperar acceso.

Incluye:
- Registro cliente y conductor.
- Inicio de sesión por email/contraseña.
- Verificación de email.
- Recuperación y reseteo de contraseña.
- Gestión de sesión (token).

Opcionales:
- Login con Google.
- Login con redes sociales (Facebook/Apple según prioridad comercial).

## 4.2 Gestión de Perfil
Descripción breve:
Módulo para editar y mantener datos de cuenta por cada rol.

Incluye:
- Datos personales.
- Datos del vehículo (conductor).
- Estado de verificación de email.

## 4.3 Búsqueda Geográfica y Direcciones
Descripción breve:
Módulo de geolocalización para seleccionar origen y destino con precisión.

Incluye:
- Sugerencias de direcciones.
- Selección por texto o punto en mapa.
- Geocodificación y reverse geocoding.
- Validación de coordenadas.

## 4.4 Tarifa y Confirmación de Viaje
Descripción breve:
Módulo de pre-viaje para cotización y confirmación.

Incluye:
- Cálculo de tarifa estimada.
- Selección de tipo de vehículo.
- Confirmación de viaje.
- Cancelación previa a inicio.

## 4.5 Operación de Viaje en Tiempo Real
Descripción breve:
Módulo central del negocio para gestionar el ciclo de vida del viaje.

Incluye:
- Publicación de solicitud a conductores cercanos.
- Aceptación/rechazo por conductor.
- Inicio de viaje.
- Seguimiento de ruta con animación de recorrido.
- Finalización automática/manual del viaje.

## 4.6 Mapa y Ruta
Descripción breve:
Visualización operativa de puntos críticos y recorrido.

Incluye:
- Marcador de origen y destino.
- Trazado de ruta.
- Recorrido progresivo (ruta que se consume).
- Reset de estado al finalizar viaje.

## 4.7 Mensajería y Notificaciones
Descripción breve:
Comunicación durante el servicio y eventos del viaje.

Incluye:
- Chat cliente-conductor.
- Eventos por socket (nuevo viaje, aceptado, iniciado, finalizado).
- Alertas visuales en interfaz.

## 4.8 Correos Transaccionales
Descripción breve:
Automatización de comunicaciones clave del sistema.

Incluye:
- Verificación de cuenta.
- Recuperación de contraseña.
- Confirmación de cierre de viaje.

## 4.9 Historial y Métricas Básicas
Descripción breve:
Consulta de actividad por usuario y datos operativos iniciales.

Incluye:
- Historial de viajes.
- Estado del viaje actual.
- Métricas básicas para conductor (viajes/ingresos básicos).

---

## 5. Detalle Funcional por Rol

## 5.1 Flujo Cliente
1. Registro o inicio de sesión.
2. Carga de origen y destino.
3. Visualización de tarifa y selección de vehículo.
4. Confirmación de viaje.
5. Seguimiento de conductor y trayecto.
6. Finalización y notificación de cierre.

## 5.2 Flujo Conductor
1. Registro o inicio de sesión.
2. Cambio de estado disponible.
3. Recepción de solicitud.
4. Aceptación de viaje.
5. Inicio de recorrido.
6. Finalización de viaje y actualización de historial.

---

## 6. Proceso de Desarrollo (Proceso Unificado)

## 6.1 Inicio
Objetivo:
Definir alcance, visión, restricciones y riesgos.

Entregables:
- Documento de visión.
- Alcance funcional acordado.
- Backlog inicial.
- Presupuesto preliminar.

## 6.2 Elaboración
Objetivo:
Cerrar requerimientos y arquitectura base.

Entregables:
- Requerimientos funcionales y no funcionales.
- Diseño de arquitectura y modelo de datos.
- Prototipo de UX clave.
- Plan de iteraciones.

## 6.3 Construcción
Objetivo:
Implementar módulos priorizados por iteraciones.

Entregables:
- Versiones incrementales funcionales.
- Pruebas técnicas y correcciones.
- Integración frontend-backend-mapa-socket.

## 6.4 Transición
Objetivo:
Poner en operación, validar y estabilizar.

Entregables:
- Prueba de aceptación.
- Despliegue.
- Estabilización post salida.

---

## 7. Estructura de Trabajo (WBS) con Horas

| Bloque | Actividades | Horas Base | Horas Media | Horas Alta |
|---|---|---:|---:|---:|
| Gestión de proyecto | Plan, seguimiento, coordinación, cierre | 40 | 55 | 70 |
| Análisis y requerimientos | Relevamiento, casos de uso, especificación | 35 | 50 | 65 |
| UX/UI funcional | Flujos, prototipos, ajustes de experiencia (web + mobile) | 45 | 65 | 85 |
| Backend core | API, seguridad, roles, viajes, reglas de estado | 105 | 155 | 210 |
| Frontend web cliente | Auth, búsqueda, viaje, mapa, notificaciones | 95 | 135 | 185 |
| Frontend web conductor | Auth, aceptación, ejecución y cierre de viaje | 75 | 110 | 150 |
| Aplicación mobile (iOS/Android) | Cliente y conductor, sincronización push, notificaciones | 120 | 180 | 240 |
| Tiempo real | Socket, eventos, sincronización de estado | 35 | 50 | 65 |
| Correos transaccionales | Plantillas, eventos y envío | 20 | 30 | 40 |
| QA y pruebas | Pruebas funcionales, regresión, validación (web + mobile) | 55 | 80 | 110 |
| DevOps y despliegue | Ambientes, build, release, monitoreo inicial, app stores | 35 | 55 | 75 |
| **Totales** |  | **735 h** | **1.065 h** | **1.395 h** |

---

## 8. Presupuesto Estimado

## 8.1 Propuesta Comercial (Presupuesto Global - Escenario Base)

**Inversión Total: ARS $1.200.000** (desarrollo web + mobile, mantenimiento inicial 5 meses GRATIS)

Desglose:
- **Desarrollo e implementación (web + mobile):** ARS $1.200.000
- **Mantenimiento preventivo y cambios leves (5 meses post-lanzamiento):** ARS $0 (GRATIS)
- **Total:** ARS $1.200.000

**Nota:** Este presupuesto corresponde al escenario base (735 horas de desarrollo). Incluye:
- Aplicación web responsive (cliente y conductor)
- Aplicación mobile nativa iOS/Android
- Todas las integraciones y funcionalidades descritas
- **5 meses de mantenimiento preventivo SIN COSTO ADICIONAL**

El período de mantenimiento inicial (GRATIS) cubre:
- Monitoreo activo de infraestructura y rendimiento (web + mobile).
- Corrección de bugs menores y ajustes de performance en ambas plataformas.
- Actualizaciones de dependencias y parches de seguridad.
- Cambios leves solicitados por el cliente (máximo 50 horas/mes).
- Soporte técnico para estabilización post-lanzamiento.
- Mantenimiento de apps en App Store y Google Play.

**Mantenimiento posterior (después de los 5 meses iniciales):**
- Costo: **ARS $100.000 por mes**
- Incluye: Las mismas actividades del período anterior, a razón de máximo 40 horas/mes
- Tarifa implícita: ARS $100.000 / 40h = **ARS $2.500/hora de mantenimiento**

## 8.2 Servicios Externos y Costos Operativos (Sobre el Presupuesto)

El presupuesto anterior **no incluye** los costos de infraestructura y servicios externos necesarios para operar el sistema en producción:

### 8.2.1 Hosting VPS (Recomendado para MVP)
**Plan recomendado:** KVM 2 (Gestionado por IA)
- **Configuración:** 2 núcleos vCPU, 8 GB RAM, 100 GB NVMe, 8 TB ancho de banda
- **Costo inicial (primer año):** ARS $17.099/mes (con 60% descuento)
- **Costo renovación (años 2+):** ARS $30.299/mes
- **Escalabilidad:** Permite servir ~10,000-50,000 usuarios mensuales; fácil upgrade a KVM 4 (ARS $23.299/mes inicial) si es necesario

### 8.2.2 Método de Pago: Mercado Pago (Integrado)

**Plataforma de pagos:** Mercado Pago (pasarela de pagos recomendada para Argentina)

#### Comisiones por transacción:
| Método de pago | Comisión | IVA (21%) | Total por transacción |
|---|---:|---:|---:|
| Transferencia bancaria | 0,99% | 0,20% | **1,19%** |
| Tarjeta de crédito/débito | 2,99% | 0,62% | **3,61%** |
| Billetera virtual (Mercado Pago) | 1,99% | 0,41% | **2,40%** |
| Efectivo | 0% | 0% | **0%** |

#### Ejemplo de cobro por viaje:
- **Viaje cotizado:** ARS $1.000
- **Método: Tarjeta de crédito (3,61% comisión)**
- **Monto recibido:** ARS $963,90
- **Comisión a plataforma:** ARS $36,10

**Nota sobre métodos sin comisión:** Las transferencias bancarias y efectivo no incurren en comisiones de pasarela, siendo opciones más económicas para el cliente.

---

## 8.2.3 Servicios Externos Necesarios (Mensuales)
| Servicio | Costo mensual | Descripción |
|---|---:|---|
| Certificados SSL/TLS (gratuito con Let's Encrypt) | ARS $0 | Renovación automática |
| Base de datos (incluida en VPS) | ARS $0 | PostgreSQL/MySQL instalado en VPS con backups locales diarios |
| **Subtotal servicios mensuales** | **ARS $0** | Todos incluidos en infraestructura |

## 8.3 Costo Operativo Total (Escenario Base)
| Concepto | Costo anual |
|---|---:|
| VPS Hosting primer año | ARS $205.188 (17.099/mes × 12) |
| **Total operativo anual** | **ARS $205.188** |

**Nota:** A partir del segundo año, el VPS pasa a ARS $30.299/mes, elevando el costo anual a ~ARS $363.588 (sin comisiones de pasarela, ya que el cliente elige método de pago).

**Nota importante:** 
- La base de datos está incluida directamente en la VPS (PostgreSQL/MySQL) con backups automáticos configurados en el mismo servidor.
- Las comisiones de pagos varían según método elegido por cliente (0% para transferencia/efectivo, hasta 3,61% para tarjeta). No se incluyen como costo fijo operativo.

## 8.4 Justificación de Mantenimiento Incluido Gratis en los Primeros 5 Meses

La inclusión de **5 meses de mantenimiento preventivo SIN COSTO ADICIONAL** en el presupuesto se justifica por:

1. **Estabilización post-lanzamiento:** Durante los primeros 5 meses tras la salida a producción, la plataforma requiere monitoreo activo, corrección de bugs menores y ajustes de rendimiento. Este período es crítico para identificar y resolver problemas que no se detectan en testing.

2. **Garantía comercial implícita:** Demuestra confianza en el producto entregado y proporciona al cliente tranquilidad en la adopción inicial y primeros meses operativos sin costos adicionales.

3. **Mitigación de riesgos operacionales:** Cubre incidencias inesperadas, optimizaciones de API/base de datos y actualizaciones de dependencias de seguridad que protegen la integridad del sistema durante la fase crítica inicial.

4. **Transición hacia operación independiente:** Permite que el cliente asuma gradualmente la gestión operativa y ajustes menores sin costos de soporte, facilitando la independencia del equipo técnico.

5. **Opción de continuidad remunerada:** Después de los 5 meses iniciales, el cliente puede contratar mantenimiento continuo a **ARS $100.000/mes** para garantizar disponibilidad, soporte técnico ongoing y cambios adicionales.

**Tarifa de mantenimiento posterior:** ARS $100.000/mes (máximo 40 horas/mes) = **ARS $2.500/hora**

## 8.5 Equivalencia en Moneda Extranjera (Referencia)

Equivalencia aproximada (tipo de cambio 1 USD ≈ 920 ARS):

| Escenario | ARS | USD aprox |
|---|---:|---:|
| Presupuesto total (desarrollo web + mobile) | $1.200.000 | ~$1.304 |
| Desarrollo e implementación (web + mobile) | $1.200.000 | ~$1.304 |
| Mantenimiento preventivo inicial (5 meses) | $0 | $0 |
| Mantenimiento posterior/mes (opcional, después mes 5) | $100.000 | ~$109 |
| Costo VPS anual (año 1) | $205.188 | ~$223 |
| **Costo operativo anual (año 1, sin mant. adicional)** | **$205.188** | **~$223** |

---

## 8.6 Tarifa Horaria Implícita

**Desarrollo (web + mobile):**
- **Horas de desarrollo en 4 meses (16 semanas) - Escenario Base:** ~735 horas
- **Tarifa desarrollo:** ARS $1.200.000 / 735h = **ARS $1.633/hora**

**Mantenimiento posterior (opcional):**
- **Costo por mes:** ARS $100.000
- **Horas estimadas/mes:** 40 horas (máximo)
- **Tarifa mantenimiento:** ARS $100.000 / 40h = **ARS $2.500/hora**

**Promedio desarrollo:**
- **Tarifa promedia en desarrollo:** **ARS $1.633/hora**
- **Equivalente en USD:** ~USD $1,78/hora (referencial)

**Nota sobre escenarios:**
- Escenario Base (MVP): 735h desarrollo = ARS $1.200.000 + 5 meses mant. GRATIS
- Escenario Medio: 1.065h desarrollo = ARS $1.540.000 + 5 meses mant. GRATIS (incremento por features adicionales)
- Escenario Alto: 1.395h desarrollo = ARS $1.900.000 + 5 meses mant. GRATIS (todas optimizaciones incluidas)

*La dedicación en desarrollo es 25-35 horas/semana; mantenimiento posterior es flexible (máx. 40h/mes a ARS $2.500/h).*

---

## 9. Cronograma Referencial

| Fase | Duración | Participantes |
|---|---|---|
| Inicio | 1 semana | PM, Arquitecto, Cliente |
| Elaboración | 2 semanas | Equipo técnico completo |
| Construcción | 12 semanas | Desarrolladores, QA, PM |
| Transición | 1 semana | Equipo técnico, Cliente |

**Duración total: 4 meses (16 semanas)**

Dedicación semanal de desarrollo: **25 horas/semana** (distribuidas en 4 meses).
- Semanas de Inicio/Transición: 16 horas/semana (actividades de coordinación y validación).
- Semanas de Elaboración/Construcción: 30-35 horas/semana (desarrollo intensivo).

---

## 10. Entregables al Cliente
- Código fuente frontend y backend.
- Base de datos y estructura de modelos.
- Documentación funcional/técnica mínima.
- Manual breve de operación.
- Ambiente de demo y guía de despliegue.

---

## 11. Supuestos
- Definiciones funcionales aprobadas por iteración.
- Disponibilidad de APIs externas (mapas, correo, OAuth).
- Un responsable de negocio disponible para validaciones.

---

## 12. Exclusiones (No incluidas en este presupuesto)
- Motor de pricing dinámico avanzado con machine learning.
- Facturación fiscal integrada con proveedores externos.
- Contact center y operación 24/7.
- Certificaciones de cumplimiento regulatorio específicas.
- Versión de escritorio o panel administrativo avanzado.

---

## 13. Riesgos y Mitigación

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Cambios de alcance frecuentes | Alto | Control de cambios y priorización por backlog |
| Dependencia de APIs externas | Medio | Fallbacks, caché y monitoreo |
| Variación de tiempos por validación | Medio | Cierres quincenales y aprobación formal |

Enfoque de riesgos orientado a Proceso Unificado (PU):
- Inicio: Riesgo de visión/alcance ambiguo. Mitigación: documento de visión firmado y criterios de aceptación tempranos.
- Elaboración: Riesgo de arquitectura insuficiente. Mitigación: validación técnica temprana (spikes), revisión de modelo de datos y pruebas de integración base.
- Construcción: Riesgo de desvío de cronograma y defectos. Mitigación: iteraciones cortas, QA continuo y control de calidad por hito.
- Transición: Riesgo de incidentes en salida a producción. Mitigación: plan de despliegue, checklist de release y ventana de estabilización.

---

## 14. Propuesta de Implementación por Fases

## Fase A - MVP Operativo
- Registro/login por rol.
- Flujo completo de viaje en tiempo real.
- Mapa, ruta, notificaciones y cierre.

## Fase B - Escalamiento Comercial
- Login social ampliado.
- Métricas operativas y mejoras de retención.
- Optimización de rendimiento y observabilidad.

## Fase C - Optimización de Negocio
- Automatizaciones de operación.
- Dashboard ejecutivo.
- Mejoras avanzadas de experiencia.

---

## 15. Forma de Pago Recomendada (Presupuesto Total ARS $1.200.000)
- 30% al inicio (ARS $360.000) - Planificación, arquitectura, diseño UX/UI (web + mobile) y kick-off.
- 40% durante construcción (ARS $480.000) - Hitos funcionales de web y mobile, entrega de módulos.
- 30% en transición y post-lanzamiento (ARS $360.000) - Entrega final, QA, publicación en app stores, aceptación, capacitación y 5 meses de mantenimiento preventivo GRATIS.

**Mantenimiento posterior (opcional):** ARS $100.000/mes a partir del mes 6 (después del período inicial gratuito).

**Nota:** Los costos de infraestructura (VPS por ARS $205.188/año) se facturan aparte de forma mensual/anual según proveedores contratados.

---

## 16. Cierre Ejecutivo
Esta propuesta permite cotizar de forma clara una plataforma de movilidad urbana completa, con trazabilidad entre funcionalidades, horas, fases de trabajo y costo. El monto final se ajusta según prioridad de alcance, tarifa acordada y complejidad de integración externa.