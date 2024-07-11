import { defineStore } from "pinia";
import { api } from "src/boot/axios";

export const useDashboardStore = defineStore("dashboard", {
  state: () => ({
    filtrar: false,
    yearFiltro: null,
    solicitudes: [],
    montos_Erogados: [],
    montos_Utilizados: [],
    areas_Gastos: [],
    areas_Filtro: [],
    areas: [],
    solicitudes_Totales: 0,
    total_Erogado: 0,
    total_Utilizado: 0,
    total_Reitegrado: 0,
    total_Saldo: 0,
    textoFecha: "",
    solicitudes_filtro: [],
    solicitudes_filtro_org: [],
    is_loading: false,
    areas_opt: [],
    modal_filtro: false,
    myLocale: {
      days: "Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado".split("_"),
      daysShort: "Dom_Lun_Mar_Mié_Jue_Vie_Sáb".split("_"),
      months:
        "Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre".split(
          "_"
        ),
      monthsShort: "Ene_Feb_Mar_Abr_May_Jun_Jul_Ago_Sep_Oct_Nov_Dic".split("_"),
      firstDayOfWeek: 1, // 0-6, 0 - Sunday, 1 Monday, ...
      format24h: true,
      pluralDay: "dias",
    },
  }),
  actions: {
    async loadDashboard(year) {
      try {
        this.solicitudes = [];
        this.montos = [];
        this.areas_Filtro = [];
        this.areas_Gastos = [];
        const resp = await api.get(`/GastosComprobar/Dashboard/${year}`);
        if (resp.status == 200) {
          const { success, data } = resp.data;
          if (success == true) {
            const {
              solicitudes,
              montos_Erogados,
              montos_Utilizados,
              areas_Gastos,
              solicitudes_Totales,
              total_Erogado,
              total_Utilizado,
              total_Reitegrado,
              total_Saldo,
            } = data;
            this.solicitudes = solicitudes;
            this.montos_Erogados = montos_Erogados;
            this.montos_Utilizados = montos_Utilizados;
            this.areas_Gastos = areas_Gastos;
            this.areas_Filtro = areas_Gastos;
            this.areas = areas_Gastos;
            this.solicitudes_Totales = solicitudes_Totales;
            this.total_Erogado = total_Erogado;
            this.total_Utilizado = total_Utilizado;
            this.total_Reitegrado = total_Reitegrado;
            this.total_Saldo = total_Saldo;
          } else {
            return {
              success: false,
              data: "Ocurrió un error, inténtelo de nuevo. Si el error persiste, contacte a soporte",
            };
          }
        }
      } catch (error) {
        return {
          success: false,
          data: "Ocurrió un error, inténtelo de nuevo. Si el error persiste, contacte a soporte",
        };
      }
    },

    async load_solicitudes(year) {
      try {
        this.is_loading = true;
        this.solicitudes_filtro = [];
        this.solicitudes_filtro_org = [];
        const resp = await api.get(
          `/GastosComprobar/Dashboard/Solicitudes/${year}`
        );
        if (resp.status == 200) {
          const { success, data } = resp.data;
          if (success === true) {
            if (data) {
              const solicitudesArray = data.map((solicitud) => {
                return {
                  id: solicitud.id,
                  folio: solicitud.folio,
                  area: solicitud.area,
                  area_Id: solicitud.area_Id,
                  e_Reintegro: solicitud.e_Reintegro,
                  empleado_Solicitante: solicitud.empleado_Solicitante,
                  fecha_Salida: solicitud.fecha_Salida,
                  fecha_LLegada: solicitud.fecha_LLegada,
                  monto_Asignado: `$${solicitud.monto_Asignado.toLocaleString(
                    "en-US"
                  )}`,
                  monto_Utilizado: `$${solicitud.monto_Utilizado.toLocaleString(
                    "en-US"
                  )}`,
                  monto_Reintegro: solicitud.e_Reintegro
                    ? `$${solicitud.monto_Reintegro.toLocaleString("en-US")}`
                    : "$0",
                  saldo: `$${solicitud.monto_Saldo}`,
                  estatus: solicitud.estatus,
                };
              });
              this.solicitudes_filtro = solicitudesArray;
              this.solicitudes_filtro_org = solicitudesArray;
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
        this.is_loading = false;
      }
    },

    async load_areas_opt() {
      try {
        const resp = await api.get("/Areas/GetLista");
        if (resp.status == 200) {
          const { success, data } = resp.data;
          if (success == true) {
            this.areas_opt = data.map((area) => {
              return {
                label: area.label,
                value: area.value,
                activo: true,
              };
            });
            return { success };
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

    actualizar_modal_filtro(valor) {
      this.modal_filtro = valor;
    },
  },
});
