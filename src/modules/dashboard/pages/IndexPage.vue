<template>
  <q-page>
    <div class="row bg-grey-2">
      <div class="col-9">
        <div class="q-pa-md q-gutter-sm">
          <div class="text-gray-ieen-1 text-h6">Dashboard</div>
          <q-breadcrumbs>
            <template v-slot:separator>
              <q-icon size="1.5em" name="chevron_right" color="primary" />
            </template>
            <q-breadcrumbs-el icon="home" label="Inicio" to="/" />
            <q-breadcrumbs-el class="text-grey-7" label="Dashboard" />
          </q-breadcrumbs>
        </div>
      </div>
    </div>
    <div class="row q-pa-md">
      <div class="col-lg-3 col-md-6 col-sm-12 col-xs-12 q-pa-sm">
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
      <div class="col-lg-3 col-md-6 col-sm-12 col-xs-12 q-pa-sm">
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
                  v-model="fecha"
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
      <div
        v-if="!$q.screen.xs"
        class="col-lg-6 col-md-12 col-sm-12 col-xs-12 q-pa-sm text-center"
      >
        <q-btn
          class="q-mr-sm"
          type="button"
          color="purple-ieen"
          icon-right="search"
          label="Buscar"
          @click="cargarDashboard"
        />
        <q-btn
          class="q-mr-sm"
          type="button"
          color="purple-ieen"
          icon-right="filter_alt"
          label="Filtrar por área"
          @click="actualizarModal"
        />
        <q-btn
          v-if="solicitudes_filtro.length > 0"
          class="q-mr-sm"
          label="Generar PDF"
          type="button"
          color="purple-ieen"
          icon-right="picture_as_pdf"
          @click="generar_pdf"
        />
      </div>
      <div v-else class="col-12 text-center">
        <q-btn
          class="q-ma-sm"
          type="button"
          color="purple-ieen"
          icon-right="search"
          @click="cargarDashboard"
        >
          <q-tooltip>Buscar</q-tooltip>
        </q-btn>
        <q-btn
          class="q-ma-sm"
          type="button"
          color="purple-ieen"
          icon-right="filter_alt"
          @click="actualizarModal"
        >
          <q-tooltip>Filtrar por área</q-tooltip>
        </q-btn>
        <q-btn
          v-if="solicitudes_filtro.length > 0"
          class="q-ma-sm"
          type="button"
          color="purple-ieen"
          icon-right="picture_as_pdf"
          @click="generar_pdf"
        >
          <q-tooltip>Generar PDF</q-tooltip>
        </q-btn>
      </div>
    </div>
    <div class="row q-pa-lg">
      <q-card class="col-12">
        <q-tabs
          v-model="tab"
          active-color="purple-ieen"
          indicator-color="purple-ieen"
          align="justify"
          class="bg-grey-4 text-purple-ieen shadow-2 text-bold"
          inline-label
        >
          <q-tab name="general" icon="account_tree" label="Generales" />
          <q-tab name="detalle" icon="manage_history" label="Detalle" />
        </q-tabs>
        <q-tab-panels v-model="tab" animated class="text-dark text-center">
          <q-tab-panel name="general">
            <div class="row">
              <TarjetasGeneral />
            </div>
          </q-tab-panel>
          <q-tab-panel name="detalle">
            <div class="row">
              <TarjetasDetalle />
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
    <div class="col-12 q-pa-lg">
      <TablaFiltro :buscar_Por="buscar_Por" />
    </div>
    <div class="row q-pa-lg">
      <q-card class="col-12 q-pa-sm">
        <div class="text-h5 text-bold text-purple-ieen">
          Solicitudes del año: {{ year }}
        </div>
        <DashboardComp />
      </q-card>
    </div>
    <ModalFiltroTablaComp />
    <ModalComprobarComp />
    <ModalFacturas />
    <ModalReintegro />
  </q-page>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { useQuasar, QSpinnerFacebook } from "quasar";
import { useDashboardStore } from "src/stores/dashboard-store";
import { onBeforeMount, ref, watch } from "vue";
import TarjetasGeneral from "../components/TarjetasGeneral.vue";
import TarjetasDetalle from "../components/TarjetasDetalle.vue";
import DashboardComp from "src/helpers/DashboardComp.vue";
import TablaFiltro from "../components/TablaFiltro.vue";
import GenerarReporteFiltro from "src/helpers/GeneraReporteFiltro";
import ModalFiltroTablaComp from "../components/ModalFiltroTablaComp.vue";
import ModalComprobarComp from "src/modules/solicitudes_Recursos_Financieros/components/ModalComprobarComp.vue";
import ModalFacturas from "src/modules/mis_Solicitudes/components/ModalFacturas.vue";
import ModalReintegro from "src/modules/solicitudes_Recursos_Financieros/components/ModalReintegro.vue";
import Swal from "sweetalert2";

//-----------------------------------------------------------

