<template>
  <q-dialog
    v-model="modal_filtro"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card style="width: 900px; max-width: 90vw">
      <div class="flotante">
        <q-card-section class="row">
          <q-img src="../../../assets/IEEN300.png" width="90px" />
          <div class="text-h5 text-gray-ieen-1 text-bold absolute-center">
            FILTRAR
          </div>
          <q-space />
          <q-btn
            icon="close"
            @click="actualizarModal(false)"
            flat
            round
            dense
            v-close-popup
          />
        </q-card-section>
      </div>
      <q-card-section>
        <q-form @submit="onSubmit">
          <div class="row">
            <div class="text-subtitle1 text-gray-ieen-1 text-bold">
              Seleccione las áreas de las que desee que se aplique el filtro
            </div>
            <div class="col-12">
              <q-checkbox
                size="lg"
                class="text-bold text-subtitle1"
                left-label
                v-model="areasTodos"
                :label="textoAreaTodos"
                color="green"
                checked-icon="task_alt"
                unchecked-icon="highlight_off"
              />
            </div>
            <div class="col-6">
              <q-list bordered>
                <q-item
                  v-for="area in areas.filter(
                    (x) => !x.area_Nombre.includes('CME')
                  )"
                  :key="area"
                >
                  <q-item-section class="text-gray-ieen-1 text-bold">{{
                    area.area_Nombre
                  }}</q-item-section>
                  <q-item-section avatar>
                    <q-btn
                      size="sm"
                      round
                      :color="area.activo == true ? 'green' : 'red-5'"
                      :icon="area.activo == true ? 'done' : 'close'"
                      @click="area.activo = !area.activo"
                    ></q-btn>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
            <div class="col-6">
              <q-list bordered>
                <q-item
                  v-for="area in areas.filter((x) =>
                    x.area_Nombre.includes('CME')
                  )"
                  :key="area"
                >
                  <q-item-section class="text-gray-ieen-1 text-bold">{{
                    area.area_Nombre
                  }}</q-item-section>
                  <q-item-section avatar>
                    <q-btn
                      size="sm"
                      round
                      :color="area.activo == true ? 'green' : 'red-5'"
                      :icon="area.activo == true ? 'done' : 'close'"
                      @click="area.activo = !area.activo"
                    ></q-btn>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
          <div class="flotanteFooter">
            <div class="col-12 justify-end">
              <div class="text-right q-gutter-xs">
                <q-btn
                  color="red"
                  label="Cancelar"
                  @click="actualizarModal()"
                  icon="highlight_off"
                />
                <q-btn
                  type="submit"
                  color="secondary"
                  label="Filtrar"
                  icon="filter_alt"
                >
                </q-btn>
              </div>
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { useQuasar } from "quasar";
import { storeToRefs } from "pinia";
import { ref, watch, watchEffect } from "vue";
import { useDashboardStore } from "../../../stores/dashboard-store";

//-----------------------------------------------------------

const $q = useQuasar();
const dasboardStore = useDashboardStore();
const {
  areas,
  areas_Gastos,
  areas_Filtro,
  modal_filtro,
  solicitudes_filtro,
  solicitudes_filtro_org,
  fecha,
  total_Erogado,
  solicitudes_Totales,
  total_Utilizado,
  total_Reitegrado,
  total_Saldo,
  areasTodos,
} = storeToRefs(dasboardStore);
let textoAreaTodos = ref("Seleccionar todos");

//-----------------------------------------------------------

watchEffect(() => {
  textoAreaTodos.value =
    areasTodos.value == true ? "Deshabilitar todos" : "Seleccionar Todos";
  areas_Gastos.value.forEach((element) => {
    element.activo = areasTodos.value;
  });
});

watch(areas_Gastos, (val) => {
  if (val.length > 0) {
    textoAreaTodos.value =
      areasTodos.value == true ? "Deshabilitar todos" : "Seleccionar Todos";
    areas_Gastos.value.forEach((element) => {
      element.activo = areasTodos.value;
    });
  }
});

//-----------------------------------------------------------

const actualizarModal = () => {
  dasboardStore.actualizar_modal_filtro(false);
};

const onSubmit = () => {
  if (areas.value.find((x) => x.activo == true)) {
    const solicitudes = solicitudes_filtro_org.value;
    const areas = areas_Gastos.value
      .filter((x) => x.activo == true)
      .map((x) => x.area_Id);
    solicitudes_filtro.value = solicitudes.filter((x) =>
      areas.includes(x.area_Id)
    );
    if (fecha.value != null && fecha.value != undefined) {
      const fecha_Inicio = new Date(fecha.value.from);
      const fecha_Fin = new Date(fecha.value.to);
      solicitudes_filtro.value = solicitudes_filtro.value.filter((element) => {
        const inicio = Date.parse(element.fecha_Salida);
        const fin = Date.parse(element.fecha_LLegada);
        return inicio >= fecha_Inicio && fin <= fecha_Fin;
      });
    }
    const initialValue = 0;
    areas_Filtro.value = areas_Gastos.value.filter((x) => x.activo == true);
    solicitudes_Totales.value = solicitudes_filtro.value.length;
    total_Erogado.value = solicitudes_filtro.value.reduce(
      (accumulator, area) => accumulator + area.monto_Asignado,
      initialValue
    );
    total_Utilizado.value = solicitudes_filtro.value.reduce(
      (accumulator, area) => accumulator + area.monto_Utilizado,
      initialValue
    );
    total_Reitegrado.value = solicitudes_filtro.value.reduce(
      (accumulator, area) => accumulator + area.monto_Reintegro,
      initialValue
    );
    total_Saldo.value = solicitudes_filtro.value.reduce(
      (accumulator, area) => accumulator + area.saldo,
      initialValue
    );
    actualizarModal();
  } else {
    $q.dialog({
      title: "No ha seleccionado áreas",
      message: `Es necesario seleccionar minimo 1 área para hacer el filtro`,
      icon: "Warning",
      persistent: true,
      transitionShow: "scale",
      transitionHide: "scale",
      ok: false,
      cancel: {
        color: "red",
        label: "Cerrar",
      },
    });
  }
};
</script>
<style scoped>
.flotante {
  position: sticky;
  top: 1px;
  z-index: 999;
  background-color: white;
}
.flotanteFooter {
  margin-top: auto;
  width: 100%;
  position: sticky;
  bottom: 0;
  padding: 10px;
  background-color: white;
}
</style>
