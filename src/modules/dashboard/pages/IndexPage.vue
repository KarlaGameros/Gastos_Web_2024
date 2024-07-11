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
    <div class="row q-pa-md items-left">
      <div class="q-pl-sm q-pr-sm">
        <q-input
          label="Buscar por año"
          filled
          dense
          v-model.number="year"
          type="number"
          style="max-width: 200px"
        />
      </div>
      <q-btn
        class="q-mr-sm"
        type="button"
        color="purple-ieen"
        icon-right="search"
        label="Buscar"
        @click="cargarDashboard()"
      />
      <q-btn
        class="q-mr-sm"
        type="button"
        color="purple-ieen"
        icon-right="filter_alt"
        label="Filtro"
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
      <TablaFiltro />
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
import { onBeforeMount, ref } from "vue";
import TarjetasGeneral from "../components/TarjetasGeneral.vue";
import TarjetasDetalle from "../components/TarjetasDetalle.vue";
import DashboardComp from "src/helpers/DashboardComp.vue";
import TablaFiltro from "../components/TablaFiltro.vue";
import GenerarReporteFiltro from "src/helpers/GeneraReporteFiltro";
import ModalFiltroTablaComp from "../components/ModalFiltroTablaComp.vue";
import ModalComprobarComp from "src/modules/solicitudes_Recursos_Financieros/components/ModalComprobarComp.vue";
import ModalFacturas from "src/modules/mis_Solicitudes/components/ModalFacturas.vue";
import ModalReintegro from "src/modules/solicitudes_Recursos_Financieros/components/ModalReintegro.vue";

//-----------------------------------------------------------

const $q = useQuasar();
const dasboardStore = useDashboardStore();
const { solicitudes_filtro, textoFecha, yearFiltro } =
  storeToRefs(dasboardStore);
const tab = ref("general");
const hoy = new Date();
const year = ref(hoy.getFullYear());

//-----------------------------------------------------------

onBeforeMount(() => {
  cargarDashboard();
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
  yearFiltro.value = year.value;
  await dasboardStore.loadDashboard(year.value);
  await dasboardStore.load_solicitudes(year.value);
  await dasboardStore.load_areas_opt();
  await dasboardStore.load_solicitudes(year.value);
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
    total_erogado += element.monto_Asignado.replace("$", "") * 1;
    total_utilizado += element.monto_Utilizado.replace("$", "") * 1;
    total_reintegro += element.monto_Reintegro.replace("$", "") * 1;
    total_saldo += element.saldo.replace("$", "") * 1;
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
      element.monto_Asignado,
      element.monto_Utilizado,
      element.monto_Reintegro,
      element.saldo,
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
        content: `$${total_erogado}`,
        colSpan: 1,
        styles: { halign: "right" },
      },
      {
        content: `$${total_utilizado}`,
        colSpan: 1,
        styles: { halign: "right" },
      },
      {
        content: `$${total_reintegro}`,
        colSpan: 1,
        styles: { halign: "right" },
      },
      {
        content: `$${total_saldo}`,
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
</script>
