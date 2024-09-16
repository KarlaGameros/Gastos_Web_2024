<template>
  <q-table
    :rows="
      props.tipo == 'pendientes'
        ? list_Solicitudes_RF_Filtro
        : props.tipo == 'aprobados_rf'
        ? list_Solictudes_Aprobadas_RF_Filtro.filter(
            (x) =>
              x.pagado == false &&
              x.estatus != 'Cancelado' &&
              x.saldo_Cero != true
          )
        : props.tipo == 'pagada'
        ? list_Solictudes_Aprobadas_RF_Filtro.filter(
            (x) =>
              x.estatus == 'Pagada' ||
              (x.saldo_Cero == true &&
                (x.estatus == 'Impreso' ||
                  x.estatus == 'Aprobado por recursos financieros'))
          )
        : props.tipo == 'pendiente_concluir'
        ? list_Solictudes_Aprobadas_RF_Filtro.filter(
            (x) =>
              x.estatus != 'Concluido' &&
              x.estatus != 'Cancelado' &&
              x.estatus != 'Pagada' &&
              x.estatus != 'Pendiente' &&
              (x.pagado == true ||
                x.fecha_Pago != 'Sin registro' ||
                x.saldo_Cero == true)
          )
        : props.tipo == 'concluidas'
        ? list_Solictudes_Aprobadas_RF_Filtro.filter(
            (x) => x.estatus == 'Concluido' && x.pagado == true
          )
        : list_Solictudes_Aprobadas_RF_Filtro.filter(
            (x) => x.estatus == 'Cancelado'
          )
    "
    :columns="columns"
    :filter="filter"
    :loading="is_loading"
    :pagination="pagination"
    :rows-per-page-options="[5, 15, 20, 25, 50]"
    row-key="id"
    rows-per-page-label="Filas por pagina"
    no-data-label="No hay registros"
    class="my-sticky-last-column-table"
    :visible-columns="visible_columns"
  >
    <template v-slot:top-right>
      <q-input
        outlined
        class="q-pr-sm"
        borderless
        dense
        debounce="300"
        v-model="filter"
        placeholder="Buscar..."
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
      <q-btn
        color="purple-ieen"
        icon-right="archive"
        label="Exportar a Excel"
        no-caps
        @click="exportTable"
      />
    </template>
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td v-for="col in props.cols" :key="col.name" :props="props">
          <div v-if="col.name == 'color'">
            <q-badge :color="col.value" :label="col.value" />
          </div>
          <div v-else-if="col.name == 'ver_mas'">
            <q-btn
              size="sm"
              color="purple-ieen"
              round
              dense
              @click="props.expand = !props.expand"
              :icon="props.expand ? 'remove' : 'add'"
              class="absolute-center"
            />
          </div>
          <div v-if="col.name === 'id'">
            <q-btn
              v-if="
                modulo.actualizar &&
                props.row.estatus == 'Aprobado por jefe de area'
              "
              flat
              round
              color="purple-ieen"
              icon="search"
              @click="verSolicitud(col.value, tipo)"
            >
              <q-tooltip>Ver registro</q-tooltip>
            </q-btn>
            <q-btn
              v-else
              flat
              round
              color="purple-ieen"
              icon="search"
              @click="verSolicitudComprobacion(col.value)"
            >
              <q-tooltip>Ver registro</q-tooltip>
            </q-btn>
            <q-btn
              v-if="
                modulo.actualizar &&
                tipo == 'aprobados_rf' &&
                props.row.pagado == false
              "
              flat
              round
              color="purple-ieen"
              icon="paid"
              @click="pagar(col.value)"
            >
              <q-tooltip>Pagar</q-tooltip>
            </q-btn>
            <q-btn
              v-if="modulo.actualizar && props.row.e_Reintegro == true"
              flat
              round
              color="purple-ieen"
              icon="price_check"
              @click="ver_reintegro(col.value)"
            >
              <q-tooltip>Ver reintegro</q-tooltip>
            </q-btn>
            <q-btn
              v-if="
                tipo == 'pendiente_concluir' &&
                ((props.row.monto_Asignado != '$0.00' &&
                  props.row.e_Comprobacion_Gasto == true &&
                  props.row.e_Evidencias == true &&
                  props.row.e_Informe_Actividades == true &&
                  props.row.e_Reintegro == true) ||
                  (props.row.monto_Asignado == '$0.00' &&
                    props.row.e_Evidencias == true &&
                    props.row.e_Informe_Actividades == true) ||
                  (props.row.monto_Asignado == props.row.monto_Reintegro &&
                    props.row.monto_Saldo == '$0.00'))
              "
              flat
              round
              color="purple-ieen"
              icon="fact_check"
              @click="concluir(col.value)"
            >
              <q-tooltip>Concluir </q-tooltip>
            </q-btn>
            <q-btn
              v-if="tipo == 'pendiente_concluir' || tipo == 'concluidas'"
              flat
              round
              color="purple-ieen"
              icon="print"
              @click="generarOficio(col.value)"
            >
              <q-tooltip>Descargar oficio</q-tooltip>
            </q-btn>
          </div>
          <div v-else-if="col.name === 'folio'">
            <label class="text-bold">{{ col.value }}</label>
          </div>
          <div v-else-if="col.name === 'fecha_Pago'">
            <label class="text-bold">{{ col.value }}</label>
          </div>
          <div v-else-if="col.name === 'estatus'">
            <q-badge
              :color="
                col.value == 'Pendiente' ||
                col.value == 'Recibido sin firmas' ||
                col.value == 'Pendiente de conclusión'
                  ? 'orange'
                  : col.value == 'Cancelado' ||
                    col.value == 'Rechazado por jefe de area'
                  ? 'red'
                  : 'green'
              "
            >
              {{ col.value }}
              <q-icon
                :name="
                  col.value == 'Pendiente' ||
                  col.value == 'Recibido sin firmas' ||
                  col.value == 'Pendiente de conclusión'
                    ? 'warning'
                    : col.value == 'Cancelado' ||
                      col.value == 'Rechazado por jefe de area'
                    ? 'close'
                    : 'done'
                "
                color="white"
                class="q-ml-xs"
              />
            </q-badge>
          </div>
          <div v-else-if="col.name === 'dias_Comprobar'">
            <q-badge
              v-if="
                (props.row.monto_Asignado != '$0.00' &&
                  props.row.monto_Utilizado != props.row.monto_Asignado &&
                  (props.row.e_Comprobacion_Gasto == false ||
                    props.row.e_Evidencias == false ||
                    props.row.e_Informe_Actividades == false ||
                    props.row.e_Reintegro == false)) ||
                (props.row.monto_Asignado == '$0.00' &&
                  (props.row.e_Evidencias == false ||
                    props.row.e_Informe_Actividades == false))
              "
              :color="col.value == 0 || col.value < 0 ? 'red' : 'purple-ieen'"
            >
              {{ col.value }}
              {{
                col.value == "Comisión por realizar" ||
                col.value == "Comisión en proceso"
                  ? ""
                  : col.value == 1
                  ? "día"
                  : "días"
              }}
              <q-icon
                v-if="
                  col.value != 'Comisión por realizar' &&
                  col.value != 'Comisión en proceso'
                "
                :name="col.value == 0 || col.value < 0 ? 'block' : 'timer'"
              />
            </q-badge>
          </div>
          <label v-else-if="col.name == 'destino'">
            <label>{{ props.row.destino_Corto }}</label>
            <q-tooltip
              :offset="[10, 10]"
              v-if="props.row.destino_Corto.length != col.value.length"
            >
              {{ col.value }}
            </q-tooltip>
          </label>
          <label v-else>{{ col.value }}</label>
        </q-td>
      </q-tr>
      <q-tr v-show="props.expand" :props="props">
        <q-td colspan="100%">
          <div class="text-left q-pa-xs">
            <b>Pernoctado:</b>
            <q-icon
              size="xs"
              :color="props.row.pernoctado ? 'green' : 'red'"
              :name="props.row.pernoctado ? 'check_circle' : 'cancel'"
            />
          </div>
          <div class="text-left q-pa-xs">
            <b>Destino:</b>
            {{ props.row.destino }}
          </div>
          <div class="text-left q-pa-xs">
            <b>Responsable de área:</b>
            {{ props.row.responsable_Area }}
          </div>
          <div class="text-left q-pa-xs">
            <b>Fecha de pago:</b>
            {{ props.row.fecha_Pago }}
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
  <ModalComprobarComp :tipo="props.tipo" />
