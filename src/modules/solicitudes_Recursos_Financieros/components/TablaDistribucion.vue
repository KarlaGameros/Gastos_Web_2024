<template>
  <div class="row">
    <div class="col">
      <q-table
        :rows="list_Distribuciones"
        :columns="visualizar ? columns_ver : columns"
        :filter="filter"
        :loading="is_loading"
        :pagination="pagination"
        :rows-per-page-options="[5, 15, 20, 25, 50]"
        row-key="id"
        rows-per-page-label="Filas por pagina"
        no-data-label="No hay registros"
        class="my-sticky-header-table"
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
                <!-- <q-btn
                  v-if="
                    solicitudRF.estatus !=
                      'Aprobado por recursos financieros' &&
                    solicitudRF.estatus != 'Rechazado por recursos financieros'
                  "
                  flat
                  round
                  color="purple-ieen"
                  icon="edit"
                  @click="editarDistribucion(col.value)"
                >
                  <q-tooltip>Editar registro</q-tooltip>
                </q-btn> -->
                <q-btn
                  v-if="
                    solicitudRF.estatus != 'Rechazado por recursos financieros'
                  "
                  flat
                  round
                  color="purple-ieen"
                  icon="delete"
                  @click="eliminarDistribucion(col.value)"
                >
                  <q-tooltip>Eliminar registro</q-tooltip>
                </q-btn>
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
import { storeToRefs } from "pinia";
import { useQuasar, QSpinnerFacebook } from "quasar";
import { ref, watch } from "vue";
import { useDistribucionStore } from "src/stores/distribuciones-store";
import { useSolicitudesRFStore } from "src/stores/solicitudes-rf-store";
import Swal from "sweetalert2";

//-----------------------------------------------------------

const $q = useQuasar();
const distribucionStore = useDistribucionStore();
const solicitudesRFStore = useSolicitudesRFStore();
const { list_Distribuciones, is_loading, visualizar } =
  storeToRefs(distribucionStore);
const { solicitudRF } = storeToRefs(solicitudesRFStore);
const visible_columns = ref([]);

//-----------------------------------------------------------

const eliminarDistribucion = async (id) => {
  $q.dialog({
    title: "Eliminar registro",
    message: "¿Esta seguro de eliminar el registro?",
    icon: "Warning",
    persistent: true,
    transitionShow: "scale",
    transitionHide: "scale",
    ok: {
      color: "secondary",
      label: "Sí! eliminar",
      icon: "delete",
    },
    cancel: {
      icon: "close",
      color: "red",
      label: "Cancelar",
    },
  }).onOk(async () => {
    $q.loading.show({
      spinner: QSpinnerFacebook,
      spinnerColor: "purple-ieen",
      spinnerSize: 140,
      backgroundColor: "purple-3",
      message: "Espere un momento, por favor...",
      messageColor: "black",
    });
    const resp = await distribucionStore.delete_Distribucion(id);
    if (resp.success) {
      await distribucionStore.load_Distribuciones(solicitudRF.value.id);
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
};

const editarDistribucion = async (id) => {
  distribucionStore.actualizarEditar(true);
  await distribucionStore.load_Distribucion_Id(id);
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
    name: "importe_string",
    align: "center",
    label: "Monto",
    field: "importe_string",
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

const columns_ver = [
  {
    name: "c_Gasto",
    align: "center",
    label: "C. Gasto",
    field: "c_Gasto",
    sortable: true,
  },
  {
    name: "importe_string",
    align: "center",
    label: "Monto",
    field: "importe_string",
    sortable: true,
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
<style lang="sass">
.my-sticky-header-table
  .q-table__top,
  thead tr:first-child th
    background-color: #EEEEEE
</style>
