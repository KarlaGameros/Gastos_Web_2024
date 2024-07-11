import { defineStore } from "pinia";
import { api } from "src/boot/axios";

export const useConfiguracionStore = defineStore("useConfiguracionStore", {
  state: () => ({
    list_Areas: [],
    list_Empleados_By_Area: [],
    responsable_area: {
      id: null,
      nombre_Completo: null,
      puesto: null,
      puesto_Id: null,
    },
    empleado: {
      id: null,
    },
  }),
  actions: {
    //-----------------------------------------------------------
    async load_Areas() {
      try {
        this.list_Areas = [];
        const resp = await api.get("/Areas/GetLista");
        let { data } = resp.data;
        this.list_Areas = data.map((area) => {
          return {
            label: area.label,
            value: area.value,
          };
        });
      } catch (error) {
        return {
          success: false,
          data: "Ocurrió un error, inténtelo de nuevo. Si el error persiste, contacte a soporte",
        };
      }
    },

    //-----------------------------------------------------------
    async load_Empleados_By_Area(id) {
      try {
        this.list_Empleados_By_Area = [];
        const resp = await api.get(`/Empleados/GetListaByArea/${id}`);
        if (resp.status == 200) {
          const { success, data } = resp.data;
          if (success === true) {
            if (data) {
              this.list_Empleados_By_Area = data.map((element) => {
                return {
                  label: element.label,
                  value: element.value,
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
      }
    },

    //-----------------------------------------------------------
    async load_Responsable_Area(id) {
      try {
        const resp = await api.get(`/Empleados/GetResponsableByArea/${id}`);
        if (resp.status == 200) {
          const { success, data, responsable } = resp.data;
          if (success === true) {
            if (responsable == true) {
              this.responsable_area.id = data.id;
              this.responsable_area.nombre_Completo = data.nombre_Completo;
              this.responsable_area.puesto = data.puesto;
              this.responsable_area.puesto_Id = data.puesto_Id;
            } else {
              this.responsable_area.id = 0;
              this.responsable_area.nombre_Completo = "Sin registro";
              this.responsable_area.puesto = "Sin Registro";
              this.responsable_area.puesto_Id = 0;
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
      }
    },

    //-----------------------------------------------------------
    async load_Responsable_Empleado(empleadoId) {
      try {
        const resp = await api.get(
          `/Empleados/GetResponsableByEmpleado/${empleadoId}`
        );
        if (resp.status == 200) {
          const { success, data, responsable } = resp.data;
          if (success === true) {
            if (responsable == true) {
              this.responsable_area.id = data.id;
              this.responsable_area.nombre_Completo = data.nombre_Completo;
              this.responsable_area.puesto = data.puesto;
              this.responsable_area.puesto_Id = data.puesto_Id;
            } else {
              this.responsable_area.id = 0;
              this.responsable_area.nombre_Completo = "Sin registro";
              this.responsable_area.puesto = "Sin Registro";
              this.responsable_area.puesto_Id = 0;
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
      }
    },

    //-----------------------------------------------------------
    async load_Empleado_ByUsusario() {
      try {
        const resp = await api.get("/Empleados/ByUsuario");
        if (resp.status == 200) {
          const { success, data } = resp.data;
          if (success === true) {
            this.empleado.id = data.id;
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
  },
});
