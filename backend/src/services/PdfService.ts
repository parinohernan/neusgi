import puppeteer from 'puppeteer';
import { PresupuestoWithRelations } from '@/types';

export class PdfService {
  private static async generateHtml(presupuesto: PresupuestoWithRelations): Promise<string> {
    const fecha = new Date().toLocaleDateString('es-AR');
    const fechaValidez = new Date(presupuesto.validoHasta).toLocaleDateString('es-AR');
    const costoFormateado = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(presupuesto.costo);

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
            line-height: 1.6;
            color: #333;
            background: white;
          }
          
          .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          
          .header {
            text-align: center;
            border-bottom: 3px solid #2c3e50;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          
          .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
          }
          
          .document-title {
            font-size: 24px;
            color: #34495e;
            margin-bottom: 10px;
          }
          
          .presupuesto-number {
            font-size: 18px;
            color: #7f8c8d;
          }
          
          .info-section {
            margin-bottom: 30px;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }
          
          .info-item {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #3498db;
          }
          
          .info-label {
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
          }
          
          .info-value {
            color: #34495e;
          }
          
          .description-section {
            background: #ecf0f1;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          
          .description-title {
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
          }
          
          .description-text {
            color: #34495e;
            line-height: 1.8;
          }
          
          .equipo-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .equipo-info {
            background: #e8f4fd;
            padding: 20px;
            border-radius: 8px;
            border: 2px solid #3498db;
          }
          
          .equipo-image {
            text-align: center;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border: 2px dashed #bdc3c7;
          }
          
          .equipo-image img {
            max-width: 100%;
            max-height: 200px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }
          
          .no-image {
            color: #7f8c8d;
            font-style: italic;
          }
          
          .cost-section {
            background: #2c3e50;
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 30px;
          }
          
          .cost-label {
            font-size: 18px;
            margin-bottom: 10px;
          }
          
          .cost-value {
            font-size: 32px;
            font-weight: bold;
            color: #f39c12;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #ecf0f1;
            text-align: center;
            color: #7f8c8d;
            font-size: 14px;
          }
          
          .validity {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          
          .validity-title {
            font-weight: bold;
            color: #856404;
            margin-bottom: 5px;
          }
          
          .status-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 14px;
            text-transform: uppercase;
          }
          
          .status-pendiente {
            background: #fff3cd;
            color: #856404;
            border: 1px solid #ffeaa7;
          }
          
          .status-aceptado {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
          }
          
          .status-rechazado {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="company-name">NEUSGI</div>
            <div class="document-title">PRESUPUESTO</div>
            <div class="presupuesto-number">#${presupuesto.id}</div>
          </div>
          
          <div class="info-section">
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Cliente</div>
                <div class="info-value">${presupuesto.cliente?.nombreEmpresa || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">RUT/CUIT</div>
                <div class="info-value">${presupuesto.cliente?.rutCuit || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Email</div>
                <div class="info-value">${presupuesto.cliente?.email || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Fecha de Emisión</div>
                <div class="info-value">${fecha}</div>
              </div>
            </div>
          </div>
          
          <div class="description-section">
            <div class="description-title">Descripción del Servicio</div>
            <div class="description-text">${presupuesto.descripcion}</div>
          </div>
          
          <div class="equipo-section">
            <div class="equipo-info">
              <div class="info-label">Equipo Asignado</div>
              <div class="info-value">
                <strong>Patente:</strong> ${presupuesto.equipo?.patente || 'N/A'}<br>
                <strong>Modelo:</strong> ${presupuesto.equipo?.modelo || 'N/A'}<br>
                <strong>Capacidad:</strong> ${presupuesto.equipo?.capacidadKg || 'N/A'} kg<br>
                <strong>Estado:</strong> ${presupuesto.equipo?.estado || 'N/A'}
              </div>
            </div>
            <div class="equipo-image">
              <div class="info-label">Imagen del Equipo</div>
              <div class="no-image">Sin imagen disponible</div>
            </div>
          </div>
          
          <div class="validity">
            <div class="validity-title">Válido hasta</div>
            <div class="info-value">${fechaValidez}</div>
          </div>
          
          <div class="cost-section">
            <div class="cost-label">Costo Total del Servicio</div>
            <div class="cost-value">${costoFormateado}</div>
          </div>
          
          <div style="text-align: center; margin-bottom: 20px;">
            <span class="status-badge status-${presupuesto.estado}">
              ${presupuesto.estado}
            </span>
          </div>
          
          <div class="footer">
            <p>Este presupuesto es válido hasta la fecha indicada.</p>
            <p>Para consultas, contacte a NEUSGI</p>
            <p>Generado el ${fecha}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static async generatePresupuestoPdf(presupuesto: PresupuestoWithRelations): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      const html = await this.generateHtml(presupuesto);
      
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