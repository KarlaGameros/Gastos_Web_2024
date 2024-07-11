<template>
  <div class="row q-pl-lg q-pr-lg">
    <div class="col">
      <q-table
        :rows="list_Mis_Solicitudes"
        :filter="filter"
        :columns="columns"
        :pagination="pagination"
        row-key="id"
        rows-per-page-label="Filas por pagina"
        no-data-label="No hay registros"
        class="my-sticky-last-column-table"
        :loading="loading"
        color="blue-grey"
      >
        <template v-slot:top-right>
          <q-input
            outlined
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
              <div v-if="col.name === 'id'">
                <q-btn
                  v-if="
                    props.row.estatus == 'Cancelado' ||
                    props.row.estatus == 'Aprobado' ||
                    props.row.estatus == 'Aprobado por jefe de area'
                  "
                  flat
                  round
                  color="purple-ieen"
                  icon="search"
                  @click="verSolicitud(col.value)"
                >
                  <q-tooltip>Ver solicitud</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="
                    props.row.aprobado_Recursos_Financieros == true &&
                    props.row.estatus == 'Concluido'
                  "
                  flat
                  round
                  color="purple-ieen"
                  icon="search"
                  @click="verSolicitudComprobacion(col.value)"
                >
                  <q-tooltip>Ver solicitud</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="
                    props.row.estatus != 'Cancelado' &&
                    props.row.aprobado_Recursos_Financieros == true &&
                    props.row.estatus != 'Concluido'
                  "
                  flat
                  round
                  color="purple-ieen"
                  icon="edit_square"
                  @click="comprobar(col.value)"
                >
                  <q-tooltip>Comprobar gasto</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="
                    props.row.estatus == 'Borrador' ||
                    props.row.estatus == 'Pendiente'
                  "
                  flat
                  round
                  color="purple-ieen"
                  icon="edit"
                  @click="editarSolicitud(col.value)"
                >
                  <q-tooltip>Editar solicitud</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="
                    props.row.estatus == 'Pendiente' ||
                    props.row.estatus == 'Aprobado por jefe de area' ||
                    props.row.estatus == 'Borrador'
                  "
                  flat
                  round
                  color="purple-ieen"
                  icon="cancel"
                  @click="cancelarSolicitud(props.row)"
                >
                  <q-tooltip>Cancelar solititud</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="
                    props.row.aprobado_Recursos_Financieros == true &&
                    props.row.estatus != 'Cancelado'
                  "
                  flat
                  round
                  color="purple-ieen"
                  icon="print"
                  @click="generarOficio(col.value)"
                >
                  <q-tooltip>Generar oficio</q-tooltip>
                </q-btn>
              </div>
              <div v-else-if="col.name === 'folio'">
                <label class="text-bold">{{ col.value }}</label>
              </div>
              <div v-else-if="col.name === 'pagado'">
                <q-badge
                  v-if="props.row.estatus != 'Cancelado'"
                  :color="
                    col.value && props.row.monto_Asignado != '$0.00'
                      ? 'green'
                      : props.row.saldo_Cero ||
                        (props.row.aprobado_Recursos_Financieros == true &&
                          props.row.monto_Asignado == '$0.00')
                      ? 'green'
                      : !props.row.saldo_Cero &&
                        props.row.fecha_Pago == 'Sin registro'
                      ? 'orange'
                      : ''
                  "
                >
                  {{
                    col.value && props.row.monto_Asignado != "$0.00"
                      ? "Pagado"
                      : props.row.saldo_Cero ||
                        (props.row.aprobado_Recursos_Financieros == true &&
                          props.row.monto_Asignado == "$0.00")
                      ? "No solicitó recurso"
                      : !props.row.saldo_Cero &&
                        props.row.fecha_Pago == "Sin registro"
                      ? "Pendiente de pago"
                      : ""
                  }}
                </q-badge>
              </div>
              <div v-else-if="col.name === 'dias_Comprobar'">
                <q-badge
                  v-if="
                    (props.row.estatus != 'Cancelado' &&
                      props.row.estatus != 'Rechazado por jefe de area' &&
                      props.row.monto_Asignado != '$0.00' &&
                      props.row.monto_Utilizado != props.row.monto_Asignado &&
                      (props.row.e_Comprobacion_Gasto == false ||
                        props.row.e_Evidencias == false ||
                        props.row.e_Informe_Actividades == false ||
                        props.row.e_Reintegro == false)) ||
                    (props.row.monto_Asignado == '$0.00' &&
                      (props.row.e_Evidencias == false ||
                        props.row.e_Informe_Actividades == false) &&
                      props.row.estatus != 'Cancelado' &&
                      props.row.estatus != 'Rechazado por jefe de area')
                  "
                  :color="
                    col.value == 0 || col.value < 0 ? 'red' : 'purple-ieen'
                  "
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
          <q-tr v-show="props.expand" :props="props">
            <q-td colspan="100%">
              <div class="text-left q-pa-xs">
                <b>Personal solicitante:</b>
                {{ props.row.empleado_Solicitante }}
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
              <div class="text-left q-pa-xs">
                <b>Aprobado responsable área:</b>
                <q-icon
                  size="xs"
                  :color="props.row.aprobado_Responsable_Area ? 'green' : 'red'"
                  :name="
                    props.row.aprobado_Responsable_Area
                      ? 'check_circle'
                      : 'cancel'
                  "
                />
              </div>
              <div class="text-left q-pa-xs">
                <b>Aprobado recursos financieros:</b>
                <q-icon
                  size="xs"
                  :color="
                    props.row.aprobado_Recursos_Financieros ? 'green' : 'red'
                  "
                  :name="
                    props.row.aprobado_Recursos_Financieros
                      ? 'check_circle'
                      : 'cancel'
                  "
                />
              </div>
              <div class="text-left q-pa-xs">
                <b>Pernoctado:</b>
                <q-icon
                  size="xs"
                  :color="props.row.pernoctado ? 'green' : 'red'"
                  :name="props.row.pernoctado ? 'check_circle' : 'cancel'"
                />
              </div>
              <div class="text-left q-pa-xs">
                <b>Fecha impresión:</b>
                {{ props.row.fecha_Impresion }}
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script setup>
import { useQuasar, QSpinnerFacebook } from "quasar";
import { onBeforeMount, ref } from "vue";
import { useMisSolicitudesStore } from "src/stores/mis-solicitudes-store";
import { useDestinoStore } from "src/stores/destino-store";
import { storeToRefs } from "pinia";
import { useComprobarStore } from "src/stores/comprobar-store";
import { useSolicitudesRFStore } from "src/stores/solicitudes-rf-store";
import Swal from "sweetalert2";
import OficioGasto from "src/helpers/OficioGasto";

