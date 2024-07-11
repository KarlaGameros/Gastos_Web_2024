import { defineStore } from "pinia";
import { api } from "src/boot/axios";

export const useReintegroStore = defineStore("useReintegroStore", {
  state: () => ({
    is_Editar: false,
    visualizar: false,
    modal: false,
    reintegro: {
      fecha_Reintegro: null,
      monto_Reintegro: null,
      folio_Reintegro: null,
      comprobante: null,
      devolucion_Content_Type: null,
      solicitud_Id: null,
      fecha_Devolucion: null,
      comprobante_Url: null,
    },
    archivo_Reintegro: null,
  }),
  actions: {
    actualizarModal(valor) {
      this.modal = valor;
    },

    actualizarVisualizar(valor) {
      this.visualizar = valor;
    },

    //-----------------------------------------------------------
    init_Reintegro() {
      this.reintegro.fecha_Reintegro = null;
      this.reintegro.comprobante = null;
      this.reintegro.folio_Reintegro = null;
      this.reintegro.devolucion_Content_Type = null;
      this.reintegro.monto_Reintegro = null;
      this.reintegro.solicitud_Id = null;
      this.reintegro.fecha_Devolucion = null;
      this.reintegro.comprobante_Url = null;
    },

    async generar_Reintegro(id, reintegro) {
      try {
        const resp = await api.post(
          `/GastosComprobar/SolicitudesGastosComprobar/Reintegro/${id}`,
          reintegro,
          {
            headers: {
              "Conten-Type": "multipart/form-data",
            },
          }
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

    //-----------------------------------------------------------
    async load_Reintegro(id) {
      try {
        const resp = await api.get(
          `/GastosComprobar/SolicitudesGastosComprobar/GetReintegro/${id}`
        );
        if (resp.status == 200) {
          const { success, data } = resp.data;
          if (success === true) {
            this.reintegro.comprobante = data.comprobante_Url;
            this.reintegro.fecha_Reintegro = data.fecha_Devolucion;
            this.reintegro.monto_Reintegro = data.monto_Reintegro;
            this.reintegro.folio_Reintegro = data.folio_Reintegro;
            this.reintegro.devolucion_Content_Type =
              data.devolucion_Content_Type;
            this.reintegro.solicitud_Id = data.solicitud_Id;
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
      }
    },

    //-----------------------------------------------------------
    async descargar_reintegro(id, tipo) {
      try {
        const resp = await api.get(
          `/GastosComprobar/SolicitudesGastosComprobar/GetReintegroURL/${id}`,
          {
            responseType: "blob",
          }
        );
        if (resp.status == 200) {
          let blob = new window.Blob([resp.data], { type: tipo });
          this.archivo_Reintegro = window.URL.createObjectURL(blob);
          return { success: true };
        } else {
          return {
            success: false,
            data: "Error al descargar archivo, intentelo de nuevo",
          };
        }
      } catch (error) {
        return {
          success: false,
          data: "Ocurrió un error, inténtelo de nuevo. Si el error persiste, contacte a soporte",
        };
      }
    },

    //-----------------------------------------------------------
    async aprobar_reintegro(id) {
      try {
        const resp = await api.get(
          `/GastosComprobar/SolicitudesGastosComprobar/AprobarReintegro/${id}`
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

    //-----------------------------------------------------------
    async delete_Reintegro(id) {
      try {
        const resp = await api.delete(
          `/GastosComprobar/SolicitudesGastosComprobar/EliminarReintegro/${id}`
        );
        if (resp.status == 200) {
          const { success, data } = resp.data;
          if (success === true) {
            return { success, data };
          } else {
            return { success, data };
          }
        } else {
          return {
            success: false,
            data: "Ocurrió un error, inténtelo de nuevo. Si el error persiste, contacte a soporte",
          };
        }
      } catch (e) {
        return {
          success: false,
          data: "Ocurrió un error, inténtelo de nuevo. Si el error persiste, contacte a soporte",
        };
      }
    },
  },
});
