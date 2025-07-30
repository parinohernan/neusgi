import puppeteer from 'puppeteer';
import { PresupuestoWithRelations, Empresa } from '@/types';

export class PdfService {
  private static async generateHtml(presupuesto: PresupuestoWithRelations, empresa?: Empresa): Promise<string> {
    const costoFormateado = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(presupuesto.costo);

    // Obtener imagen destacada del equipo
    let imagenEquipo = '';
    let descripcionImagen = '';
    
    if (presupuesto.equipos && presupuesto.equipos.length > 0) {
      const primerEquipo = presupuesto.equipos[0];
      if (primerEquipo?.imagenes && primerEquipo.imagenes.length > 0) {
        const imagenDestacada = primerEquipo.imagenes.find((img: any) => img.destacada);
        const primeraImagen = primerEquipo.imagenes[0];
        
        if (imagenDestacada) {
          imagenEquipo = imagenDestacada.url;
          descripcionImagen = imagenDestacada.descripcion;
        } else if (primeraImagen) {
          imagenEquipo = primeraImagen.url;
          descripcionImagen = primeraImagen.descripcion;
        }
      }
    }

    // Datos de la empresa (usar datos por defecto si no se proporcionan)
    const empresaData = empresa || {
      nombre: 'NeusGroup',
      cuit: '20000000002',
      ciudad: 'Rincon de los Sauces',
      direccion: 'San Martin 213',
      telefono: '+54 299 123-4567',
      email: 'info@neusgroup.com',
      web: 'www.neusgroup.com',
      logo: null
    };

    // Formatear fecha
    const fecha = new Date().toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // Generar número de presupuesto con formato 000-000XXX
    const numeroPresupuesto = presupuesto.id.toString().padStart(6, '0');
    const numeroFormateado = `${numeroPresupuesto.slice(0, 3)}-${numeroPresupuesto.slice(3)}`;

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Presupuesto #${presupuesto.id}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.4;
            color: #333;
            background: white;
            font-size: 12px;
            padding: 20px;
          }
          
