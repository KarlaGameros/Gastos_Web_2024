<template>
  <div class="row q-pt-lg">
    <div class="col">
      <q-table
        :rows="list_Distribuciones"
        :columns="columns"
        :filter="filter"
        :pagination="pagination"
        row-key="id"
        rows-per-page-label="Filas por pagina"
        no-data-label="No hay registros"
        :rows-per-page-options="[5, 15, 20, 25, 50]"
      >
        <template v-slot:top-right>
          <q-input
            borderless
            dense
            debounce="300"
            v-model="filter"
            placeholder="Buscar.."
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
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
                  @click="ver(col.value)"
                >
                  <q-tooltip>Ver</q-tooltip>
                </q-btn>
              </div>
              <label v-else-if="col.name == 'importe'"
                >${{ col.value.toFixed(2) }}</label
              >
              <label v-else>{{ col.value }}</label>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
  </div>
</template>
<script setup>
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { useQuasar, QSpinnerFacebook } from "quasar";
import { onBeforeMount } from "vue";
import { useDistribucionStore } from "src/stores/distribuciones-store";
import { useMisSolicitudesStore } from "src/stores/mis-solicitudes-store";
import { useComprobarStore } from "src/stores/comprobar-store";

//-----------------------------------------------------------

const $q = useQuasar();
const distribucionStore = useDistribucionStore();
const misSolicitudesStore = useMisSolicitudesStore();
const comprobarStore = useComprobarStore();
const { list_Distribuciones } = storeToRefs(distribucionStore);
const { solicitud } = storeToRefs(misSolicitudesStore);

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
  await distribucionStore.load_Distribuciones(solicitud.value.id);
  $q.loading.hide();
};

const ver = async (id) => {
  comprobarStore.actualizarModalFactura(true);
  await distribucionStore.load_Distribucion_Id(id);
  await comprobarStore.loadComprobaciones(id);
};

//-----------------------------------------------------------

const columns = [
  {
    name: "c_Gasto",
    align: "center",
    label: "C. Gasto",
    field: "c_Gasto",
    sortable: true,
  },
  {
    name: "importe",
    align: "center",
    label: "Importe asignado",
    field: "importe",
    sortable: true,
  },
  {
    name: "importe_Utilizado",
    align: "center",
    label: "Importe utilizado",
    field: "importe_Utilizado",
    sortable: true,
  },
  {
    name: "diferencia",
    align: "center",
    label: "Diferencia",
    field: "diferencia",
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
  rowsPerPage: 25,
  sortBy: "name",
  descending: false,
});

const filter = ref("");
</script>
