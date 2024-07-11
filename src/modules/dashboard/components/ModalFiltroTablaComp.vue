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
              Seleccione el rango de fechas que desee consultar
            </div>
            <br /><br />
            <div class="col-12 q-pr-sm q-pb-md q-pb-lg">
              <q-input
                hint="Buscar por un rango de fechas"
                color="purple-ieen"
                filled
                v-model="textoFecha"
                label="Fecha de consulta"
                lazy-rules
                :rules="[(val) => !!val || 'Seleccione una fecha de consulta']"
              >
                <template v-slot:append>
                  <q-btn icon="event" color="purple-ieen" flat round>
                    <q-popup-proxy
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date
                        v-model="fecha"
                        :locale="myLocale"
                        mask="YYYY-MM-DD"
                        color="purple"
                        range
                      >
                        <div class="row items-center justify-end q-gutter-sm">
                          <q-btn
                            label="Aceptar"
                            color="primary"
                            flat
                            v-close-popup
                          />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-btn>
                </template>
              </q-input>
            </div>
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
import { useQuasar, QSpinnerFacebook } from "quasar";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref, watch, watchEffect } from "vue";
import { useDashboardStore } from "../../../stores/dashboard-store";

//-----------------------------------------------------------

const $q = useQuasar();
const dasboardStore = useDashboardStore();
const {
  areas_opt,
  areas,
  areas_Gastos,
  areas_Filtro,
  modal_filtro,
  myLocale,
  solicitudes_filtro,
  solicitudes_filtro_org,
  textoFecha,
  filtrar,
} = storeToRefs(dasboardStore);
const areasTodos = ref(true);
let textoAreaTodos = ref("Seleccionar todos");
let fecha = ref();

//-----------------------------------------------------------

watch(fecha, (val) => {
  if (typeof val != "string") {
    let { from, to } = val;
    textoFecha.value = "del " + from + " hasta " + to;
  } else {
    textoFecha.value = val;
  }
});

watchEffect(() => {
  textoAreaTodos.value =
    areasTodos.value == true ? "Deshabilitar todos" : "Seleccionar Todos";

  areas_Gastos.value.forEach((element) => {
    element.activo = areasTodos.value;
  });
});

//-----------------------------------------------------------

const verDetalle = async (id) => {
  $q.loading.show({
    spinner: QSpinnerFacebook,
    spinnerColor: "purple-ieen",
    spinnerSize: 140,
    backgroundColor: "purple-3",
    message: "Espere un momento, por favor...",
    messageColor: "black",
  });
  await misSolictudesStore.load_Solicitud(id);
  await distribucionStore.load_Distribuciones(id);
  await comprobacionStore.load_Informe(id);
  await comprobacionStore.load_Evidencias(id);
  misSolictudesStore.actualizarVisualizar(true);
  comprobacionStore.actualizarModal(true);
  $q.loading.hide();
};

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
    //filtrar fechas
    if (fecha.value != null && fecha.value != undefined) {
      const fecha_Inicio = new Date(fecha.value.from);
      const fecha_Fin = new Date(fecha.value.to);
      solicitudes_filtro.value = solicitudes_filtro.value.filter((element) => {
        const inicio = Date.parse(element.fecha_Salida);
        const fin = Date.parse(element.fecha_LLegada);
        return inicio >= fecha_Inicio && fin <= fecha_Fin;
      });
    }
    areas_Filtro.value = areas_Gastos.value.filter((x) => x.activo == true);
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
