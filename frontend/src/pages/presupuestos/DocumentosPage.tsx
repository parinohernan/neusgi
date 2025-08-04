import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar,
  Image as ImageIcon
} from 'lucide-react';
import { Sidebar } from '../../components/layout';
import { presupuestoService } from '../../services/presupuestoService';
import { parteDiarioService } from '../../services/parteDiarioService';
import { remitoService } from '../../services/remitoService';
import { useNotifications } from '../../hooks/useNotifications';
import type { Presupuesto, ParteDiario, Remito, Equipo } from '../../types';

interface JornadaItem {
  fecha: Date;
  remito: string;
  interno: string;
  operadora: string;
  batea?: number;
  volcador?: number;
  regador?: number;
  imagenUrl?: string;
  tipo: 'parte-diario' | 'remito';
  documento: ParteDiario | Remito;
}

interface ResumenEquipos {
  batea: number;
  volcador: number;
  regador: number;
}

export const DocumentosPage: React.FC = () => {
  const { presupuestoId } = useParams<{ presupuestoId: string }>();
  const navigate = useNavigate();
  const { error } = useNotifications();
  
  const [presupuesto, setPresupuesto] = useState<Presupuesto | null>(null);
  const [partesDiario, setPartesDiario] = useState<ParteDiario[]>([]);
  const [remitos, setRemitos] = useState<Remito[]>([]);
  const [jornadas, setJornadas] = useState<JornadaItem[]>([]);
  const [resumenEquipos, setResumenEquipos] = useState<ResumenEquipos>({ batea: 0, volcador: 0, regador: 0 });
  const [loading, setLoading] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');

  useEffect(() => {
    if (presupuestoId) {
      cargarDatos();
    }
  }, [presupuestoId]);

  const cargarDatos = async () => {
    if (!presupuestoId) return;
    
    setLoading(true);
    try {
      const presupuestoData = await presupuestoService.getById(parseInt(presupuestoId));
      setPresupuesto(presupuestoData);

      // Solo cargar documentos si hay orden de compra
      if (presupuestoData.ordenCompra?.id) {
        const [partesDiarioData, remitosData] = await Promise.all([
          parteDiarioService.findByOrdenCompra(presupuestoData.ordenCompra.id),
          remitoService.findByOrdenCompra(presupuestoData.ordenCompra.id),
        ]);

        setPartesDiario(partesDiarioData);
        setRemitos(remitosData);

        // Procesar jornadas
        procesarJornadas(partesDiarioData, remitosData, presupuestoData);
      }
    } catch (err) {
      error('Error al cargar los documentos');
    } finally {
      setLoading(false);
    }
  };

  const procesarJornadas = (partes: ParteDiario[], remitos: Remito[], presupuesto: Presupuesto) => {
    const jornadasItems: JornadaItem[] = [];
    const resumen: ResumenEquipos = { batea: 0, volcador: 0, regador: 0 };

    // Procesar partes diario
    partes.forEach(parte => {
      const equipo = parte.equipo;
      if (equipo) {
        const tipoEquipo = determinarTipoEquipo(equipo);
        const cantidad = 1; // Por defecto 1 jornada

        // Usar el código si existe, sino usar el ID
        const codigoRemito = parte.codigo || `P${parte.id.toString().padStart(4, '0')}`;

        const jornada: JornadaItem = {
          fecha: parte.fecha,
          remito: codigoRemito,
          interno: equipo.patente,
          operadora: presupuesto.cliente?.nombreEmpresa || '',
          imagenUrl: parte.archivosAdjuntos?.[0],
          tipo: 'parte-diario',
          documento: parte,
          [tipoEquipo]: cantidad
        };

        jornadasItems.push(jornada);
        
        // Actualizar resumen
        if (tipoEquipo === 'batea') resumen.batea += cantidad;
        else if (tipoEquipo === 'volcador') resumen.volcador += cantidad;
        else if (tipoEquipo === 'regador') resumen.regador += cantidad;
      }
    });

    // Procesar remitos
    remitos.forEach(remito => {
      const equipo = remito.equipo;
      if (equipo) {
        const tipoEquipo = determinarTipoEquipo(equipo);
        const cantidad = 1; // Por defecto 1 jornada

        // Usar el código del remito con prefijo R
        const codigoRemito = `R${remito.codigo}`;

        const jornada: JornadaItem = {
          fecha: remito.creadoEn,
          remito: codigoRemito,
          interno: equipo.patente,
          operadora: presupuesto.cliente?.nombreEmpresa || '',
          imagenUrl: remito.archivosAdjuntos?.[0],
          tipo: 'remito',
          documento: remito,
          [tipoEquipo]: cantidad
        };

        jornadasItems.push(jornada);
        
        // Actualizar resumen
        if (tipoEquipo === 'batea') resumen.batea += cantidad;
        else if (tipoEquipo === 'volcador') resumen.volcador += cantidad;
        else if (tipoEquipo === 'regador') resumen.regador += cantidad;
      }
    });

    // Ordenar por fecha
    jornadasItems.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    setJornadas(jornadasItems);
    setResumenEquipos(resumen);
  };

  const determinarTipoEquipo = (equipo: Equipo): 'batea' | 'volcador' | 'regador' => {
    const modelo = equipo.modelo.toLowerCase();
    const categoria = equipo.categoria?.nombre.toLowerCase() || '';

    if (modelo.includes('batea') || categoria.includes('batea')) return 'batea';
    if (modelo.includes('volcador') || categoria.includes('volcador')) return 'volcador';
    if (modelo.includes('regador') || categoria.includes('regador')) return 'regador';
    
    // Por defecto, asignar según capacidad
    if (equipo.capacidadKg >= 25000) return 'batea';
    if (equipo.capacidadKg >= 15000) return 'volcador';
    return 'regador';
  };

  const formatearFecha = (fecha: Date) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
  };

  const formatearFechaCompleta = (fecha: Date) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const obtenerServicios = () => {
    if (!presupuesto?.equipos) return [];
    
    const servicios: { tipo: string; cantidad: number }[] = [];
    const equiposPorTipo: { [key: string]: number } = {};

    presupuesto.equipos.forEach(equipo => {
      const tipo = determinarTipoEquipo(equipo);
      equiposPorTipo[tipo] = (equiposPorTipo[tipo] || 0) + 1;
    });

    Object.entries(equiposPorTipo).forEach(([tipo, cantidad]) => {
      servicios.push({
        tipo: tipo.charAt(0).toUpperCase() + tipo.slice(1),
        cantidad
      });
    });

    return servicios;
  };

  const obtenerPeriodo = () => {
    if (!presupuesto?.ordenCompra) return null;
    
    const fechaInicio = presupuesto.ordenCompra.fechaInicio;
    const fechaFin = presupuesto.ordenCompra.fechaFin;
    
    return {
      desde: formatearFechaCompleta(fechaInicio),
      hasta: formatearFechaCompleta(fechaFin)
    };
  };

  const mostrarImagen = (url: string) => {
    setSelectedImage(url);
    setShowImageModal(true);
  };

  if (loading) {
    return (
      <div className="main-container">
        <Sidebar />
        <div className="content-area">
          <div className="has-text-centered">
            <div className="loading-spinner"></div>
            <p className="mt-3">Cargando documentos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!presupuesto) {
    return (
      <div className="main-container">
        <Sidebar />
        <div className="content-area">
          <div className="has-text-centered">
            <p className="has-text-danger">Presupuesto no encontrado</p>
          </div>
        </div>
      </div>
    );
  }

  const servicios = obtenerServicios();
  const periodo = obtenerPeriodo();

  return (
    <div className="main-container">
      <Sidebar />
      <div className="content-area">
        <div className="container">
          {/* Header */}
          <div className="page-header">
            <div className="level">
              <div className="level-left">
                <div className="level-item">
                  <button
                    onClick={() => navigate(`/presupuestos/${presupuestoId}`)}
                    className="button is-small is-outlined"
                  >
                    <span className="icon is-small">
                      <ArrowLeft size={16} />
                    </span>
                    <span>Volver</span>
                  </button>
                </div>
                <div className="level-item">
                  <h1 className="page-title">Documentos del Presupuesto</h1>
                </div>
              </div>
            </div>
          </div>

          {/* Información del Presupuesto */}
          <div className="card mb-5">
            <div className="card-content">
              <div className="columns">
                <div className="column is-6">
                  <h3 className="title is-5">Cliente</h3>
                  <p className="subtitle is-6">{presupuesto.cliente?.nombreEmpresa}</p>
                </div>
                <div className="column is-6">
                  <h3 className="title is-5">Servicios</h3>
                  <div className="tags">
                    {servicios.map((servicio, index) => (
                      <span key={index} className="tag is-info">
                        {servicio.tipo}: {servicio.cantidad}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {periodo && (
                <div className="columns">
                  <div className="column is-12">
                    <h3 className="title is-5">Período</h3>
                    <p className="subtitle is-6">
                      Desde: {periodo.desde} - Hasta: {periodo.hasta}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Jornada */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-header-title title is-4">JORNADA</h2>
            </div>
            <div className="card-content">
              {jornadas.length === 0 ? (
                <div className="has-text-centered py-6">
                  <Calendar size={48} className="has-text-grey-light mb-3" />
                  <h3 className="title is-5">No hay jornadas registradas</h3>
                  <p className="subtitle is-6 has-text-grey">Aún no se han creado partes diarios o remitos para este presupuesto.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="table is-fullwidth is-striped is-hoverable">
                    <thead>
                      <tr>
                        <th>FECHA</th>
                        <th>REMITO</th>
                        <th>INTERNO</th>
                        <th>BATEA</th>
                        <th>VOLCADOR</th>
                        <th>REGADOR</th>
                        <th>OPERADORA</th>
                        <th>IMAGEN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jornadas.map((jornada, index) => (
                        <tr key={index}>
                          <td>{formatearFecha(jornada.fecha)}</td>
                          <td>{jornada.remito}</td>
                          <td>{jornada.interno}</td>
                          <td>{jornada.batea || '-'}</td>
                          <td>{jornada.volcador || '-'}</td>
                          <td>{jornada.regador || '-'}</td>
                          <td>{jornada.operadora}</td>
                          <td>
                            {jornada.imagenUrl ? (
                              <button
                                onClick={() => mostrarImagen(jornada.imagenUrl!)}
                                className="button is-small is-info is-light"
                              >
                                <span className="icon is-small">
                                  <ImageIcon size={14} />
                                </span>
                                <span>Ver</span>
                              </button>
                            ) : (
                              <span className="has-text-grey-light">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Resumen de Jornadas */}
          {jornadas.length > 0 && (
            <div className="card mt-5">
              <div className="card-header">
                <h3 className="card-header-title title is-5">Resumen de Jornadas</h3>
              </div>
              <div className="card-content">
                <div className="table-container">
                  <table className="table is-fullwidth">
                    <thead>
                      <tr>
                        <th>EQUIPO</th>
                        <th>$</th>
                        <th>-</th>
                        <th>JORNADAS</th>
                        <th>$</th>
                        <th>-</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="has-background-warning-light">BATEA</td>
                        <td>$</td>
                        <td>-</td>
                        <td>{resumenEquipos.batea.toFixed(2)}</td>
                        <td>$</td>
                        <td>-</td>
                      </tr>
                      <tr>
                        <td className="has-background-warning-light">VOLCADOR</td>
                        <td>$</td>
                        <td>-</td>
                        <td>{resumenEquipos.volcador.toFixed(2)}</td>
                        <td>$</td>
                        <td>-</td>
                      </tr>
                      <tr>
                        <td className="has-background-warning-light">REGADOR 25/28 M3</td>
                        <td>$</td>
                        <td>-</td>
                        <td>{resumenEquipos.regador.toFixed(2)}</td>
                        <td>$</td>
                        <td>-</td>
                      </tr>
                      <tr>
                        <td className="has-background-warning-light">REGADOR 35 M3</td>
                        <td>$</td>
                        <td>-</td>
                        <td>-</td>
                        <td>$</td>
                        <td>-</td>
                      </tr>
                      <tr className="has-background-grey-lighter">
                        <td colSpan={3}></td>
                        <td className="has-text-weight-bold">{(resumenEquipos.batea + resumenEquipos.volcador + resumenEquipos.regador).toFixed(2)}</td>
                        <td>$</td>
                        <td>-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Imagen */}
      {showImageModal && (
        <div className="modal is-active">
          <div className="modal-background" onClick={() => setShowImageModal(false)}></div>
          <div className="modal-content">
            <div className="box">
              <img src={selectedImage} alt="Documento" style={{ maxWidth: '100%', height: 'auto' }} />
            </div>
          </div>
          <button 
            className="modal-close is-large" 
            aria-label="close"
            onClick={() => setShowImageModal(false)}
          ></button>
        </div>
      )}
    </div>
  );
}; 