</template>
<script setup>
import { storeToRefs } from "pinia";
import { useQuasar, QSpinnerFacebook, exportFile } from "quasar";
import { onBeforeMount, ref } from "vue";
import { useSolicitudesRFStore } from "src/stores/solicitudes-rf-store";
import { useDistribucionStore } from "src/stores/distribuciones-store";
import { useMisSolicitudesStore } from "src/stores/mis-solicitudes-store";
import { useReintegroStore } from "src/stores/reintegro-store";
import { useComprobarStore } from "src/stores/comprobar-store";
import { useAuthStore } from "src/stores/auth-store";
import ModalComprobarComp from "../components/ModalComprobarComp.vue";
import Swal from "sweetalert2";
import OficioGasto from "src/helpers/OficioGasto";

//-----------------------------------------------------------

const $q = useQuasar();
const misSolicitudesStore = useMisSolicitudesStore();
const solicitudesRFStore = useSolicitudesRFStore();
const distribucionStore = useDistribucionStore();
const comprobacionStore = useComprobarStore();
const reintegroStore = useReintegroStore();
const authStore = useAuthStore();
const { modulo } = storeToRefs(authStore);
const {
  is_loading,
  list_Solicitudes_RF,
  list_Solicitudes_RF_Filtro,
  list_Solictudes_Aprobadas_RF,
  list_Solictudes_Aprobadas_RF_Filtro,
} = storeToRefs(solicitudesRFStore);
const { solicitud } = storeToRefs(misSolicitudesStore);
const props = defineProps({
  tipo: {
    type: String,
  },
});
const visible_columns = ref([]);

