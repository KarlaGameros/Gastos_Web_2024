import { defineStore } from "pinia";
import { api } from "src/boot/axios";

export const useNotificacionStore = defineStore("notificacion", {
  state: () => ({
    isLoading: false,
    notificaciones: [],
    notificaciones_all: [],
    no_notificaciones: 0,
  }),

  actions: {
    async loadNotificaciones() {
      try {
        this.isLoading = true;
        const resp = await api.get("/GastosComprobar/NotificacionesGC");
        if (resp.status == 200) {
          const { success, data } = resp.data;
          if (success == true) {
            if (data) {
              const notificaciones_array = data.notificaciones.map(
                (notificacion) => {
                  return {
                    id: notificacion.id,
                    titulo: notificacion.titulo,
                    descripcion: notificacion.descripcion,
                    fecha_Registro: notificacion.fecha_Registro,
                    leido: notificacion.leido,
                    denuncia_Id: notificacion.denuncia_Id,
                    solicitud_Id: notificacion.solicitud_Id,
                    tipo: notificacion.tipo,
                  };
                }
              );
              this.notificaciones = notificaciones_array;
              this.no_notificaciones = data.no_Notificaciones;
            }
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
        this.isLoading = false;
      }
    },

    async loadNotificacionesAll() {
      try {
        this.isLoading = true;
        const resp = await api.get("/GastosComprobar/NotificacionesGC/GetAll");
        if (resp.status == 200) {
          const { success, data } = resp.data;
          if (success == true) {
            if (data) {
              const notificaciones_array = data.map((notificacion) => {
                return {
                  id: notificacion.id,
                  titulo: notificacion.titulo,
                  descripcion: notificacion.descripcion,
                  fecha_Registro: notificacion.fecha_Registro,
                  leido: notificacion.leido,
                  denuncia_Id: notificacion.denuncia_Id,
                  solicitud_Id: notificacion.solicitud_Id,
                };
              });
              this.notificaciones_all = notificaciones_array;
            }
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
        this.isLoading = false;
      }
    },

    async leerNotificacion(notificacionId) {
      try {
        const resp = await api.get(
          `/GastosComprobar/NotificacionesGC/Leer/${notificacionId}`
        );
        if (resp.status == 200) {
          const { success, data } = resp.data;
          this.loadNotificaciones();
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
