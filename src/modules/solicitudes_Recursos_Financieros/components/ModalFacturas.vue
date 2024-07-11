<template>
  <q-dialog
    v-model="modal_Factura"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card style="width: 800px; max-width: 80vw">
      <q-card-section class="row">
        <q-img src="../../../assets/IEEN300.png" width="90px" />
        <div class="text-h6 text-gray-ieen-1 text-bold absolute-center">
          COMPROBACIÓN DE GASTO
        </div>
        <q-space />
        <q-btn
          @click="actualizarModal()"
          icon="close"
          flat
          round
          dense
          v-close-popup
        />
      </q-card-section>
      <q-card-section>
        <div class="col-12">
          <q-table
            :rows="list_Comprobaciones"
            :columns="columns"
            :filter="filter"
            :loading="loading"
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
                      v-if="props.row.xml == 'Si' || props.row.pdf == 'Si'"
                      flat
                      round
                      color="purple-ieen"
                      icon="sim_card_download"
                      @click="descargarComprobantes(col.value, props.row.folio)"
                    >
                      <q-tooltip>Descargar comprobantes</q-tooltip>
                    </q-btn>
                  </div>
                  <label v-else>{{ col.value }}</label>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { storeToRefs } from "pinia";
import { useQuasar, QSpinnerFacebook } from "quasar";
import { useComprobarStore } from "src/stores/comprobar-store";
import { useDistribucionStore } from "src/stores/distribuciones-store";
import { useMisSolicitudesStore } from "src/stores/mis-solicitudes-store";
import { useSolicitudesRFStore } from "src/stores/solicitudes-rf-store";
import { ref } from "vue";
import { api } from "../../../boot/axios";

//-----------------------------------------------------------

const $q = useQuasar();
const comprobarStore = useComprobarStore();
const misSolicitudesStore = useMisSolicitudesStore();
const distribucionStore = useDistribucionStore();
const solictudesRFStore = useSolicitudesRFStore();
const { solicitud } = storeToRefs(misSolicitudesStore);
const { distribucion } = storeToRefs(distribucionStore);
const { modal_Factura, comprobacion, loading, list_Comprobaciones } =
  storeToRefs(comprobarStore);
const { perfil_RF } = storeToRefs(solictudesRFStore);
const fecha_ref = ref(null);
const folio_ref = ref(null);
const emisor_ref = ref(null);
const importe_ref = ref(null);

//-----------------------------------------------------------

const limpiar = () => {
  fecha_ref.value.resetValidation();
  folio_ref.value.resetValidation();
  emisor_ref.value.resetValidation();
  importe_ref.value.resetValidation();
  comprobarStore.initComprobacion();
};

const descargarComprobantes = async (id, folio) => {
  try {
    $q.loading.show({
      spinner: QSpinnerFacebook,
      spinnerColor: "purple-ieen",
      spinnerSize: 140,
      backgroundColor: "purple-3",
      message: "Espere un momento, por favor...",
      messageColor: "black",
    });
    const resp = await api.get(
      `/GastosComprobar/ComprobacionGastos/ZipByComprobacion/${id}`,
      {
        responseType: "blob",
      }
    );
    let blob = new window.Blob([resp.data], { type: "application/zip" });
    const adjunto = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = adjunto;
    link.setAttribute("download", folio);
    document.body.appendChild(link);
    link.click();
    $q.loading.hide();
  } catch (error) {
    $q.loading.hide();
    $q.notify({
      type: "negative",
      message:
        "Ocurrió un error, inténtelo de nuevo. Si el error persiste, contacte a soporte",
    });
  }
};

const onSubmit = async () => {
  $q.loading.show({
    spinner: QSpinnerFacebook,
    spinnerColor: "purple-ieen",
    spinnerSize: 140,
    backgroundColor: "purple-3",
    message: "Espere un momento, por favor...",
    messageColor: "black",
  });
  const bodyFormData = new FormData();
  bodyFormData.append(
    "Fecha_Comprobante",
    comprobacion.value.fecha_Comprobante
  );
  bodyFormData.append("Emisor", comprobacion.value.emisor);
  bodyFormData.append("Folio", comprobacion.value.folio);
  bodyFormData.append("Importe", comprobacion.value.importe);
  bodyFormData.append("PDF", comprobacion.value.pdf);
  bodyFormData.append("XML", comprobacion.value.xml);
  const resp = await comprobarStore.create_Comprobacion(
    distribucion.value.id,
    bodyFormData
  );
  if (resp.success == true) {
    await misSolicitudesStore.load_Solicitud(solicitud.value.id);
    await distribucionStore.load_Distribuciones(solicitud.value.id);
    await comprobarStore.loadComprobaciones(distribucion.value.id);
    await distribucionStore.load_Distribucion_Id(distribucion.value.id);
    limpiar();
    $q.notify({
      type: "positive",
      message: resp.data,
    });
  } else {
    $q.notify({
      type: "negative",
      message: resp.data,
    });
  }
  $q.loading.hide();
};

const actualizarModal = () => {
  comprobarStore.actualizarModalFactura(false);
};

//-----------------------------------------------------------

const columns = [
  {
    name: "fecha_Comprobante",
    align: "center",
    label: "Fecha comprobante",
    field: "fecha_Comprobante",
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
    name: "emisor",
    align: "center",
    label: "Emisor",
    field: "emisor",
    sortable: true,
  },
  {
    name: "importe",
    align: "center",
    label: "Importe",
    field: "importe",
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
