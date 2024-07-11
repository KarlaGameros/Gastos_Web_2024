<template>
  <q-table
    :rows="
      propsPage.tipo == 'pendientes'
        ? list_Pendientes_Administracion.filter(
            (x) =>
              x.aprobado_Recursos_Financieros == true &&
              x.estatus != 'Pendiente' &&
              x.estatus != 'Cancelado' &&
              x.estatus != 'Rechazado por jefe de area'
          )
        : propsPage.tipo == 'recibidas'
        ? list_Recibidas_Administracion.filter(
            (x) => x.estatus != 'Recibido sin firmas'
          )
        : list_Pendientes_Firmas.filter(
            (x) =>
              x.estatus != 'Cancelado' &&
              x.estatus != 'Pendiente' &&
              x.estatus != 'Rechazado por jefe de area'
          )
    "
    :columns="propsPage.tipo == 'pendientes' ? columns1 : columns2"
    :filter="filter"
    :loading="loading"
    :pagination="pagination"
    row-key="id"
    rows-per-page-label="Filas por pagina"
    no-data-label="No hay registros"
    class="my-sticky-last-column-table"
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
        <q-td auto-width>
          <q-btn
            size="sm"
            color="purple-ieen"
            round
            dense
            @click="props.expand = !props.expand"
            :icon="props.expand ? 'remove' : 'add'"
            class="absolute-center"
          />
        </q-td>
        <q-td v-for="col in props.cols" :key="col.name" :props="props">
          <div v-if="col.name == 'color'">
            <q-badge :color="col.value" :label="col.value" />
          </div>
          <div v-if="col.name === 'id'">
            <q-btn
              v-if="modulo == null ? false : modulo.leer"
              flat
              round
              color="purple-ieen"
              icon="search"
              @click="verSolicitud(col.value)"
            >
              <q-tooltip>Ver registro</q-tooltip>
            </q-btn>
            <q-btn
              v-if="
                modulo == null
                  ? false
                  : modulo.actualizar &&
                    propsPage.tipo != 'recibidas' &&
                    props.row.estatus != 'Cancelado'
              "
              flat
              round
              type="button"
              color="purple-ieen"
              icon="task_alt"
              @click="recibir(props.row, propsPage.tipo)"
            >
              <q-tooltip>Recibir</q-tooltip>
            </q-btn>
          </div>
          <div v-else-if="col.name === 'folio'">
            <label class="text-bold">{{ col.value }}</label>
          </div>
          <div v-else-if="col.name === 'estatus'">
            <q-badge
              :color="
                col.value == 'Pendiente' ||
                col.value == 'Pendiente de conclusión' ||
                col.value == 'Borrador' ||
                col.value == 'Recibido sin firmas'
                  ? 'orange'
                  : col.value == 'Cancelado' ||
                    col.value == 'Rechazado por jefe de area' ||
                    col.value == 'Recibido sin firmas'
                  ? 'red'
                  : 'green'
              "
            >
              {{ col.value }}
              <q-icon
                :name="
                  col.value == 'Pendiente' ||
                  col.value == 'Pendiente de conclusión' ||
                  col.value == 'Borrador' ||
                  col.value == 'Recibido sin firmas'
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
            <b>Empleado que realizó el registro:</b>
            {{ props.row.empleado_Registra }}
          </div>
          <div class="text-left q-pa-xs">
            <b>Responsable de área:</b>
            {{ props.row.responsable_Area }}
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>
<script setup>
import { storeToRefs } from "pinia";
import { useAuthStore } from "../../../stores/auth-store";
import { useQuasar, QSpinnerFacebook, exportFile } from "quasar";
import { onBeforeMount, ref } from "vue";
import { useAdministracionStore } from "../../../stores/administracion-store";
import { useMisSolicitudesStore } from "src/stores/mis-solicitudes-store";
import { useSolicitudesRFStore } from "src/stores/solicitudes-rf-store";
import { useDistribucionStore } from "src/stores/distribuciones-store";
import Swal from "sweetalert2";

//-----------------------------------------------------------

const $q = useQuasar();
const administracionStore = useAdministracionStore();
const misSolicitudesStore = useMisSolicitudesStore();
const solicitudesRFStore = useSolicitudesRFStore();
const distribucionStore = useDistribucionStore();
const { solicitud } = storeToRefs(misSolicitudesStore);
const {
  list_Pendientes_Administracion,
  list_Pendientes_Firmas,
  list_Recibidas_Administracion,
  loading,
  pendiente_Firma,
} = storeToRefs(administracionStore);
const siglas = "SOLIC-ADMON";
const authStore = useAuthStore();
const { modulo } = storeToRefs(authStore);
const propsPage = defineProps({
  tipo: {
    type: String,
    required: true,
  },
});

//-----------------------------------------------------------

onBeforeMount(() => {
  leerPermisos();
  cargarData();
});

//-----------------------------------------------------------

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

const cargarData = async () => {
  $q.loading.show({
    spinner: QSpinnerFacebook,
    spinnerColor: "purple-ieen",
    spinnerSize: 140,
    backgroundColor: "purple-3",
    message: "Espere un momento, por favor...",
    messageColor: "black",
  });
  await administracionStore.load_Solicitudes_Administracion();
  await administracionStore.load_Recibidas_Administracion();
  await administracionStore.load_Pendientes_Firmas();
  $q.loading.hide();
};