          .header-table {
            width: 100%;
            border: 0.75pt solid #000000;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          
          .header-table td {
            border: 0.75pt solid #000000;
            padding: 5px;
            vertical-align: middle;
          }
          
          .logo-cell {
            width: 120px;
            background-color: #d6dce4;
            text-align: center;
          }
          
          .logo {
            max-width: 100px;
            max-height: 50px;
          }
          
          .title-cell {
            width: 190px;
            text-align: center;
          }
          
          .title {
            font-size: 14pt;
            font-weight: bold;
          }
          
          .form-cell {
            width: 70px;
            text-align: center;
            font-size: 10pt;
          }
          
          .revision-cell {
            width: 52px;
            text-align: center;
            font-size: 10pt;
          }
          
          .date-section {
            text-align: right;
            margin: 10px 0;
            font-size: 12pt;
          }
          
          .client-section {
            margin: 15px 0;
          }
          
          .client-name {
            font-weight: bold;
            font-size: 12pt;
            margin-bottom: 5px;
          }
          
          .client-details {
            font-size: 12pt;
            margin-bottom: 5px;
          }
          
          .budget-number {
            text-align: center;
            font-size: 16pt;
            font-weight: bold;
            margin: 20px 0;
            background-color: #00ffff;
            padding: 10px;
          }
          
          .service-description {
            margin: 20px 0;
            line-height: 1.6;
            font-size: 12pt;
          }
          
          .service-list {
            margin-left: 36px;
          }
          
          .service-list li {
            margin-bottom: 10px;
          }
          
          .equipment-section {
            text-align: center;
            margin: 20px 0;
          }
          
          .equipment-title {
            text-decoration: underline;
            font-size: 12pt;
            margin-bottom: 10px;
          }
          
          .equipment-image {
            max-width: 300px;
            max-height: 200px;
            border: 1px solid #ddd;
            margin: 10px 0;
          }
          
          .pricing-table {
            width: 100%;
            border: 0.75pt solid #000000;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 11pt;
          }
          
          .pricing-table td {
            border: 0.75pt solid #000000;
            padding: 5px;
            vertical-align: middle;
          }
          
          .pricing-table th {
            border: 0.75pt solid #000000;
            padding: 5px;
            vertical-align: middle;
            font-weight: bold;
            background-color: #f0f0f0;
          }
          
          .conditions {
            margin: 20px 0;
            font-size: 12pt;
            line-height: 1.6;
          }
          
          .conditions strong {
            font-weight: bold;
          }
          
          .footer {
            margin-top: 30px;
            text-align: center;
          }
          
          .signature {
            margin: 20px 0;
            text-align: center;
            font-size: 12pt;
          }
          
          .company-footer {
            text-align: center;
            font-size: 12pt;
            line-height: 1.4;
            margin-top: 20px;
          }
          
          .divider {
            text-align: center;
            font-size: 15pt;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <table class="header-table">
          <tr style="height: 22pt;">
            <td rowspan="2" class="logo-cell">
              ${empresaData.logo ? `<img src="${empresaData.logo}" alt="Logo" class="logo">` : '<p>LOGO</p>'}
            </td>
            <td rowspan="2" class="title-cell">
              <div class="title">PRESUPUESTO</div>
            </td>
            <td rowspan="2" class="form-cell">
              PG-20<br>FORM.03
            </td>
            <td class="revision-cell">
              Revisión: 01
            </td>
          </tr>
          <tr style="height: 22pt;">
            <td class="revision-cell">
              Hoja 1 de 1
            </td>
          </tr>
        </table>
        
        <div class="date-section">
          ${empresaData.ciudad}, ${fecha}
        </div>
        
        <div class="client-section">
          <div class="client-name">${empresaData.nombre}</div>
          <div class="client-details"><strong>CUIT:</strong> ${empresaData.cuit}</div>
          <div class="client-details"><strong>Sres.:</strong> ${presupuesto.cliente?.nombreEmpresa || 'Cliente'}</div>
          <div class="client-details"><strong>Sector:</strong> Compras y Contrataciones</div>
        </div>
        
        <div class="budget-number">
          PRESUPUESTO Nº ${numeroFormateado}
        </div>
        
        <div class="service-description">
          <p>Por medio de la presente cotizamos los siguientes servicios de acuerdo con lo solicitado:</p>
          <ol class="service-list">
            <li>Alquiler de equipo ${presupuesto.equipos?.[0]?.modelo || 'N/A'} - ${presupuesto.equipos?.[0]?.patente || 'N/A'}
              <ul>
                <li>El equipo dispone de aire acondicionado, calefacción central y butacas reclinables.</li>
                <li>Elementos de seguridad y todo los reglamentario correspondiente a ley de transporte.</li>
              </ul>
            </li>
            <li>Jornada laboral: lunes a viernes, Horario laboral logístico: de 07:00 a 18:00 hs</li>
          </ol>
        </div>
        
        <div class="equipment-section">
          <div class="equipment-title">EQUIPOS DISPONIBLES PARA INICIAR SERVICIO INMEDIATAMENTE</div>
          ${imagenEquipo ? `
            <img src="${imagenEquipo}" alt="Equipo" class="equipment-image">
            ${descripcionImagen ? `<p>${descripcionImagen}</p>` : ''}
          ` : '<p>(COLOCAR IMÁGENES)</p>'}
        </div>
        
        <table class="pricing-table">
          <tr style="height: 15pt;">
            <td colspan="2" style="width: 240px;">
              <strong>PROYECTO:</strong> ${presupuesto.cliente?.nombreEmpresa || 'SERVIPET SA'}
            </td>
            <td colspan="2" style="width: 83px; text-align: center;">
              <strong>OFERENTE</strong>
            </td>
            <td colspan="2" style="width: 216px;">
              <strong>${empresaData.nombre}</strong>
            </td>
          </tr>
          <tr style="height: 15pt;">
            <td colspan="2">
              <strong>SERVICIO - ALQUILER EQUIPO</strong>
            </td>
            <td colspan="2">
              <strong>Provincia</strong>
            </td>
            <td colspan="2">
              ${empresaData.ciudad} - Neuquén
            </td>
          </tr>
          <tr style="height: 15pt;">
            <td colspan="2"></td>
            <td colspan="2">
              <strong>Moneda</strong>
            </td>
            <td colspan="2">
              PESOS ARG
            </td>
          </tr>
          <tr style="height: 26pt;">
            <td style="width: 25px;"><strong>#</strong></td>
            <td style="width: 202px;"><strong>Descripción</strong></td>
            <td style="width: 47px;"><strong>Cantidad</strong></td>
            <td style="width: 25px;"><strong>UNI</strong></td>
            <td style="width: 96px;"><strong>Precio Unitario / día</strong></td>
            <td style="width: 110px;"><strong>Precio Total mensual</strong></td>
          </tr>
          <tr style="height: 24pt;">
            <td><strong>1</strong></td>
            <td>ALQUILER MENSUAL EQUIPO y gas oil (${empresaData.ciudad} - Puesto Hez)</td>
            <td><strong>Mensual</strong></td>
            <td><strong>1</strong></td>
            <td><strong>$${costoFormateado.replace('$', '').replace(',', '.')}</strong></td>
            <td><strong>$${costoFormateado.replace('$', '').replace(',', '.')} + iva</strong></td>
          </tr>
          <tr style="height: 19pt;">
            <td><strong>2</strong></td>
            <td>KM. PROYECTADO 60 km promedio, lunes a viernes</td>
            <td></td>
            <td></td>
            <td><strong>$</strong></td>
            <td><strong>$ -</strong></td>
          </tr>
          <tr style="height: 13pt;">
            <td><strong>3</strong></td>
            <td>Costo por excedente de kilometraje</td>
            <td><strong>KM</strong></td>
            <td></td>
            <td><strong>$ 821,04</strong></td>
            <td><strong>$</strong></td>
          </tr>
        </table>
        
        <div class="conditions">
          <p><strong>PLAZO DE ENTREGA:</strong> Inmediato</p>
          <p><strong><em>LUGAR DE ENTREGA:</em></strong> ${empresaData.ciudad}</p>
          <p><strong><em>FORMA DE PAGO:</em></strong> 30 días FF</p>
          <p><strong><em>Validez de la oferta:</em></strong> 3 días.</p>
          <p>Estamos a vuestra disposición para las aclaraciones técnicas o económicas que considere necesarias</p>
        </div>
        
        <div class="signature">
          <p>Saludamos a Ud. muy cordialmente.</p>
          <p><strong>Robledo Ariel</strong></p>
          <p><strong>Cel. 299-</strong></p>
          <p><strong>${empresaData.nombre}</strong></p>
          <p><strong>Cahuin</strong></p>
          <p><strong>Parque Industrial 3</strong></p>
          <p><strong>${empresaData.ciudad}</strong></p>
        </div>
        
        <div class="divider">
          _____________________________________________
        </div>
        
        <div class="company-footer">
          <p><strong style="color: #4472c4;">${empresaData.nombre}</strong></p>
          <p>CAHUIN LOTE 12 MZA 05 PIN 3 – ${empresaData.ciudad.toUpperCase()} – NEUQUEN (CP.: 8319)</p>
          <p>Cel.: (0299) 4694510 Robledo Ariel / (0299) 6087354 Osses Rut</p>
          <p>e-mail: ${empresaData.email || 'neugroup.srl@hotmail.com'}</p>
        </div>
      </body>
      </html>
    `;
  }

  static async generatePresupuestoPdf(presupuesto: PresupuestoWithRelations, empresa?: Empresa): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      const html = await this.generateHtml(presupuesto, empresa);
      
      await page.setContent(html, {
        waitUntil: 'networkidle0'
      });

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        }
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }
} 