<template>
  <q-page>
    <div class="row bg-grey-2">
      <div class="col-9">
        <div class="q-pa-md q-gutter-sm">
          <div class="text-gray-ieen-1 text-h6">Solicitudes del área</div>
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
    <div class="row q-pa-lg">
      <div class="col-lg-3 col-md-6 col-sm-12 col-xs-12 q-pl-md">
        <b>Buscar por: </b>
        <q-btn-toggle
          v-model="buscar_Por"
          style="border: 1px solid #673e84"
          no-caps
          unelevated
          toggle-color="purple-ieen"
          color="white"
          text-color="purple-ieen"
          :options="[
            { label: 'Año', value: 'año' },
            { label: 'Rango de fecha', value: 'rango' },
          ]"
        />
      </div>
      <div class="col-lg-3 col-md-6 col-sm-12 col-xs-12">
        <q-input
          v-if="buscar_Por == 'año'"
          label="Buscar por año"
          filled
          dense
          v-model.number="year"
          type="number"
          color="purple-ieen"
        />
        <q-input
          v-else
          dense
          color="purple-ieen"
          filled
          v-model="textoFecha"
          label="Fecha de consulta"
        >
          <template v-slot:append>
            <q-btn icon="event" color="purple-ieen" flat round>
              <q-popup-proxy
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date
                  :options="options"
                  v-model="rango_Fecha"
                  :locale="myLocale"
                  mask="YYYY-MM-DD"
                  color="purple-ieen"
                  range
                >
                  <div class="row items-center justify-end q-gutter-sm">
                    <q-btn
                      label="Aceptar"
                      color="purple-ieen"
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
      <div class="col-lg-3 col-md-6 col-sm-12 col-xs-12">
        <q-btn
          type="button"
          color="purple-ieen"
          icon-right="search"
          label="Buscar"
          @click="buscar"
        />
      </div>
    </div>
    <div v-if="gastos_Filtrado.length > 0" class="row q-ma-lg">
      <q-card
        class="my-card col-lg-6 col-md-6 col-sm-6 col-xs-12 bg-purple-1"
        style="border-radius: 10px"
      >
        <!-- <q-item>
          <q-item-section class="bg-purple-1">
            <q-item-label class="purple-ieen text-bold text-purple-ieen">
              {{ gastos_Filtrado[0].area_Nombre }}
            </q-item-label>
            <q-item-label>
              Solicitudes:
              {{ gastos_Filtrado[0].no_Solicitudes }}
            </q-item-label>
            <q-item-label>
              Monto erogado: ${{ gastos_Filtrado[0].monto_Erogado }}
            </q-item-label>
            <q-item-label>
              Monto ejercido: ${{ gastos_Filtrado[0].monto_Utilizado }}
            </q-item-label>
            <q-item-label>
              Monto Reintegrado: ${{ gastos_Filtrado[0].monto_Reintegrado }}
            </q-item-label>
            <q-item-label>
              Saldo ${{ gastos_Filtrado[0].monto_Saldo }}
            </q-item-label>
          </q-item-section>
        </q-item> -->
        <q-item-label
          class="text-h6 q-pl-sm q-pt-sm purple-ieen text-bold text-purple-ieen"
        >
          {{ gastos_Filtrado[0].area_Nombre }}</q-item-label
        ><br />
        <q-card-section horizontal>
          <q-list dense>
            <q-item>
              <q-item-section>
                Solicitudes:
                {{ gastos_Filtrado[0].no_Solicitudes }}</q-item-section
              >
            </q-item>
            <q-item>
              <q-item-section>
                Monto erogado: ${{ gastos_Filtrado[0].monto_Erogado }}
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                Monto ejercido: ${{ gastos_Filtrado[0].monto_Utilizado }}
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                Monto Reintegrado: ${{ gastos_Filtrado[0].monto_Reintegrado }}
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                Saldo ${{ gastos_Filtrado[0].monto_Saldo }}
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
      <q-card
        class="my-card col-lg-6 col-md-6 col-sm-6 col-xs-12 bg-purple-1"
        style="border-radius: 10px"
      >
        <q-item-label
          class="text-h6 q-pl-sm q-pt-sm purple-ieen text-bold text-purple-ieen"
        >
          Detalle monto ejercido</q-item-label
        ><br />
        <q-card-section horizontal>
          <q-list dense>
            <q-item
              v-for="gasto in gastos_Filtrado[0].gastos.slice(
                0,
                gastos_Filtrado[0].gastos.length / 2
              )"
              :key="gasto"
            >
              <q-item-section
                >{{ gasto.concepto }}: ${{ gasto.importe }}</q-item-section
              >
            </q-item>
          </q-list>
          <q-list dense>
            <q-item
              v-for="gasto in gastos_Filtrado[0].gastos.slice(
                5,
                gastos_Filtrado[0].gastos.length
              )"
              :key="gasto"
            >
              <q-item-section
                >{{ gasto.concepto }}: ${{ gasto.importe }}</q-item-section
              >
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
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
                {{ list_Solicitudes_ByArea.length }}
              </q-badge>
            </q-tab>
            <q-tab icon="manage_search" name="historial" label="Historial" />
          </q-tabs>
          <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="pendientes">
              <TablaComp
                v-if="modulo == null ? false : modulo.leer"
                :tipo="'pendientes'"
              />
            </q-tab-panel>
            <q-tab-panel name="historial">
              <TablaComp
                v-if="modulo == null ? false : modulo.leer"
                :tipo="'historial'"
              />
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>
    </div>
    <ModalComp />
  </q-page>
