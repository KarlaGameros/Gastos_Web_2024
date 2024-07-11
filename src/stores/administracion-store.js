import { defineStore } from "pinia";
import { api } from "src/boot/axios";

export const useAdministracionStore = defineStore("useAdministracionStore", {
  state: () => ({
    modal: false,
    loading: false,
    pendiente_Firma: false,
    list_Pendientes_Administracion: [],
    list_Recibidas_Administracion: [],
    list_Pendientes_Firmas: [],
  }),
  actions: {
    actualizarModal(valor) {
      this.modal = valor;
    },

    actualizarPendienteFirma(valor) {
      this.pendiente_Firma = valor;
    },

    //-----------------------------------------------------------
    async load_Solicitudes_Administracion() {
      try {
        this.loading = true;
        this.list_Pendientes_Administracion = [];
        const resp = await api.get(
          "/GastosComprobar/SolicitudesGastosComprobar/PendientesAdministracion"
        );
        if (resp.status == 200) {
          const { success, data } = resp.data;
          if (success === true) {
            if (data) {
              this.list_Pendientes_Administracion = data.map((solicitud) => {
                return {
                  id: solicitud.id,
                  folio: solicitud.folio,
                  empleado_Registra_Id: solicitud.empleado_Registra_Id,
                  empleado_Registra: solicitud.empleado_Registra,
                  empleado_Solicitante_Id: solicitud.empleado_Solicitante_Id,
                  empleado_Solicitante: solicitud.empleado_Solicitante,
                  puesto_Empleado_Solicitante_Id:
                    solicitud.puesto_Empleado_Solicitante_Id,
                  puesto_Empleado_Solicitante:
                    solicitud.puesto_Empleado_Solicitante,
                  responsable_Area_Id: solicitud.responsable_Area_Id,
                  responsable_Area: solicitud.responsable_Area,
                  puesto_Responsable_Area_Id:
                    solicitud.puesto_Responsable_Area_Id,
                  puesto_Responsable_Area: solicitud.puesto_Responsable_Area,
                  empleado_Rec_Financieros_Id:
                    solicitud.empleado_Rec_Financieros_Id,
                  empleado_Rec_Financieros: solicitud.empleado_Rec_Financieros,
                  fecha_Salida: solicitud.fecha_Salida,
                  fecha_LLegada: solicitud.fecha_LLegada,
                  pernoctado: solicitud.pernoctado,
                  pernoctado_String: solicitud.pernoctado_String,
                  estatus: solicitud.estatus,
                  monto_Asignado: `$${solicitud.monto_Asignado.toFixed(2)}`,
                  monto_Utilizado: `$${solicitud.monto_Utilizado.toFixed(2)}`,
                  monto_Saldo: `$${solicitud.monto_Saldo.toFixed(2)}`,
                  fecha_Registro: solicitud.fecha_Registro,
                  destino: solicitud.destino,
                  aprobado_Recursos_Financieros:
                    solicitud.aprobado_Recursos_Financieros,
                };
              });
            }
          } else {
            return { success, data };
          }
        } else {
          return {
            success: false,
            data: "Ocurrió un error, inténtelo de nuevo. Si el error persiste, contacte a soporte",
          };
        }
      } catch (error) {
        return {
          success: false,
          data: "Ocurrió un error, inténtelo de nuevo. Si el error persiste, contacte a soporte",
        };
      } finally {
        this.loading = false;
      }
    },

    //-----------------------------------------------------------
    async load_Recibidas_Administracion() {
      try {
        this.loading = true;
        this.list_Recibidas_Administracion = [];
        const resp = await api.get(
          "/GastosComprobar/SolicitudesGastosComprobar/Administracion"
        );
        if (resp.status == 200) {
          const { success, data } = resp.data;
          if (success === true) {
            if (data) {
              this.list_Recibidas_Administracion = data.map((solicitud) => {
                return {
                  id: solicitud.id,
                  folio: solicitud.folio,
                  empleado_Registra_Id: solicitud.empleado_Registra_Id,
                  empleado_Registra: solicitud.empleado_Registra,
                  empleado_Solicitante_Id: solicitud.empleado_Solicitante_Id,
                  empleado_Solicitante: solicitud.empleado_Solicitante,
                  puesto_Empleado_Solicitante_Id:
                    solicitud.puesto_Empleado_Solicitante_Id,
                  puesto_Empleado_Solicitante:
                    solicitud.puesto_Empleado_Solicitante,
                  responsable_Area_Id: solicitud.responsable_Area_Id,
                  responsable_Area: solicitud.responsable_Area,
                  puesto_Responsable_Area_Id:
                    solicitud.puesto_Responsable_Area_Id,
                  puesto_Responsable_Area: solicitud.puesto_Responsable_Area,
                  empleado_Rec_Financieros_Id:
                    solicitud.empleado_Rec_Financieros_Id,
                  empleado_Rec_Financieros: solicitud.empleado_Rec_Financieros,
                  fecha_Salida: solicitud.fecha_Salida,
                  fecha_LLegada: solicitud.fecha_LLegada,
                  pernoctado_String: solicitud.pernoctado_String,
                  pernoctado: solicitud.pernoctado,
                  estatus: solicitud.estatus,
                  monto_Asignado: `$${solicitud.monto_Asignado.toFixed(2)}`,
                  monto_Utilizado: `$${solicitud.monto_Utilizado.toFixed(2)}`,
                  monto_Saldo: `$${solicitud.monto_Saldo.toFixed(2)}`,
                  fecha_Registro: solicitud.fecha_Registro,
                  destino: solicitud.destino,
                  empleado_Recibe_Administracion:
                    solicitud.empleado_Recibe_Administracion,
                  fecha_Recepcion_Administracion:
                    solicitud.fecha_Recepcion_Administracion,
                };
              });
            }
          } else {
            return { success, data };
          }
        } else {
          return {
            success: false,
            data: "Ocurrió un error, inténtelo de nuevo. Si el error persiste, contacte a soporte",
          };
        }
      } catch (error) {
        return {
          success: false,
          data: "Ocurrió un error, inténtelo de nuevo. Si el error persiste, contacte a soporte",
        };
      } finally {
        this.loading = false;
      }
    },

    //-----------------------------------------------------------
    async load_Pendientes_Firmas() {
      try {
        this.loading = true;
        this.list_Pendientes_Firmas = [];
        const resp = await api.get(
          "/GastosComprobar/SolicitudesGastosComprobar/PendientesFirmas"
        );
        if (resp.status == 200) {
          const { success, data } = resp.data;
          if (success === true) {
            if (data) {
              this.list_Pendientes_Firmas = data.map((solicitud) => {
                return {
                  id: solicitud.id,
                  folio: solicitud.folio,
                  empleado_Registra_Id: solicitud.empleado_Registra_Id,
                  empleado_Registra: solicitud.empleado_Registra,
                  empleado_Solicitante_Id: solicitud.empleado_Solicitante_Id,
                  empleado_Solicitante: solicitud.empleado_Solicitante,
                  puesto_Empleado_Solicitante_Id:
                    solicitud.puesto_Empleado_Solicitante_Id,
                  puesto_Empleado_Solicitante:
                    solicitud.puesto_Empleado_Solicitante,
                  responsable_Area_Id: solicitud.responsable_Area_Id,
                  responsable_Area: solicitud.responsable_Area,
                  puesto_Responsable_Area_Id:
                    solicitud.puesto_Responsable_Area_Id,
                  puesto_Responsable_Area: solicitud.puesto_Responsable_Area,
                  empleado_Rec_Financieros_Id:
                    solicitud.empleado_Rec_Financieros_Id,
                  empleado_Rec_Financieros: solicitud.empleado_Rec_Financieros,
                  fecha_Salida: solicitud.fecha_Salida,
                  fecha_LLegada: solicitud.fecha_LLegada,
                  pernoctado_String: solicitud.pernoctado_String,
                  pernoctado: solicitud.pernoctado,
                  estatus: solicitud.estatus,
                  monto_Asignado: `$${solicitud.monto_Asignado.toFixed(2)}`,
                  monto_Utilizado: `$${solicitud.monto_Utilizado.toFixed(2)}`,
                  monto_Saldo: `$${solicitud.monto_Saldo.toFixed(2)}`,
                  fecha_Registro: solicitud.fecha_Registro,
                  destino: solicitud.destino,
                  empleado_Recibe_Administracion:
                    solicitud.empleado_Recibe_Administracion,
                  fecha_Recepcion_Administracion:
                    solicitud.fecha_Recepcion_Administracion,
                };
              });
            }
          } else {
            return { success, data };
          }
        } else {
          return {
            success: false,
            data: "Ocurrió un error, inténtelo de nuevo. Si el error persiste, contacte a soporte",
          };
        }
      } catch (error) {
        return {
          success: false,
          data: "Ocurrió un error, inténtelo de nuevo. Si el error persiste, contacte a soporte",
        };
      } finally {
        this.loading = false;
      }
    },

    //-----------------------------------------------------------
    async recibir_Admon(id, tipo) {
      try {
        const resp = await api.get(
          `/GastosComprobar/SolicitudesGastosComprobar/RecbibirAdmon/${id}/${tipo}`
        );
        if (resp.status == 200) {
          const { success, data } = resp.data;
          return { success, data };
        } else {
          return {
            success: false,
            data: "Ocurrió un error, inténtelo de nuevo. Si el error persiste, contacte a soporte",
          };
        }
      } catch (error) {
        return {
          success: false,
          data: "Ocurrió un error, inténtelo de nuevo. Si el error persiste, contacte a soporte",
        };
      }
    },
  },
});
