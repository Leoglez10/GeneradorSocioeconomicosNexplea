# Tutorial - Generador de Estudios Socioeconómicos (ESE)

## ¿Para qué sirve esta app?

Esta aplicación genera **Estudios Socioeconómicos en formato PDF** de manera profesional. Solo llenas un formulario paso a paso y al final obtienes un documento listo para entregar con toda la información del candidato: datos personales, historial académico, situación económica, vivienda, referencias, historial laboral, etc.

---

## ¿Cómo se usa?

### Navegación por pasos

La app está dividida en **10 pasos** (páginas). En la parte superior verás una **barra de progreso** que te indica en qué paso vas.

- **Botón "Siguiente"** (esquina inferior derecha) → avanza al siguiente paso.
- **Botón "Anterior"** (esquina inferior izquierda) → regresa al paso anterior.
- Puedes ir y venir entre pasos sin perder lo que ya llenaste.

### Los 10 pasos son:

| Paso | Sección | ¿Qué se llena? |
|------|---------|-----------------|
| 1 | Datos Generales | Nombre, fecha, domicilio, edad, sexo, estado civil, teléfonos |
| 2 | Documentos | Checklist de documentos presentados (INE, CURP, actas, etc.) con folios |
| 3 | Historial Académico | Escuelas, periodos, certificados, promedios por nivel educativo |
| 4 | Salud y Hábitos Sociales | Deportes, sindicato, partido político, religión, alcohol, tabaco, cirugías |
| 5 | Grupo Familiar | Familiares del candidato con parentesco, edad, estado civil, celular |
| 6 | Situación Laboral Familiar | Dónde trabajan los familiares + Ingresos y Egresos económicos |
| 7 | Bienes y Vivienda | Bienes muebles/inmuebles + detalles de la vivienda (distribución, zona, mobiliario) |
| 8 | Referencias | Referencias personales y vecinales |
| 9 | Historial Laboral | Empleos anteriores con validación, gráfica de desempeño y comentarios |
| 10 | Conclusión y Fotos | Dictamen final, conclusiones, fotografías del candidato/vivienda y documentos extra |

---

## Campos dinámicos (agregar y quitar filas)

En varias secciones verás botones como **"+ Agregar Familiar"**, **"+ Ingreso"**, **"+ Empleo"**, etc.

- Haz clic en el botón verde/azul de **"+"** para agregar una nueva fila.
- Cada fila tiene un **ícono de bote de basura rojo** (🗑️) para eliminarla.
- Puedes agregar tantas filas como necesites.

Esto aplica en: Familiares, Laborales Familiares, Ingresos, Egresos, Bienes, Referencias Personales, Referencias Vecinales y Empleos.

---

## Sección de Situación Económica (Paso 6)

En **Ingresos Mensuales**, cada fila tiene 3 campos:
- **Nombre** → Quién aporta el ingreso.
- **Sueldo** → Puede ser número o texto (ej: "15,000", "Variable", "N/A").
- **Aportación** → Igual, texto libre.

Los campos de Sueldo y Aportación aceptan texto, no solo números, por si necesitas escribir algo como "Quincenal $8,000" o "No aplica".

---

## Distribución de la Vivienda (Paso 7)

En la sección **"Distribución"** verás una cuadrícula con los siguientes espacios ya predefinidos:

| Espacio | Descripción |
|---------|-------------|
| Recámaras | Cuántas recámaras tiene la vivienda |
| Baños | Cuántos baños |
| Cocina | Cuántas cocinas |
| Comedor | Cuántos comedores |
| Sala | Cuántas salas |
| Patio de Servicio | Cuántos patios de servicio |
| Cuarto de Servicio | Cuántos cuartos de servicio |
| Jardín | Cuántos jardines |
| Garaje | Cuántos garajes |

Todos inician en **0**. Solo edita el número de cada espacio según lo que observes en la vivienda.

---

## Fotografías y Documentos Extra (Paso 10)

En el último paso puedes:

1. **Subir 3 fotos obligatorias:**
   - Foto del **candidato**
   - Foto de la **fachada** de la vivienda
   - Foto del **interior** de la vivienda

2. **Agregar fotos extra** con pie de foto (botón "Agregar Foto Extra").

3. **Agregar documentos PDF extra** (botón "Agregar Documento Extra") — por ejemplo, comprobantes escaneados.

4. **Marca de agua:** hay una casilla para activar/desactivar la marca de agua en los documentos extra.

---

## Botón flotante verde: Guardar y Cargar Progreso