</template>

<script setup>
import { onBeforeMount, ref, watch } from "vue";
import { useQuasar, QSpinnerFacebook } from "quasar";
import { storeToRefs } from "pinia";
import { useAuthStore } from "../../../stores/auth-store";
import { useSolicitudesAreaStore } from "src/stores/solicitudes-area-store";
import { useDashboardStore } from "src/stores/dashboard-store";
import TablaComp from "../components/TablaComp.vue";
import ModalComp from "src/modules/mis_Solicitudes/components/ModalComp.vue";

//-----------------------------------------------------------

const $q = useQuasar();
const solicitudesAreaStore = useSolicitudesAreaStore();
const authStore = useAuthStore();
const dashboardStore = useDashboardStore();
const { modulo } = storeToRefs(authStore);
const { list_Solicitudes_ByArea, list_Historial, list_Historial_Filtro } =
  storeToRefs(solicitudesAreaStore);
const { areas_Gastos } = storeToRefs(dashboardStore);
const tab = ref("pendientes");
const siglas = "SOLIC-AREA";
const hoy = new Date();
const year = ref(hoy.getFullYear());
const gastos_Filtrado = ref([]);
const buscar_Por = ref("año");
const rango_Fecha = ref(null);
const textoFecha = ref(null);
const myLocale = {
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
};

//-----------------------------------------------------------

onBeforeMount(() => {
  leerPermisos();
  cargarData();
});

watch(rango_Fecha, (val) => {
  if (val != null) {
    if (typeof val != "string") {
      let { from, to } = val;
      textoFecha.value = "del " + from + " hasta " + to;
    } else {
      textoFecha.value = val;
    }
  }
});

//-----------------------------------------------------------

const cargarData = async () => {
  await solicitudesAreaStore.load_Solicitudes_Area();
  await solicitudesAreaStore.load_Historial();
  await dashboardStore.loadDashboard(
    `${year.value}-01-01`,
    `${year.value}-12-31`
  );
  gastos_Filtrado.value = areas_Gastos.value.filter(
    (x) => x.area_Id == list_Historial.value[0].area_Id
  );
  const fecha_Inicio = new Date(`${year.value}-01-01`);
  const fecha_Fin = new Date(`${year.value}-12-31`);
  list_Historial_Filtro.value = list_Historial.value.filter((element) => {
    const inicio = Date.parse(element.fecha_Salida);
    const fin = Date.parse(element.fecha_LLegada);
    return inicio >= fecha_Inicio && fin <= fecha_Fin;
  });
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

const buscar = async () => {
  $q.loading.show({
    spinner: QSpinnerFacebook,
    spinnerColor: "purple-ieen",
    spinnerSize: 140,
    backgroundColor: "purple-3",
    message: "Espere un momento, por favor...",
    messageColor: "black",
  });
  if (buscar_Por.value == "año") {
    await dashboardStore.loadDashboard(
      `${year.value}-01-01`,
      `${year.value}-12-31`
    );
    gastos_Filtrado.value = areas_Gastos.value.filter(
      (x) => x.area_Id == list_Historial.value[0].area_Id
    );
    const fecha_Inicio = new Date(`${year.value}-01-01`);
    const fecha_Fin = new Date(`${year.value}-12-31`);
    list_Historial_Filtro.value = list_Historial.value.filter((element) => {
      const inicio = Date.parse(element.fecha_Salida);
      const fin = Date.parse(element.fecha_LLegada);
      return inicio >= fecha_Inicio && fin <= fecha_Fin;
    });
  } else {
    if (rango_Fecha.value == null || rango_Fecha.value == undefined) {
      Swal.fire({
        title: "Atención",
        text: "No seleccionó rango de fecha",
        icon: "warning",
        showConfirmButton: false,
        timer: 1500,
      });
    } else {
      await dashboardStore.loadDashboard(
        rango_Fecha.value.from,
        rango_Fecha.value.to
      );
      gastos_Filtrado.value = areas_Gastos.value.filter(
        (x) => x.area_Id == list_Historial.value[0].area_Id
      );
      const fecha_Inicio = new Date(rango_Fecha.value.from);
      const fecha_Fin = new Date(rango_Fecha.value.to);
      list_Historial_Filtro.value = list_Historial.value.filter((element) => {
        const inicio = Date.parse(element.fecha_Salida);
        const fin = Date.parse(element.fecha_LLegada);
        return inicio >= fecha_Inicio && fin <= fecha_Fin;
      });
    }
  }
  $q.loading.hide();
};

const options = (date) => {
  const dateActual = new Date();
  const year = dateActual.getFullYear();
  const month = String(dateActual.getMonth() + 1).padStart(2, "0");
  const day = String(dateActual.getDate()).padStart(2, "0");
  const dateA = `${year}/${month}/${day}`;
  return date <= dateA;
};
</script>
