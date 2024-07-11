<template>
  <q-table
    :rows="
      props.tipo == 'pendientes' ? list_Solicitudes_ByArea : list_Historial
    "
    :columns="columns"
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
              v-if="modulo.actualizar"
              flat
              round
              color="purple-ieen"
              icon="search"
              @click="verSolicitud(col.value)"
            >
              <q-tooltip>Ver registro</q-tooltip>
            </q-btn>
            <q-btn
              v-if="modulo.actualizar && tipo == 'pendientes'"
              flat
              round
              color="purple-ieen"
              icon="task_alt"
              @click="aprobarSolicitud(props.row)"
            >
              <q-tooltip>Aprobar</q-tooltip>
            </q-btn>
            <q-btn
              v-if="modulo.actualizar && tipo == 'pendientes'"
              flat
              round
              color="purple-ieen"
              icon="cancel"
              @click="rechazarSolicitud(props.row)"
            >
              <q-tooltip>Rechazar</q-tooltip>
            </q-btn>
          </div>
          <div v-else-if="col.name === 'folio'">
            <label class="text-bold">{{ col.value }}</label>
          </div>
          <div v-else-if="col.name === 'estatus'">
            <q-badge
              :color="
                col.value == 'Pendiente'
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
                  col.value == 'Pendiente'
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
import { useQuasar, QSpinnerFacebook } from "quasar";
import { useSolicitudesAreaStore } from "src/stores/solicitudes-area-store";
import { onBeforeMount, ref } from "vue";
import { useAuthStore } from "../../../stores/auth-store";
import { useMisSolicitudesStore } from "src/stores/mis-solicitudes-store";
import { useDestinoStore } from "src/stores/destino-store";
import Swal from "sweetalert2";

//-----------------------------------------------------------

const $q = useQuasar();
const authStore = useAuthStore();
const solicitudesAreaStore = useSolicitudesAreaStore();
const misSolicitudesStore = useMisSolicitudesStore();
const destinosStore = useDestinoStore();
const { modulo } = storeToRefs(authStore);
const { list_Solicitudes_ByArea, list_Historial, loading } =
  storeToRefs(solicitudesAreaStore);
const props = defineProps({
  tipo: {
    type: String,
  },
});

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
  await solicitudesAreaStore.load_Solicitudes_Area();
  await solicitudesAreaStore.load_Historial();
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
  await misSolicitudesStore.load_Solicitud(id);
  await destinosStore.load_Destinos(id);
  misSolicitudesStore.actualizarVisualizar(true);
  misSolicitudesStore.actualizarModal(true);
  $q.loading.hide();
};

const aprobarSolicitud = async (row) => {
  const dateActual = new Date();
  const year = dateActual.getFullYear();
  const month = String(dateActual.getMonth() + 1).padStart(2, "0");
  const day = String(dateActual.getDate()).padStart(2, "0");
  const dateHoy = `${year}-${month}-${day}`;
  if (row.fecha_Salida < dateHoy) {
    Swal.fire({
      title:
        "La fecha de salida es menor a la actual, por lo que no podrá aprobar la solictud",
      icon: "warning",
      showConfirmButton: true,
      confirmButtonText: "Cerrar",
    });
  } else {
    Swal.fire({
      title: "Aprobación de solicitud de gasto a comprobar",
      text: `¿Desea aprobar la solicitud con folio ${row.folio}?, pasará a recursos financieros`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Si, Aprobar!",
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
        const resp = await solicitudesAreaStore.aprobar_Solicitud(row.id);
        if (resp.success) {
          $q.loading.hide();
          await solicitudesAreaStore.load_Solicitudes_Area();
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
  }
};

const rechazarSolicitud = async (row) => {
  Swal.fire({
    title: "Rechazo de solicitud de gasto a comprobar",
    text: `¿Desea rechazar la solicitud con folio ${row.folio}?, al cancelar la solicitud no procede`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Si, Rechzar!",
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
      const resp = await solicitudesAreaStore.rechazar_Solicitud(row.id);
      if (resp.success) {
        $q.loading.hide();
        await solicitudesAreaStore.load_Solicitudes_Area();
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

//-----------------------------------------------------------

const columns = [
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
    name: "pernoctado_String",
    align: "center",
    label: "Pernoctado",
    field: "pernoctado_String",
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
