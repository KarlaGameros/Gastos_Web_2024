<template>
  <q-card class="bg-transparent no-shadow no-border rounded">
    <q-card-section class="row">
      <div class="col-3">
        <q-checkbox
          color="purple-ieen"
          v-model="con_Recurso"
          label="Áreas con recurso asignado"
        />
      </div>
      <div class="col-6 text-center text-h5 text-bold text-purple-ieen q-pb-lg">
        Solicitudes del año: {{ yearFiltro }}
      </div>
      <div class="row q-col-gutter-sm">
        <div
          v-for="area in areas_Filtro"
          :key="area.area_Id"
          v-show="
            con_Recurso
              ? area.no_Solicitudes > 0 && area.no_Solicitudes != null
              : area
          "
          style="width: 370px"
        >
          <q-item>
            <q-item-section
              class="q-pa-sm bg-purple-1"
              style="border-radius: 10px"
            >
              <q-item-label
                class="purple-ieen text-subtitle1 text-bold text-purple-ieen"
              >
                {{ area.area_Nombre }}
              </q-item-label>
              <q-item>
                <q-item-section>
                  <q-item-label>
                    Solicitudes: {{ area.no_Solicitudes }}
                  </q-item-label>
                  <q-item-label>
                    Monto erogado: ${{ area.monto_Erogado }}
                  </q-item-label>
                  <q-item-label>
                    Monto ejercido: ${{ area.monto_Utilizado }}
                  </q-item-label>
                  <q-item-label>
                    Monto Reintegrado: ${{ area.monto_Reintegrado }}
                  </q-item-label>
                  <q-item-label> Saldo ${{ area.monto_Saldo }} </q-item-label>
                  <br />
                  <q-separator /><br />
                  <q-item-label class="purple-ieen text-bold text-purple-ieen">
                    Detalle monto ejercido
                  </q-item-label>
                  <q-item-label v-for="gasto in area.gastos" :key="gasto">
                    {{ gasto.concepto }}: ${{ gasto.importe }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-item-section>
          </q-item>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { useQuasar } from "quasar";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { useDashboardStore } from "../../../stores/dashboard-store";

//-----------------------------------------------------------

const $q = useQuasar();
const dasboardStore = useDashboardStore();
const { areas_Filtro, areas_Gastos, filtrar, yearFiltro } =
  storeToRefs(dasboardStore);
const con_Recurso = ref(true);
</script>
