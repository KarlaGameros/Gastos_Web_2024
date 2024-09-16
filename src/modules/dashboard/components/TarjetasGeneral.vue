<template>
  <q-card class="no-shadow no-border rounded row flex-center">
    <q-card-section>
      <q-item-section class="q-pa-lg bg-purple-1" style="border-radius: 10px">
        <q-item-label class="purple-ieen text-subtitle1 text-bold text-grey-9">
          Total de solicitudes: {{ solicitudes_Totales }}
        </q-item-label>
      </q-item-section>
    </q-card-section>
    <q-card-section>
      <q-item-section class="q-pa-lg bg-purple-1" style="border-radius: 10px">
        <q-item-label class="purple-ieen text-subtitle1 text-bold text-grey-9">
          Total asignado: ${{ total_Erogado.toLocaleString("en-US") }}
        </q-item-label>
      </q-item-section>
    </q-card-section>
    <q-card-section>
      <q-item-section class="q-pa-lg bg-purple-1" style="border-radius: 10px">
        <q-item-label class="purple-ieen text-subtitle1 text-bold text-grey-9">
          Total ejercido: ${{ total_Utilizado.toLocaleString("en-US") }}
        </q-item-label>
      </q-item-section>
    </q-card-section>
    <q-card-section>
      <q-item-section class="q-pa-lg bg-purple-1" style="border-radius: 10px">
        <q-item-label class="purple-ieen text-subtitle1 text-bold text-grey-9">
          Total reintegrado: ${{ total_Reitegrado.toLocaleString("en-US") }}
        </q-item-label>
      </q-item-section>
    </q-card-section>
    <q-card-section>
      <q-item-section class="q-pa-lg bg-purple-1" style="border-radius: 10px">
        <q-item-label class="purple-ieen text-subtitle1 text-bold text-grey-9">
          Total saldo: ${{ total_Saldo.toLocaleString("en-US") }}
        </q-item-label>
      </q-item-section>
    </q-card-section>
  </q-card>
  <TablaConcepto />
</template>

<script setup>
import { useQuasar } from "quasar";
import { storeToRefs } from "pinia";
import { useDashboardStore } from "../../../stores/dashboard-store";
import TablaConcepto from "./TablaConceptos.vue";

//-----------------------------------------------------------

const $q = useQuasar();
const dasboardStore = useDashboardStore();
const {
  solicitudes_Totales,
  total_Erogado,
  total_Utilizado,
  total_Reitegrado,
  total_Saldo,
} = storeToRefs(dasboardStore);
</script>
