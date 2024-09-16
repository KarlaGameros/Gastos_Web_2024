<template>
  <q-dialog
    v-model="modalPago"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card style="width: 1000px; max-width: 90vw">
      <q-card-section class="row">
        <q-img src="../../../assets/IEEN300.png" width="90px" />
        <div class="text-h6 text-gray-ieen-1 text-bold absolute-center">
          SOLICITUD DE GASTO A COMPROBAR<br />
          <div class="text-center text-purple-ieen">
            {{ solicitud.folio }}
          </div>
        </div>
        <q-space />
        <q-btn
          icon="close"
          flat
          round
          dense
          v-close-popup
          @click="actualizarModal"
        />
      </q-card-section>
      <q-card-section>
        <q-form class="row q-col-gutter-xs" @submit="onSubmit">
          <div class="col-lg-6 col-md-6 col-sm-12">
            <q-select
              color="purple-ieen"
              use-input
              input-debounce="0"
              v-model="forma_Pago_Id"
              :options="list_Formas_Pago"
              @filter="filtro_forma_pago"
              label="Gasto"
              hint="Seleccione la forma de pago"
              lazy-rules
              :rules="[(val) => !!val || 'La forma de pago es requerida']"
            />
          </div>
          <div class="col-lg-6 col-md-6 col-sm-12">
            <q-input
              v-model="fecha_Pago"
              label="Fecha y hora de pago"
              hint="ingrese fecha de salida"
              lazy-rules
              :rules="[
                (val) => !!val || 'La fecha y hora de pago son requeridos',
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date
                      color="purple-ieen"
                      v-model="fecha_Pago"
                      mask="YYYY-MM-DD HH:mm"
                    >
                      <div class="row items-center justify-end">
                        <q-btn
                          v-close-popup
                          label="Listo"
                          color="purple-ieen"
                          flat
                        />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
              <template v-slot:append>
                <q-icon name="access_time" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-time
                      color="purple-ieen"
                      v-model="fecha_Pago"
                      mask="YYYY-MM-DD HH:mm"
                      format24h
                    >
                      <div class="row items-center justify-end">
                        <q-btn
                          v-close-popup
                          label="Listo"
                          color="purple-ieen"
                          flat
                        />
                      </div>
                    </q-time>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
          <div class="col-12 q-pb-lg q-pt-lg">
            <TablaDistribucion />
          </div>
          <div class="col-12 justify-end">
            <div class="text-right q-gutter-xs">
              <q-btn
                color="red"
                label="Cancelar"
                @click="actualizarModal"
                icon="highlight_off"
              />
              <q-btn
                color="secondary"
                label="Guardar"
                type="submit"
                icon="save"
              />
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { date, useQuasar, QSpinnerFacebook } from "quasar";
import { onBeforeMount, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useSolicitudesRFStore } from "src/stores/solicitudes-rf-store";
import { useMisSolicitudesStore } from "src/stores/mis-solicitudes-store";
import TablaDistribucion from "../components/TablaDistribucion.vue";

//-----------------------------------------------------------

const $q = useQuasar();
const solicitudesRFStore = useSolicitudesRFStore();
const misSolicitudesStore = useMisSolicitudesStore();
const { solicitud } = storeToRefs(misSolicitudesStore);
const { list_Formas_Pago, modalPago, pago } = storeToRefs(solicitudesRFStore);
const dateString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${("0" + (d.getMonth() + 1)).slice(-2)}-${(
    "0" + d.getDate()
  ).slice(-2)} ${("0" + d.getHours()).slice(-2)}:${("0" + d.getMinutes()).slice(
    -2
  )}`;
};
const fecha_Pago = ref(dateString());
const forma_Pago_Id = ref(null);

//-----------------------------------------------------------

onBeforeMount(() => {
  cargarData();
});

//-----------------------------------------------------------

watch(modalPago, (val) => {
  if (val == true) {
    fecha_Pago.value = dateString();
  }
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
  await solicitudesRFStore.load_Formas_Pago();
  $q.loading.hide();
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
  pago.value.forma_Pago_Id = forma_Pago_Id.value.value;
  pago.value.fecha_Pago = fecha_Pago.value;
  const resp = await solicitudesRFStore.pagar(solicitud.value.id, pago.value);
  $q.loading.hide();
  if (resp.success) {
    await solicitudesRFStore.load_Solicitudes_RF();
    await solicitudesRFStore.load_solicitudes_rec_financieros_aprobadas();
    $q.notify({
      type: "positive",
      message: resp.data,
    });
    actualizarModal();
  } else {
    $q.notify({
      type: "negative",
      message: resp.data,
    });
  }
};

const actualizarModal = () => {
  solicitudesRFStore.initPago();
  solicitudesRFStore.actualizarModalPago(false);
  solicitudesRFStore.actualizarVisualizar(false);
  solicitudesRFStore.initSolicitudRF();
  forma_Pago_Id.value = null;
  fecha_Pago.value = null;
};
</script>
