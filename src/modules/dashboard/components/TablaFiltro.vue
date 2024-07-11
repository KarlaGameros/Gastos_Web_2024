<template>
  <div class="row">
    <div class="col">
      <q-table
        :rows="solicitudes_filtro"
        :columns="columns"
        :filter="filter"
        :pagination="pagination"
        :loading="is_loading"
        row-key="id"
        rows-per-page-label="Filas por pagina"
        no-data-label="No hay registros"
        class="my-sticky-header-table my-sticky-last-column-table"
      >
        <template v-slot:top-left>
          <div class="text-h6 text-bold text-purple-ieen">
            Solicitudes del año: {{ yearFiltro }}
          </div>
        </template>
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
              <div v-if="col.name === 'id'">
                <q-btn
                  flat
                  round
                  color="purple-ieen"
                  icon="search"
                  @click="verDetalle(col.value)"
                >
                  <q-tooltip>ver registro</q-tooltip>
                </q-btn>
              </div>
              <div v-else-if="col.name === 'folio'">
                <label class="text-bold">{{ col.value }}</label>
              </div>
              <div v-else-if="col.name === 'estatus'">
                <q-badge
                  :color="
                    col.value == 'Pendiente' ||
                    col.value == 'Recibido sin firmas' ||
                    col.value == 'Pendiente de conclusión' ||
                    col.value == 'Pendiente de reintegro'
                      ? 'orange'
                      : col.value == 'Cancelado'
                      ? 'red'
                      : col.value == 'Borrador'
                      ? 'purple-ieen'
                      : 'green'
                  "
                >
                  {{ col.value }}
                  <q-icon
                    :name="
                      col.value == 'Pendiente' ||
                      col.value == 'Recibido sin firmas' ||
                      col.value == 'Pendiente de conclusión' ||
                      col.value == 'Pendiente de reintegro'
                        ? 'warning'
                        : col.value == 'Cancelado'
                        ? 'close'
                        : col.value == 'Borrador'
                        ? 'drafts'
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
        </template>
      </q-table>
    </div>
  </div>
</template>
<script setup>
import { useQuasar, QSpinnerFacebook, exportFile } from "quasar";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { useDashboardStore } from "../../../stores/dashboard-store";
import { useDistribucionStore } from "../../../stores/distribuciones-store";
import { useMisSolicitudesStore } from "src/stores/mis-solicitudes-store";
import { useComprobarStore } from "src/stores/comprobar-store";
import { useSolicitudesRFStore } from "src/stores/solicitudes-rf-store";

//-----------------------------------------------------------

const $q = useQuasar();
const dasboardStore = useDashboardStore();
const misSolictudesStore = useMisSolicitudesStore();
const distribucionStore = useDistribucionStore();
const comprobacionStore = useComprobarStore();
const solicitudesRFStore = useSolicitudesRFStore();
const { solicitudes_filtro, is_loading, yearFiltro } =
  storeToRefs(dasboardStore);

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
  await solicitudesRFStore.load_Solicitud_Id_RF(id);
  await distribucionStore.load_Distribuciones(id);
  await comprobacionStore.load_Informe(id);
  await comprobacionStore.load_Evidencias(id);
  comprobacionStore.actualizarConcluir(true);
  comprobacionStore.actualizarModal(true);
  misSolictudesStore.actualizarVisualizar(true);
  $q.loading.hide();
};

function wrapCsvValue(val, formatFn, row) {
  let formatted = formatFn !== void 0 ? formatFn(val, row) : val;

  formatted =
    formatted === void 0 || formatted === null ? "" : String(formatted);

  formatted = formatted.split('"').join('""');

  return `"${formatted}"`;
}

const exportTable = () => {
  const content = [columns.map((col) => wrapCsvValue(col.label))]
    .concat(
      solicitudes_filtro.value.map((row) =>
        columns
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
    `Solicitudes${yearFiltro.value}`,
    bom + content,
    "text/csv;charset=utf-8"
  );
  if (status !== true) {
    $q.notify({
      message: "Browser denied file download...",
      color: "negative",
      icon: "warning",
    });
  }
};

//-----------------------------------------------------------

const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  sortBy: "name",
  descending: false,
});

const columns = [
  {
    name: "folio",
    align: "center",
    label: "Folio",
    field: "folio",
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
    name: "area",
    align: "center",
    label: "Área",
    field: "area",
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
    label: "Fecha salida",
    field: "fecha_Salida",
    sortable: true,
  },
  {
    name: "fecha_LLegada",
    align: "center",
    label: "Fecha llegada",
    field: "fecha_LLegada",
    sortable: true,
  },
  {
    name: "monto_Asignado",
    align: "center",
    label: "Monto erogado",
    field: "monto_Asignado",
    sortable: true,
  },
  {
    name: "monto_Utilizado",
    align: "center",
    label: "Monto ejercido",
    field: "monto_Utilizado",
    sortable: true,
  },
  {
    name: "monto_Reintegro",
    align: "center",
    label: "Monto reintegro",
    field: "monto_Reintegro",
    sortable: true,
  },
  {
    name: "saldo",
    align: "center",
    label: "Saldo",
    field: "saldo",
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
</script>
<style lang="sass">
.my-sticky-last-column-table
  td:last-child
    background-color: white

  th:last-child,
  td:last-child
    position: sticky
    right: 0
    z-index: 1

.my-sticky-header-table
  .q-table__top,
  thead tr:first-child th
    background-color: #EEEEEE
</style>
