# PUMA Dragon Edition - Landing Page

## Descripción
Landing page de alta conversión para la venta de la edición limitada de zapatillas **PUMA Dragon Edition**. Diseñada bajo un enfoque *mobile-first*, con una estética premium "Akatsuki Dark" y animaciones fluidas para maximizar el enganche del usuario.

## Características (Features)
- **Diseño Premium**: Estética moderna y elegante, con partículas flotantes y efectos de iluminación CSS (*glow effects*).
- **Responsive Design**: Completamente adaptable a dispositivos móviles, tablets y escritorios utilizando CSS Grid y Flexbox.
- **Captura de Leads (Formulario)**: Modal optimizado para capturar el nombre, talla, método de entrega y número de WhatsApp del cliente.
- **Integración con WhatsApp**: Redirección automática a WhatsApp con un mensaje pre-formateado con los datos del pedido.
- **Meta Pixel Integrado**: Seguimiento de eventos clave (`PageView`, `ViewContent`, `InitiateCheckout`, `Lead`) para campañas de retargeting en Facebook e Instagram Ads.
- **Clean Code**: JavaScript modularizado usando clases (ES6+), estructura HTML5 semántica y CSS escalable con variables.

## Estructura del Proyecto
- `index.html`: Estructura principal y contenido semántico.
- `style.css`: Estilos, variables, animaciones keyframes y media queries.
- `script.js`: Lógica de la aplicación orientada a objetos (ES6 Classes), manejo de eventos, validación y redirección.
- Imágenes: Recursos gráficos como `images/shoes.png`, `images/background.jpeg`, etc.

## Tecnologías Utilizadas
- **HTML5** Semántico y Accesibilidad (ARIA).
- **CSS3** (Variables, Grid, Flexbox, Keyframes, Backdrop-filter).
- **Vanilla JavaScript** (ES6+, Classes, DOM Manipulation).

## Instalación y Configuración

1. **Clonar o descargar** el repositorio.
2. **Configurar Meta Pixel**:
   - Abrir `index.html`.
   - Buscar y reemplazar `YOUR_PIXEL_ID` con el ID real de tu Meta Pixel.
3. **Configurar WhatsApp**:
   - Abrir `script.js`.
   - Modificar la propiedad `waNumber` dentro de la clase `PumaLandingApp` (ej. `584121234567`) sin el signo `+`.
4. **Despliegue**: Subir los archivos a cualquier servidor web estático (GitHub Pages, Netlify, Vercel, Hostinger, etc.).

## Buenas Prácticas Implementadas (Clean Code)
- **Encapsulación**: Toda la lógica de JavaScript está agrupada en la clase `PumaLandingApp` aislando el scope global.
- **DRY (Don't Repeat Yourself)**: Reutilización de métodos para limpiar/mostrar errores de formulario y rastreo de eventos Pixel.
- **Nombres Descriptivos**: Variables y funciones con nombres claros en inglés y español contextualizado.
- **Responsabilidad Única**: Cada método dentro de la clase JavaScript tiene un propósito y responsabilidad específicos.
- **CSS Mantenible**: Uso intensivo de CSS Custom Properties (`:root`) para colores, animaciones y tipografías.
