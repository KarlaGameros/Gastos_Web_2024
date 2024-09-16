<template>
  <q-page>
    <div class="row bg-grey-2">
      <div class="col-9">
        <div class="q-pa-md q-gutter-sm">
          <div class="text-gray-ieen-1 text-h6">
            Solicitudes recursos financieros
          </div>
          <q-breadcrumbs>
            <template v-slot:separator>
              <q-icon size="1.5em" name="chevron_right" color="primary" />
            </template>
            <q-breadcrumbs-el icon="home" label="Inicio" to="/" />
            <q-breadcrumbs-el class="text-grey-7" label="Solicitudes" />
          </q-breadcrumbs>
        </div>
      </div>
    </div>
    <div class="row q-pl-lg q-pt-lg">
      <q-select
        style="width: 250px"
        dense
        filled
        v-model="año"
        :options="years"
        label="Filtrar por año"
        class="q-pr-md"
        color="purple-ieen"
      />
      <q-select
        style="width: 250px"
        dense
        filled
        v-model="area_Id"
        :options="list_Areas_Filtro"
        label="Filtrar por área"
        color="purple-ieen"
      />
    </div>
    <div class="row q-pa-lg">
      <div class="col">
        <q-card>
          <q-tabs
            v-model="tab"
            dense
            active-color="purple-ieen"
            indicator-color="purple-ieen"
            align="justify"
            class="bg-grey-4 text-grey shadow-2 text-bold"
          >
            <q-tab
              icon="pending_actions"
              name="pendientes"
              label="Pendientes de aprobación"
            >
              <q-badge color="purple" floating>
                {{ list_Solicitudes_RF_Filtro.length }}
              </q-badge>
            </q-tab>
            <q-tab
              icon="downloading"
              name="aprobados_rf"
              label="Aprobadas RF / Pendiente pago"
            >
              <q-badge color="purple" floating>
                {{
                  list_Solictudes_Aprobadas_RF_Filtro.filter(
                    (x) =>
                      x.pagado == false &&
                      x.estatus != "Cancelado" &&
                      x.saldo_Cero != true
                  ).length
                }}
              </q-badge>
            </q-tab>
            <q-tab icon="paid" name="pagada" label="Pagadas" />
            <q-tab
              icon="pending"
              name="pendiente_concluir"
              label="Pendientes de concluir"
            >
              <q-badge color="purple" floating>
                {{
                  list_Solictudes_Aprobadas_RF_Filtro.filter(
                    (x) =>
                      x.estatus != "Concluido" &&
                      x.estatus != "Cancelado" &&
                      x.estatus != "Pagada" &&
                      x.estatus != "Pendiente" &&
                      (x.pagado == true ||
                        x.fecha_Pago != "Sin registro" ||
                        x.saldo_Cero == true)
                  ).length
                }}
              </q-badge>
            </q-tab>
            <q-tab icon="task_alt" name="concluidas" label="Concluidas" />
            <q-tab icon="cancel" name="canceladas" label="Canceladas" />
          </q-tabs>
          <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="pendientes">
              <TablaComp
                v-if="modulo == null ? false : modulo.leer"
                :tipo="'pendientes'"
              />
            </q-tab-panel>
            <q-tab-panel name="aprobados_rf">
              <TablaComp
                v-if="modulo == null ? false : modulo.leer"
                :tipo="'aprobados_rf'"
              />
            </q-tab-panel>
            <q-tab-panel name="pagada">
              <TablaComp
                v-if="modulo == null ? false : modulo.leer"
                :tipo="'pagada'"
              />
            </q-tab-panel>
            <q-tab-panel name="pendiente_concluir">
              <TablaComp
                v-if="modulo == null ? false : modulo.leer"
                :tipo="'pendiente_concluir'"
              />
            </q-tab-panel>
            <q-tab-panel name="concluidas">
              <TablaComp
                v-if="modulo == null ? false : modulo.leer"
                :tipo="'concluidas'"
              />
            </q-tab-panel>
            <q-tab-panel name="canceladas">
              <TablaComp
                v-if="modulo == null ? false : modulo.leer"
                :tipo="'canceladas'"
              />
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>
    </div>
    <ModalComp />
    <ModalPago />
    <ModalReintegro />
    <ModalFacturas />
  </q-page>