En la **esquina inferior derecha** de la pantalla verás un **botón verde redondo** con un ícono de disco (💾). Está visible **en todos los pasos**, no necesitas ir al final para usarlo.

### Al hacer clic en el botón aparecen dos opciones:

#### 1. Guardar Progreso
- Descarga un archivo llamado algo como: `ESE_Progreso_Juan_Perez.json`
- Este archivo contiene **TODO** lo que llevas llenado hasta ese momento.
- Guárdalo en tu computadora o celular.

#### 2. Cargar Progreso
- Te pide seleccionar un archivo `.json` que guardaste antes.
- Al seleccionarlo, el formulario se llena automáticamente con todos los datos que tenía cuando se guardó.
- Te regresa al **Paso 1** para que revises desde el inicio.

### ¿Qué es el archivo JSON?

Es un archivo de texto con extensión `.json` que contiene todos los datos del formulario en un formato que la computadora puede leer. **No lo edites manualmente** a menos que sepas lo que haces. Solo úsalo para:

- **Guardar tu avance** si no puedes terminar en una sola sesión.
- **Pasarle el avance a otra persona** para que lo continúe (por WhatsApp, email, USB, etc.).
- **Tener un respaldo** antes de generar el PDF.

### Ejemplo de uso entre dos personas:

1. **Persona A** abre la app, llena los pasos 1 al 5.
2. **Persona A** hace clic en el botón verde → **"Guardar Progreso"** → se descarga el archivo JSON.
3. **Persona A** envía el archivo por **WhatsApp/email** a Persona B.
4. **Persona B** abre la app → clic en el botón verde → **"Cargar Progreso"** → selecciona el archivo.
5. El formulario se llena con todo lo que Persona A ya tenía → **Persona B** continúa desde el paso 6.
6. Al terminar, **Persona B** hace clic en **"Generar PDF Oficial"**.

---

## Generar el PDF (Paso 10)

Cuando ya tengas todo listo:

1. Ve al **Paso 10**.
2. Haz clic en el botón azul **"Generar PDF Oficial"**.
3. Espera unos segundos mientras se genera.
4. Se descargará automáticamente un archivo PDF con nombre: `Estudio_Socioeconomico_Nombre_Del_Candidato.pdf`

Este PDF es el documento final con formato profesional, listo para entregar.

---

## Botón "Nuevo Formato"

En el **Paso 10**, al lado del botón de generar PDF, verás el botón **"Nuevo Formato"**:

- Borra **TODOS** los datos del formulario.
- Te regresa al **Paso 1** en blanco.
- Te pide confirmación antes de borrar ("¿Estás seguro de borrar todos los datos?").
- **Tip:** Si quieres conservar lo que llevas, primero usa **"Guardar Progreso"** antes de hacer clic en "Nuevo Formato".

---

## Resumen rápido de botones

| Botón | Dónde está | ¿Qué hace? |
|-------|-----------|-------------|
| ← Anterior | Abajo izquierda (todos los pasos) | Regresa al paso anterior |
| Siguiente → | Abajo derecha (pasos 1-9) | Avanza al siguiente paso |
| 💾 Botón verde flotante | Esquina inferior derecha (siempre visible) | Abre menú de Guardar/Cargar progreso |
| Guardar Progreso | Dentro del menú flotante | Descarga archivo JSON con tu avance |
| Cargar Progreso | Dentro del menú flotante | Sube un archivo JSON para continuar |
| Nuevo Formato | Paso 10 | Borra todo y empieza de cero |
| Generar PDF Oficial | Paso 10 | Genera y descarga el PDF final |
| + (verde/azul) | En secciones dinámicas | Agrega una nueva fila |
| 🗑️ (rojo) | En cada fila dinámica | Elimina esa fila |

---

## Preguntas frecuentes

**¿Se guardan mis datos automáticamente?**
No. Si cierras o recargas la página, pierdes todo. Usa el botón de **"Guardar Progreso"** para guardar tu avance como archivo.

**¿Necesito internet para usar la app?**
Sí, necesitas conexión para que la app cargue y para generar el PDF (se procesa en el servidor).

**¿Puedo editar el PDF después de generarlo?**
No, el PDF es un documento final. Si necesitas hacer cambios, edita los datos en la app y genera un nuevo PDF.

**¿Puedo abrir el archivo JSON en otra computadora?**
Sí. El archivo JSON funciona en cualquier computadora o celular que tenga la app abierta. Solo usa "Cargar Progreso" y selecciona el archivo.

**¿Los datos son privados?**
Los datos solo existen en tu navegador y en el archivo JSON que guardes. El servidor solo los usa momentáneamente para generar el PDF y no los almacena.
