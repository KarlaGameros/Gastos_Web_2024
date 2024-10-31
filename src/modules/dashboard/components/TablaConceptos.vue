<template>
  <div class="col-12">
    <q-table
      :rows="cargarData()"
      :columns="columns"
      :filter="filter"
      :pagination="pagination"
      :loading="is_loading"
      :rows-per-page-options="[5, 15, 20, 25, 50]"
      row-key="id"
      rows-per-page-label="Filas por pagina"
      no-data-label="No hay registros"
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
          @click="exportTableConceptos"
        />
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td v-for="col in props.cols" :key="col.name" :props="props">
            <label v-if="col.name == 'area_Nombre'" class="text-bold">{{
              col.value
            }}</label>
            <label v-else-if="col.name == 'monto_Utilizado'"
              >${{ col.value }}</label
            >
            <label v-else>{{ col.value }}</label>
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <div class="q-mt-md text-left text-bold text-red">
      Para el cálculo de montos no se contempla solicitudes pendientes,
      canceladas y rechazadas
    </div>
  </div>
</template>
<script setup>
import { useQuasar, exportFile } from "quasar";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { useDashboardStore } from "../../../stores/dashboard-store";

//-----------------------------------------------------------

const $q = useQuasar();
const dasboardStore = useDashboardStore();
const { areas_Gastos, is_loading, yearFiltro } = storeToRefs(dasboardStore);

//-----------------------------------------------------------

const cargarData = () => {
  return areas_Gastos.value.map((item) => {
    const objetoArea = {
      area_Nombre: item.area_Nombre,
      monto_Utilizado: item.monto_Utilizado,
      no_Solicitudes: item.no_Solicitudes,
    };
    item.gastos.forEach((gasto, index) => {
      objetoArea[`${index + 1}`] = `$${gasto.importe}`;
    });
    return objetoArea;
  });
};

function wrapCsvValue(val, formatFn, row) {
  let formatted = formatFn !== void 0 ? formatFn(val, row) : val;
  formatted =
    formatted === void 0 || formatted === null ? "" : String(formatted);
  formatted = formatted.split('"').join('""');
  return `"${formatted}"`;
}

const exportTableConceptos = () => {
  const content = [columns.map((col) => wrapCsvValue(col.label))]
    .concat(
      cargarData().map((row) =>
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

const pagination = ref({
  page: 1,
  rowsPerPage: 5,
  sortBy: "name",
  descending: false,
});

const columns = [
  {
    name: "area_Nombre",
    align: "center",
    label: "Área",
    field: "area_Nombre",
    sortable: true,
  },
  {
    name: "no_Solicitudes",
    align: "center",
    label: "Total de solicitudes",
    field: "no_Solicitudes",
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
    name: "1",
    align: "center",
    label: "001-Gasolina",
    field: "1",
    sortable: false,
  },
  {
    name: "2",
    align: "center",
    label: "002-Boletos de avión",
    field: "2",
    sortable: false,
  },
  {
    name: "3",
    align: "center",
    label: "003-Boletos de autobús o transporte de servicio privado",
    field: "3",
    sortable: false,
  },
  {
    name: "4",
    align: "center",
    label: "004-Peajes",
    field: "4",
    sortable: false,
  },
  {
    name: "5",
    align: "center",
    label: "005-Transporte o servicio privado",
    field: "5",
    sortable: false,
  },
  {
    name: "6",
    align: "center",
    label: "006-Alimentación",
    field: "6",
    sortable: false,
  },
  {
    name: "7",
    align: "center",
    label: "007-Hospedaje",
    field: "7",
    sortable: false,
  },
  {
    name: "8",
    align: "center",
    label: "008-Alimentación (Desayuno)",
    field: "8",
    sortable: false,
  },
  {
    name: "9",
    align: "center",
    label: "009-Alimentación (Comida)",
    field: "9",
    sortable: false,
  },
  {
    name: "10",
    align: "center",
    label: "010-Alimentación (Cena)",
    field: "10",
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