//-----------------------------------------------------------

onBeforeMount(() => {
  cargarData();
});

//-----------------------------------------------------------

const cargarData = async () => {
  $q.loading.show({
    spinner: QSpinnerFacebook,
    spinnerColor: "purple-ieen",
    spinnerSize: 140,
    backgroundColor: "purple-3",
    message: "Espere un momento, por favor...",
    messageColor: "black",
  });
  await solicitudesRFStore.load_Solicitudes_RF();
  await solicitudesRFStore.load_solicitudes_rec_financieros_aprobadas();
  if (props.tipo == "pendiente_concluir" || props.tipo == "pagada") {
    visible_columns.value = [
      "ver_mas",
      "estatus",
      "folio",
      "empleado_Solicitante",
      "dias_Comprobar",
      "fecha_Salida",
      "fecha_LLegada",
      "monto_Asignado",
      "destino",
      "id",
    ];
  } else {
    visible_columns.value = [
      "ver_mas",
      "estatus",
      "folio",
      "empleado_Solicitante",
      "fecha_Pago",
      "fecha_Salida",
      "fecha_LLegada",
      "monto_Asignado",
      "destino",
      "id",
    ];
  }
  $q.loading.hide();
};

const verSolicitud = async (id, tipo) => {
  $q.loading.show({
    spinner: QSpinnerFacebook,
    spinnerColor: "purple-ieen",
    spinnerSize: 140,
    backgroundColor: "purple-3",
    message: "Espere un momento, por favor...",
    messageColor: "black",
  });
  if (tipo == "aprobados_rf") {
    solicitudesRFStore.actualizarVisualizar(true);
  }
  await solicitudesRFStore.load_Solicitud_Id_RF(id);
  await distribucionStore.load_Distribuciones(id);
  solicitudesRFStore.actualizarModal(true);
  misSolicitudesStore.actualizarVisualizar(true);
  $q.loading.hide();
};

const verSolicitudComprobacion = async (id) => {
  $q.loading.show({
    spinner: QSpinnerFacebook,
    spinnerColor: "purple-ieen",
    spinnerSize: 140,
    backgroundColor: "purple-3",
    message: "Espere un momento, por favor...",
    messageColor: "black",
  });
  await misSolicitudesStore.load_Solicitud(id);
  await solicitudesRFStore.load_Solicitud_Id_RF(id);
  await distribucionStore.load_Distribuciones(id);
  await comprobacionStore.load_Informe(id);
  await comprobacionStore.load_Evidencias(id);
  comprobacionStore.actualizarConcluir(true);
  comprobacionStore.actualizarModal(true);
  misSolicitudesStore.actualizarVisualizar(true);
  $q.loading.hide();
};

