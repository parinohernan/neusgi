import React from 'react';
import { 
  Eye, 
  Download, 
  Edit, 
  FileText, 
  Play, 
  CheckCircle, 
  Receipt,
  ClipboardList,
  Award,
  Trash2
} from 'lucide-react';
import type { Presupuesto } from '../../types';

interface PresupuestoActionsProps {
  presupuesto: Presupuesto;
  onVer: (id: number) => void;
  onDescargarPDF: (id: number) => void;
  onEditar: (id: number) => void;
  onEliminar: (id: number) => void;
  onCambiarEstado: (id: number, estado: 'pendiente' | 'aceptado' | 'rechazado' | 'activo' | 'concluido' | 'finalizado') => void;
  onAgregarOC?: (id: number) => void;
  onIniciarActividad?: (id: number) => void;
  onAgregarRemito?: (id: number) => void;
  onAgregarParteDiario?: (id: number) => void;
  onFinalizarActividad?: (id: number) => void;
  onCrearCertificado?: (id: number) => void;
  onFacturar?: (id: number) => void;
}

export const PresupuestoActions: React.FC<PresupuestoActionsProps> = ({
  presupuesto,
  onVer,
  onDescargarPDF,
  onEditar,
  onEliminar,
  onCambiarEstado,
  onAgregarOC,
  onIniciarActividad,
  onAgregarRemito,
  onAgregarParteDiario,
  onFinalizarActividad,
  onCrearCertificado,
  onFacturar
}) => {
  const renderAccionesComunes = () => (
    <>
      <button
        className="button is-info is-light is-small"
        onClick={() => onVer(presupuesto.id)}
        title="Ver detalles"
      >
        <span className="icon">
          <Eye size={14} />
        </span>
      </button>
      <button
        className="button is-success is-light is-small"
        onClick={() => onDescargarPDF(presupuesto.id)}
        title="Descargar PDF"
      >
        <span className="icon">
          <Download size={14} />
        </span>
      </button>
    </>
  );

  const renderAccionesPendiente = () => (
    <>
      {renderAccionesComunes()}
      <button
        className="button is-success is-light is-small"
        onClick={() => onCambiarEstado(presupuesto.id, 'aceptado')}
        title="Aceptar Presupuesto"
      >
        <span className="icon">
          <CheckCircle size={14} />
        </span>
      </button>
      <button
        className="button is-warning is-light is-small"
        onClick={() => onEditar(presupuesto.id)}
        title="Editar"
      >
        <span className="icon">
          <Edit size={14} />
        </span>
      </button>
      <button
        className="button is-danger is-light is-small"
        onClick={() => onEliminar(presupuesto.id)}
        title="Eliminar"
      >
        <span className="icon">
          <Trash2 size={14} />
        </span>
      </button>
    </>
  );

  const renderAccionesAceptado = () => (
    <>
      {renderAccionesComunes()}
      <button
        className="button is-primary is-light is-small"
        onClick={() => {
          if (presupuesto.ordenCompra) {
            // Si ya existe una orden de compra, navegar a editar
            onAgregarOC ? onAgregarOC(presupuesto.id) : window.location.href = `/presupuestos/${presupuesto.id}/orden-compra/editar`;
          } else {
            // Si no existe, navegar a crear nueva
            onAgregarOC ? onAgregarOC(presupuesto.id) : window.location.href = `/presupuestos/${presupuesto.id}/orden-compra/nueva`;
          }
        }}
        title={presupuesto.ordenCompra ? "Editar Orden de Compra" : "Agregar Orden de Compra"}
      >
        <span className="icon">
          <FileText size={14} />
        </span>
      </button>
      {presupuesto.ordenCompra && (
        <button
          className="button is-info is-light is-small"
          onClick={() => {
            if (onIniciarActividad) {
              onIniciarActividad(presupuesto.id);
            } else {
              // Implementación por defecto
              if (window.confirm('¿Estás seguro de que quieres iniciar la actividad? Esto cambiará el estado del presupuesto y marcará los equipos como ocupados.')) {
                // Aquí se podría hacer la llamada al servicio directamente
                alert('Función en desarrollo - Se implementará la llamada al servicio');
              }
            }
          }}
          title="Iniciar Actividad"
        >
          <span className="icon">
            <Play size={14} />
          </span>
        </button>
      )}
    </>
  );

  const renderAccionesActivo = () => (
    <>
      {renderAccionesComunes()}
      <button
        className="button is-primary is-light is-small"
        onClick={() => {
          if (onAgregarRemito) {
            onAgregarRemito(presupuesto.id);
          } else {
            alert('Función Agregar Remito en desarrollo');
          }
        }}
        title="Agregar Remito"
      >
        <span className="icon">
          <ClipboardList size={14} />
        </span>
      </button>
      <button
        className="button is-info is-light is-small"
        onClick={() => {
          if (onAgregarParteDiario) {
            onAgregarParteDiario(presupuesto.id);
          } else {
            alert('Función Agregar Parte Diario en desarrollo');
          }
        }}
        title="Agregar Parte Diario"
      >
        <span className="icon">
          <FileText size={14} />
        </span>
      </button>
      <button
        className="button is-success is-light is-small"
        onClick={() => {
          if (onFinalizarActividad) {
            onFinalizarActividad(presupuesto.id);
          } else {
            alert('Función Finalizar Actividad en desarrollo');
          }
        }}
        title="Finalizar Actividad"
      >
        <span className="icon">
          <CheckCircle size={14} />
        </span>
      </button>
    </>
  );

  const renderAccionesConcluido = () => (
    <>
      {renderAccionesComunes()}
      {onAgregarRemito && (
        <button
          className="button is-primary is-light is-small"
          onClick={() => onAgregarRemito(presupuesto.id)}
          title="Agregar Remito"
        >
          <span className="icon">
            <ClipboardList size={14} />
          </span>
        </button>
      )}
      {onAgregarParteDiario && (
        <button
          className="button is-info is-light is-small"
          onClick={() => onAgregarParteDiario(presupuesto.id)}
          title="Agregar Parte Diario"
        >
          <span className="icon">
            <FileText size={14} />
          </span>
        </button>
      )}
      {onCrearCertificado && (
        <button
          className="button is-warning is-light is-small"
          onClick={() => onCrearCertificado(presupuesto.id)}
          title="Crear Certificado"
        >
          <span className="icon">
            <Award size={14} />
          </span>
        </button>
      )}
      {onFacturar && (
        <button
          className="button is-success is-light is-small"
          onClick={() => onFacturar(presupuesto.id)}
          title="Facturar"
        >
          <span className="icon">
            <Receipt size={14} />
          </span>
        </button>
      )}
    </>
  );

  const renderAccionesFinalizado = () => (
    <>
      {renderAccionesComunes()}
      <span className="tag is-dark">
        Finalizado
      </span>
    </>
  );

  const renderAcciones = () => {
    switch (presupuesto.estado) {
      case 'pendiente':
        return renderAccionesPendiente();
      case 'aceptado':
        return renderAccionesAceptado();
      case 'activo':
        return renderAccionesActivo();
      case 'concluido':
        return renderAccionesConcluido();
      case 'finalizado':
        return renderAccionesFinalizado();
      case 'rechazado':
        return renderAccionesComunes();
      default:
        return renderAccionesComunes();
    }
  };

  return (
    <div className="buttons are-small">
      {renderAcciones()}
    </div>
  );
}; 