const $q = useQuasar();
const dasboardStore = useDashboardStore();
const {
  solicitudes_filtro,
  textoFecha,
  yearFiltro,
  myLocale,
  fecha,
  areasTodos,
  areas_Gastos,
} = storeToRefs(dasboardStore);
const tab = ref("general");
const hoy = new Date();
const year = ref(hoy.getFullYear());
const buscar_Por = ref("año");

//-----------------------------------------------------------

onBeforeMount(() => {
  cargarDashboard();
});

//-----------------------------------------------------------

watch(fecha, (val) => {
  if (val != null) {
    if (typeof val != "string") {
      let { from, to } = val;
      textoFecha.value = "del " + from + " hasta " + to;
    } else {
      textoFecha.value = val;
    }
  }
});

watch(buscar_Por, (val) => {
  if (val != null) {
    fecha.value = null;
    textoFecha.value = null;
  }
});

//-----------------------------------------------------------

const cargarDashboard = async () => {
  $q.loading.show({
    spinner: QSpinnerFacebook,
    spinnerColor: "purple-ieen",
    spinnerSize: 140,
    backgroundColor: "purple-3",
    message: "Espere un momento, por favor...",
    messageColor: "black",
  });
  if (buscar_Por.value == "año") {
    areasTodos.value = true;
    yearFiltro.value = year.value;
    await dasboardStore.loadDashboard(
      `${year.value}-01-01`,
      `${year.value}-12-31`
    );
    await dasboardStore.load_solicitudes(year.value);
    areas_Gastos.value.forEach((element) => {
      element.activo = true;
    });
  } else {
    if (fecha.value == null || fecha.value == undefined) {
      Swal.fire({
        title: "Atención",
        text: "No seleccionó rango de fecha",
        icon: "warning",
        showConfirmButton: false,
        timer: 1500,
      });
    } else {
      await dasboardStore.loadDashboard(fecha.value.from, fecha.value.to);
      await dasboardStore.load_solicitudes(fecha.value.from.split("-")[0]);
      const fecha_Inicio = new Date(fecha.value.from);
      const fecha_Fin = new Date(fecha.value.to);
      solicitudes_filtro.value = solicitudes_filtro.value.filter((element) => {
        const inicio = Date.parse(element.fecha_Salida);
        const fin = Date.parse(element.fecha_LLegada);
        return inicio >= fecha_Inicio && fin <= fecha_Fin;
      });
    }
    areas_Gastos.value.forEach((element) => {
      element.activo = true;
    });
  }
  $q.loading.hide();
};

const actualizarModal = () => {
  dasboardStore.actualizar_modal_filtro(true);
};

const generar_pdf = () => {
  if (solicitudes_filtro.value.length == 0) {
    $q.notify({
      type: "warning",
      message: "No hay datos por procesar",
    });
    return;
  }
  let total_erogado = 0;
  let total_utilizado = 0;
  let total_reintegro = 0;
  let total_saldo = 0;
  for (let element of solicitudes_filtro.value) {
    total_erogado += element.monto_Asignado;
    total_utilizado += element.monto_Utilizado;
    total_reintegro += element.monto_Reintegro;
    total_saldo += element.saldo;
  }
  const body = [
    ...solicitudes_filtro.value.map((element, index) => [
      index + 1,
      element.folio,
      element.estatus,
      element.area,
      element.empleado_Solicitante,
      element.fecha_Salida,
      element.fecha_LLegada,
      `$${element.monto_Asignado}`,
      `$${element.monto_Utilizado}`,
      `$${element.monto_Reintegro}`,
      `$${element.saldo}`,
    ]),
    [
      {
        content: "",
        colSpan: 1,
        styles: { halign: "right" },
      },
      {
        content: "",
        colSpan: 1,
        styles: { halign: "right" },
      },
      {
        content: "",
        colSpan: 1,
        styles: { halign: "right" },
      },
      {
        content: "",
        colSpan: 1,
        styles: { halign: "right" },
      },
      {
        content: "",
        colSpan: 1,
        styles: { halign: "right" },
      },
      {
        content: "",
        colSpan: 1,
        styles: { halign: "right" },
      },
      {
        content: "Totales",
        colSpan: 1,
        styles: { halign: "right" },
      },
      {
        content: `$${total_erogado.toFixed(2)}`,
        colSpan: 1,
        styles: { halign: "right" },
      },
      {
        content: `$${total_utilizado.toFixed(2)}`,
        colSpan: 1,
        styles: { halign: "right" },
      },
      {
        content: `$${total_reintegro.toFixed(2)}`,
        colSpan: 1,
        styles: { halign: "right" },
      },
      {
        content: `$${total_saldo.toFixed(2)}`,
        colSpan: 1,
        styles: { halign: "right" },
      },
    ],
  ];
  GenerarReporteFiltro(
    body,
    textoFecha.value == ""
      ? `Reporte de solicitudes del ejercicio ${year.value}`
      : textoFecha.value.includes("hasta") == true
      ? `Reporte de solicitudes que comprenden ${textoFecha.value}`
      : `Reporte de solicitudes del día ${textoFecha.value}`
  );
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