const pagar = async (id) => {
  $q.loading.show({
    spinner: QSpinnerFacebook,
    spinnerColor: "purple-ieen",
    spinnerSize: 140,
    backgroundColor: "purple-3",
    message: "Espere un momento, por favor...",
    messageColor: "black",
  });
  await misSolicitudesStore.load_Solicitud(id);
  await distribucionStore.load_Distribuciones(id);
  solicitudesRFStore.actualizarModalPago(true);
  distribucionStore.actualizarVisualizar(true);
  $q.loading.hide();
};

const ver_reintegro = async (id) => {
  await misSolicitudesStore.load_Solicitud(id);
  await reintegroStore.load_Reintegro(solicitud.value.id);
  reintegroStore.actualizarModal(true);
};

const concluir = async (id) => {
  await misSolicitudesStore.load_Solicitud(id);
  Swal.fire({
    title: "Conclusión de solicitud de gasto a comprobar",
    text: `¿Desea concluir la solicitud con folio ${solicitud.value.folio}?`,
    icon: "Warning",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Si, Concluir!",
    cancelButtonText: "No, Salir!",
    reverseButtons: true,
    confirmButtonColor: "#26a69a",
    cancelButtonColor: "#f44336",
  }).then(async (result) => {
    if (result.isConfirmed) {
      $q.loading.show({
        spinner: QSpinnerFacebook,
        spinnerColor: "purple-ieen",
        spinnerSize: 140,
        backgroundColor: "purple-3",
        message: "Espere un momento, por favor...",
        messageColor: "black",
      });
      const resp = await solicitudesRFStore.concluir(id);
      if (resp.success) {
        $q.loading.hide();
        cargarData();
        Swal.fire({
          title: resp.data,
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        $q.loading.hide();
        Swal.fire({
          title: resp.data,
          icon: "error",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    }
  });
};

const generarOficio = (id) => {
  OficioGasto(id);
};

function wrapCsvValue(val, formatFn, row) {
  let formatted = formatFn !== void 0 ? formatFn(val, row) : val;
  formatted =
    formatted === void 0 || formatted === null ? "" : String(formatted);
  formatted = formatted.split('"').join('""');
  return `"${formatted}"`;
}

const exportTable = () => {
  let date = new Date().toLocaleDateString();
  let list =
    props.tipo == "pendientes"
      ? list_Solicitudes_RF.value
      : props.tipo == "aprobados_rf"
      ? list_Solictudes_Aprobadas_RF.value.filter(
          (x) =>
            x.pagado == false &&
            x.estatus != "Cancelado" &&
            x.saldo_Cero != true
        )
      : props.tipo == "pagada"
      ? list_Solictudes_Aprobadas_RF.value.filter(
          (x) =>
            x.estatus == "Pagada" ||
            (x.saldo_Cero == true &&
              (x.estatus == "Impreso" ||
                x.estatus == "Aprobado por recursos financieros"))
        )
      : props.tipo == "pendiente_concluir"
      ? list_Solictudes_Aprobadas_RF.value.filter(
          (x) =>
            x.estatus != "Concluido" &&
            x.estatus != "Cancelado" &&
            x.estatus != "Pagada" &&
            x.estatus != "Pendiente" &&
            (x.pagado == true ||
              x.fecha_Pago != "Sin registro" ||
              x.saldo_Cero == true)
        )
      : props.tipo == "concluidas"
      ? list_Solictudes_Aprobadas_RF.value.filter(
          (x) => x.estatus == "Concluido" && x.pagado == true
        )
      : list_Solictudes_Aprobadas_RF.value.filter(
          (x) => x.estatus == "Cancelado"
        );
  const content = [columnsExcel.map((col) => wrapCsvValue(col.label))]
    .concat(
      list.map((row) =>
        columnsExcel
          .map((col) =>
            wrapCsvValue(
              typeof col.field === "function"
                ? col.field(row)
                : row[col.field === void 0 ? col.name : col.field],
              col.format,
              row
            )
          )
          .join(",")
      )
    )
    .join("\r\n");
  const bom = "\uFEFF";
  const status = exportFile(
    `${
      props.tipo == "pendientes"
        ? "Pendientes"
        : props.tipo == "aprobados_rf"
        ? "Aprobados_RF"
        : props.tipo == "pagada"
        ? "Pagada"
        : props.tipo == "pendiente_concluir"
        ? "Pendientes_concluir"
        : props.tipo == "concluidas"
        ? "Concluidas"
        : "Canceladas"
    }_${date}`,
    bom + content,
    "text/csv;charset=utf-8"
  );
  if (status !== true) {
    $q.notify({
      message:
        "Ocurrió un error, inténtelo de nuevo. Si el error persiste, contacte a soporte",
      color: "negative",
      icon: "warning",
    });
  }
};

//-----------------------------------------------------------

const columns = [
  {
    name: "ver_mas",
    align: "center",
    label: "Ver más",
    sortable: true,
  },
  {
    name: "estatus",
    align: "center",
    label: "Estatus",
    field: "estatus",
    sortable: true,
  },
  {
    name: "folio",
    align: "center",
    label: "Folio",
    field: "folio",
    sortable: true,
  },
  {
    name: "empleado_Solicitante",
    align: "center",
    label: "Empleado solicitante",
    field: "empleado_Solicitante",
    sortable: true,
  },
  {
    name: "dias_Comprobar",
    align: "center",
    label: "Días comprobar",
    field: "dias_Comprobar",
    sortable: true,
  },
  {
    name: "fecha_Salida",
    align: "center",
    label: "Fecha de salida",
    field: "fecha_Salida",
    sortable: true,
  },
  {
    name: "fecha_LLegada",
    align: "center",
    label: "Fecha de llegada",
    field: "fecha_LLegada",
    sortable: true,
  },
  {
    name: "monto_Asignado",
    align: "center",
    label: "Monto asignado",
    field: "monto_Asignado",
    sortable: true,
  },
  {
    name: "destino",
    align: "center",
    label: "Destino",
    field: "destino",
    sortable: true,
  },
  {
    name: "id",
    align: "center",
    label: "Acciones",
    field: "id",
    sortable: false,
  },
];

const columnsExcel = [
  {
    name: "estatus",
    align: "center",
    label: "Estatus",
    field: "estatus",
    sortable: true,
  },
  {
    name: "folio",
    align: "center",
    label: "Folio",
    field: "folio",
    sortable: true,
  },
  {
    name: "empleado_Solicitante",
    align: "center",
    label: "Empleado solicitante",
    field: "empleado_Solicitante",
    sortable: true,
  },
  {
    name: "responsable_Area",
    align: "center",
    label: "Responsable de area",
    field: "responsable_Area",
    sortable: true,
  },
  {
    name: "destino",
    align: "center",
    label: "Destino",
    field: "destino",
    sortable: true,
  },
  {
    name: "fecha_Pago",
    align: "center",
    label: "Fecha pago",
    field: "fecha_Pago",
    sortable: true,
  },
  {
    name: "fecha_Salida",
    align: "center",
    label: "Fecha de salida",
    field: "fecha_Salida",
    sortable: true,
  },
  {
    name: "fecha_LLegada",
    align: "center",
    label: "Fecha de llegada",
    field: "fecha_LLegada",
    sortable: true,
  },
  {
    name: "pernoctado_String",
    align: "center",
    label: "Pernoctado",
    field: "pernoctado_String",
    sortable: true,
  },
  {
    name: "monto_Asignado",
    align: "center",
    label: "Monto asignado",
    field: "monto_Asignado",
    sortable: true,
  },
  {
    name: "monto_Utilizado",
    align: "center",
    label: "Monto utilizado",
    field: "monto_Utilizado",
    sortable: true,
  },
  {
    name: "pagado",
    align: "center",
    label: "pagado",
    field: "pagado",
    sortable: true,
  },
  {
    name: "e_Reintegro",
    align: "center",
    label: "e_Reintegro",
    field: "e_Reintegro",
    sortable: true,
  },
  {
    name: "id",
    align: "center",
    label: "Acciones",
    field: "id",
    sortable: false,
  },
];

const pagination = ref({
  page: 1,
  rowsPerPage: 5,
  sortBy: "name",
  descending: false,
});

const filter = ref("");
</script>
<style lang="sass">
.my-sticky-last-column-table
  thead tr:last-child th:last-child
    background-color: white

  td:last-child
    background-color: white

  th:last-child,
  td:last-child
    position: sticky
    right: 0
    z-index: 1
</style>
