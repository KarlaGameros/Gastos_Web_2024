<template>
  <div class="row q-pa-lg">
    <div class="col">
      <q-table
        :visible-columns="visible_Columns"
        :rows="notificaciones_all"
        :columns="columns"
        :filter="filter"
        :loading="isLoading"
        :pagination="pagination"
        row-key="id"
        rows-per-page-label="Filas por pagina"
        no-data-label="No hay registros"
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
                  @click="toSolicitudes"
                >
                  <q-tooltip>Ver</q-tooltip>
                </q-btn>
              </div>
              <div v-else-if="col.name == 'leido'">
                <q-badge
                  :color="props.row.leido == true ? 'green' : 'orange'"
                  :label="props.row.leido == true ? 'Leido' : 'Sin leer'"
                >
                  <q-icon
                    :name="props.row.leido == true ? 'done' : 'warning'"
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
import { useQuasar } from "quasar";
import { onBeforeMount, ref } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useNotificacionStore } from "../../../stores/notificaciones-store";

//-----------------------------------------------------------

const $q = useQuasar();
const router = useRouter();
const notificacionStore = useNotificacionStore();
const { notificaciones_all, isLoading } = storeToRefs(notificacionStore);

//-----------------------------------------------------------

onBeforeMount(() => {
  notificacionStore.loadNotificacionesAll();
});

//-----------------------------------------------------------

const toSolicitudes = async () => {
  router.push({
    name: "misSolicitudes",
  });
};

//-----------------------------------------------------------

const columns = [
  {
    name: "solicitud_Id",
    align: "center",
    label: "solicitud_Id",
    field: "solicitud_Id",
    sortable: true,
  },
  {
    name: "titulo",
    align: "center",
    label: "Titulo",
    field: "titulo",
    sortable: true,
  },
  {
    name: "descripcion",
    align: "center",
    label: "Descripción",
    field: "descripcion",
    sortable: true,
  },
  {
    name: "fecha_Registro",
    align: "center",
    label: "Fecha registro",
    field: "fecha_Registro",
    sortable: true,
  },
  {
    name: "leido",
    align: "center",
    label: "Leído",
    field: "leido",
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

const visible_Columns = [
  "titulo",
  "descripcion",
  "fecha_Registro",
  "leido",
  "id",
];

const pagination = ref({
  page: 1,
  rowsPerPage: 8,
  sortBy: "name",
  descending: false,
});

const filter = ref("");
</script>