</template>

<script setup>
import { onBeforeMount, ref, watchEffect } from "vue";
import { useQuasar, QSpinnerFacebook } from "quasar";
import { useAuthStore } from "../../../stores/auth-store";
import { useSolicitudesRFStore } from "src/stores/solicitudes-rf-store";
import { storeToRefs } from "pinia";
import { useConfiguracionStore } from "src/stores/configuracion-store";
import TablaComp from "../components/TablaComp.vue";
import ModalComp from "../components/ModalComp.vue";
import ModalPago from "../components/ModalPago.vue";
import ModalReintegro from "../components/ModalReintegro.vue";
import ModalFacturas from "../components/ModalFacturas.vue";

//-----------------------------------------------------------

const $q = useQuasar();
const solicitudesRFStore = useSolicitudesRFStore();
const authStore = useAuthStore();
const configuracionStore = useConfiguracionStore();
const { modulo } = storeToRefs(authStore);
const { list_Areas } = storeToRefs(configuracionStore);
const {
  list_Solicitudes_RF,
  list_Solictudes_Aprobadas_RF,
  list_Solicitudes_RF_Filtro,
  list_Solictudes_Aprobadas_RF_Filtro,
} = storeToRefs(solicitudesRFStore);
const tab = ref("pendientes");
const siglas = "SOLIC-RF";
const area_Id = ref({ value: 0, label: "Todos" });
const today = new Date();
const año = ref(today.getFullYear());
const years = ref(["Todos", 2023, 2024]);
const list_Areas_Filtro = ref([]);

//-----------------------------------------------------------

onBeforeMount(() => {
  leerPermisos();
  cargarData();
});

//-----------------------------------------------------------

const cargarData = async () => {
  await configuracionStore.load_Areas();
  let list = list_Areas.value;
  list.splice(0, 0, {
    value: 0,
    label: "Todos",
  });
  list_Areas_Filtro.value = list;
};

const leerPermisos = async () => {
  $q.loading.show({
    spinner: QSpinnerFacebook,
    spinnerColor: "purple-ieen",
    spinnerSize: 140,
    backgroundColor: "purple-3",
    message: "Espere un momento, por favor...",
    messageColor: "black",
  });
  await authStore.loadModulo(siglas);
  $q.loading.hide();
};

const filtrarPendientes = (list_Pendientes, filtro) => {
  list_Solicitudes_RF_Filtro.value = list_Pendientes.filter((item) => {
    let cumple = true;
    if (filtro.año !== undefined) {
      let añoSolicitud = parseInt(item.fecha_Registro.split("-")[0]);
      if (filtro.año == "Todos") {
        cumple = cumple && añoSolicitud === añoSolicitud;
      } else {
        cumple = cumple && añoSolicitud === filtro.año;
      }
    }
    if (filtro.area !== undefined) {
      if (filtro.area == 0) {
        cumple = cumple && item.area_Id === item.area_Id;
      } else {
        cumple = cumple && item.area_Id === filtro.area;
      }
    }
    return cumple;
  });
};

const filtrarAprobadas = (list_Aprobadas, filtro) => {
  list_Solictudes_Aprobadas_RF_Filtro.value = list_Aprobadas.filter((item) => {
    let cumple = true;
    if (filtro.año !== undefined) {
      let añoSolicitud = parseInt(item.fecha_Registro.split("-")[0]);
      if (filtro.año == "Todos") {
        cumple = cumple && añoSolicitud === añoSolicitud;
      } else {
        cumple = cumple && añoSolicitud === filtro.año;
      }
    }
    if (filtro.area !== undefined) {
      if (filtro.area == 0) {
        cumple = cumple && item.area_Id === item.area_Id;
      } else {
        cumple = cumple && item.area_Id === filtro.area;
      }
    }
    return cumple;
  });
};

watchEffect(() => {
  const filtro = {};
  if (año.value != null) filtro.año = año.value;
  if (area_Id.value != null) filtro.area = parseInt(area_Id.value.value);
  filtrarPendientes(list_Solicitudes_RF.value, filtro);
  filtrarAprobadas(list_Solictudes_Aprobadas_RF.value, filtro);
});
</script>