const verSolicitud = async (id) => {
  $q.loading.show({
    spinner: QSpinnerFacebook,
    spinnerColor: "purple-ieen",
    spinnerSize: 140,
    backgroundColor: "purple-3",
    message: "Espere un momento, por favor...",
    messageColor: "black",
  });
  administracionStore.actualizarModal(true);
  await misSolicitudesStore.load_Solicitud(id);
  await distribucionStore.load_Distribuciones(id);
  distribucionStore.actualizarVisualizar(true);
  if (propsPage.tipo == "pendientes_firmas") {
    administracionStore.actualizarPendienteFirma(true);
  } else {
    administracionStore.actualizarPendienteFirma(false);
  }
  $q.loading.hide();
};

const recibir = async (row, tipo) => {
  if (tipo == "pendientes_firmas") {
    $q.dialog({
      title: "Recibir solucitud de gasto a comprobar",
      message: `Esta seguro de darle recepción a la solicitud de gasto con folio ${row.folio}, pasará a recursos financieros`,
      icon: "Warning",
      persistent: true,
      transitionShow: "scale",
      transitionHide: "scale",
      ok: {
        icon: "check_circle",
        color: "secondary",
        label: "Sí! continuar",
      },
      cancel: {
        icon: "cancel",
        color: "red",
        label: "Cancelar",
      },
      options: {
        type: "radio",
        model: "opt1",
        isValid: (val) => val !== null,
        items: [
          {
            label: "Recibir con firmas",
            value: "opt1",
            color: "purple-ieen",
          },
        ],
      },
    }).onOk(async (opt) => {
      let resp = null;
      switch (opt) {
        case "opt1":
          $q.loading.show({
            spinner: QSpinnerFacebook,
            spinnerColor: "purple-ieen",
            spinnerSize: 140,
            backgroundColor: "purple-3",
            message: "Espere un momento, por favor...",
            messageColor: "black",
          });
          resp = await administracionStore.recibir_Admon(row.id, 1);
          $q.loading.hide();
          break;
      }
      if (resp.success) {
        await administracionStore.load_Solicitudes_Administracion();
        await administracionStore.load_Recibidas_Administracion();
        await administracionStore.load_Pendientes_Firmas();
        $q.loading.hide();
        $q.notify({
          type: "positive",
          message: resp.data,
        });
      } else {
        $q.loading.hide();
        $q.notify({
          type: "negative",
          message: resp.data,
        });
      }
    });
  } else {
    $q.dialog({
      title: "Recibir solucitud de gasto a comprobar",
      message: `Esta seguro de darle recepción a la solicitud de gasto con folio ${row.folio}, pasará a recursos financieros`,
      icon: "Warning",
      persistent: true,
      transitionShow: "scale",
      transitionHide: "scale",
      ok: {
        icon: "check_circle",
        color: "secondary",
        label: "Sí! continuar",
      },
      cancel: {
        icon: "cancel",
        color: "red",
        label: "Cancelar",
      },
      options: {
        type: "radio",
        model: "opt1",
        isValid: (val) => val !== null,
        items: [
          {
            label: "Recibir con firmas",
            value: "opt1",
            color: "purple-ieen",
          },
          {
            label: "Recibir sin firmas",
            value: "opt2",
            color: "purple-ieen",
          },
        ],
      },
    }).onOk(async (opt) => {
      let resp = null;
      switch (opt) {
        case "opt1":
          $q.loading.show({
            spinner: QSpinnerFacebook,
            spinnerColor: "purple-ieen",
            spinnerSize: 140,
            backgroundColor: "purple-3",
            message: "Espere un momento, por favor...",
            messageColor: "black",
          });
          resp = await administracionStore.recibir_Admon(row.id, 1);
          $q.loading.hide();
          break;
        case "opt2":
          $q.loading.show({
            spinner: QSpinnerFacebook,
            spinnerColor: "purple-ieen",
            spinnerSize: 140,
            backgroundColor: "purple-3",
            message: "Espere un momento, por favor...",
            messageColor: "black",
          });
          resp = await administracionStore.recibir_Admon(row.id, 2);
          $q.loading.hide();
          break;
      }
      if (resp.success) {
        await administracionStore.load_Solicitudes_Administracion();
        await administracionStore.load_Recibidas_Administracion();
        await administracionStore.load_Pendientes_Firmas();
        $q.loading.hide();
        $q.notify({
          type: "positive",
          message: resp.data,
        });
      } else {
        $q.loading.hide();
        $q.notify({
          type: "negative",
          message: resp.data,
        });
      }
    });
  }
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
    propsPage.tipo == "pendientes"
      ? list_Pendientes_Administracion.value.filter(
          (x) => x.aprobado_Recursos_Financieros == true
        )
      : propsPage.tipo == "recibidas"
      ? list_Recibidas_Administracion.value.filter(
          (x) => x.estatus != "Recibido sin firmas"
        )
      : list_Pendientes_Firmas.value;

  const content = [
    propsPage.tipo == 1
      ? columns1
      : columns2.map((col) => wrapCsvValue(col.label)),
  ]
    .concat(
      list.map((row) =>
        propsPage.tipo == 1
          ? columns1
          : columns2
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
      propsPage.tipo == "pendientes"
        ? "Pendientes"
        : propsPage.tipo == "recibidas"
        ? "Recibidas"
        : "Pendientes_firma"
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

const columns1 = [
  {
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
    name: "id",
    align: "center",
    label: "Acciones",
    field: "id",
    sortable: false,
  },
];

const columns2 = [
  {
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
    name: "empleado_Recibe_Administracion",
    align: "center",
    label: "Empleado(a) que recibió",
    field: "empleado_Recibe_Administracion",
    sortable: true,
  },
  {
    name: "fecha_Recepcion_Administracion",
    align: "center",
    label: "Fecha recepción",
    field: "fecha_Recepcion_Administracion",
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

const filter = ref("");

const pagination = ref({
  page: 1,
  rowsPerPage: 5,
  sortBy: "name",
  descending: false,
});
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