//-----------------------------------------------------------

const $q = useQuasar();
const misSolicitudesStore = useMisSolicitudesStore();
const destinosStore = useDestinoStore();
const comprobarStore = useComprobarStore();
const solictudesRFStore = useSolicitudesRFStore();
const { list_Mis_Solicitudes, loading } = storeToRefs(misSolicitudesStore);

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
  await misSolicitudesStore.load_Mis_Solicitudes();
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
  await comprobarStore.load_Evidencias(id);
  await comprobarStore.load_Informe(id);
  comprobarStore.actualizarModal(true);
  misSolicitudesStore.actualizarEditar(true);
  misSolicitudesStore.actualizarVisualizar(true);
  $q.loading.hide();
};

const editarSolicitud = async (id) => {
  $q.loading.show({
    spinner: QSpinnerFacebook,
    spinnerColor: "purple-ieen",
    spinnerSize: 140,
    backgroundColor: "purple-3",
    message: "Espere un momento, por favor...",
    messageColor: "black",
  });
  misSolicitudesStore.actualizarEditar(true);
  misSolicitudesStore.actualizarVisualizar(false);
  await misSolicitudesStore.load_Solicitud(id);
  await destinosStore.load_Destinos(id);
  misSolicitudesStore.actualizarModal(true);
  $q.loading.hide();
};

const cancelarSolicitud = async (row) => {
  if (row.aprobado_Recursos_Financieros == true) {
    Swal.fire({
      title: "Atención",
      text: "La solicitud ya fue aprobada por recursos financieros, no podrá cancelar",
      icon: "warning",
    });
  } else {
    Swal.fire({
      title: "Cancelar la solicitud",
      text: `¿Desea cancelar la solicitud con folio ${row.folio}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Si, Cancelar solicitud!",
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
        const resp = await misSolicitudesStore.cancelar_Solicitud(row.id);
        if (resp.success) {
          $q.loading.hide();
          await misSolicitudesStore.load_Mis_Solicitudes();
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

const comprobar = async (id) => {
  $q.loading.show({
    spinner: QSpinnerFacebook,
    spinnerColor: "purple-ieen",
    spinnerSize: 140,
    backgroundColor: "purple-3",
    message: "Espere un momento, por favor...",
    messageColor: "black",
  });
  await misSolicitudesStore.load_Solicitud(id);
  await comprobarStore.load_Evidencias(id);
  await comprobarStore.load_Informe(id);
  comprobarStore.actualizarModal(true);
  misSolicitudesStore.actualizarEditar(true);
  $q.loading.hide();
};

const generarOficio = (id) => {
  OficioGasto(id);
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
    name: "pagado",
    align: "center",
    label: "Pagado",
    field: "pagado",
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
    name: "id",
    align: "center",
    label: "Acciones",
    field: "id",
    sortable: false,
  },
];

const pagination = ref({
  page: 1,
  rowsPerPage: 8,
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
