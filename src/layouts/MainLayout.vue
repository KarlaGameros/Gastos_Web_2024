<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-purple-ieen">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title> Gastos a comprobar </q-toolbar-title>
        <q-badge rounded :color="onLine == true ? 'green' : 'red'" />
        <q-btn flat round dense icon="notifications">
          <q-badge v-if="no_notificaciones > 0" color="red" floating>{{
            no_notificaciones > 5 ? "5+" : no_notificaciones
          }}</q-badge>
          <q-menu>
            <q-list style="min-width: 100px">
              <div>
                <q-item
                  style="max-width: 420px"
                  v-for="notificacion in notificaciones"
                  :key="notificacion.id"
                  clickable
                  v-ripple
                  @click="toSolicitudes(notificacion.id, notificacion.tipo)"
                >
                  <q-item-section>
                    <q-item-label>{{ notificacion.titulo }}</q-item-label>
                    <q-item-label caption lines="3"
                      >{{ notificacion.descripcion }}
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    {{ notificacion.fecha_Registro }}
                    <q-badge
                      v-if="notificacion.leido == false"
                      color="blue"
                      rounded
                      class="q-mr-sm"
                    />
                  </q-item-section>
                </q-item>
              </div>
              <q-card
                v-if="notificaciones.length > 0"
                class="text-center no-shadow no-border"
              >
                <q-btn
                  label="Ver todos"
                  color="purple-ieen"
                  style="max-width: 120px !important"
                  flat
                  dense
                  class="text-indigo-8"
                  @click="toNotificaciones"
                ></q-btn>
              </q-card>
            </q-list>
          </q-menu>
        </q-btn>
        <q-btn flat round dense icon="apps" @click="show" />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="300"
      :breakpoint="1024"
    >
      <q-img
        class="absolute-top"
        src="~assets/FondoIEEN.png"
        style="height: 160px"
      >
        <div class="bg-transparent">
          <div class="text-weight-bold text-black">
            <br />
            Bienvenido(a)
            <br />
            {{ Empleado }}
          </div>
        </div>
      </q-img>
      <q-scroll-area
        style="
          height: calc(100% - 150px);
          margin-top: 150px;
          border-right: 1px solid #ddd;
        "
      >
        <q-list padding class="margin top">
          <q-item
            clickable
            v-ripple
            class="text-grey-8 text-bold"
            :to="{ name: 'inicio' }"
            active-class="text-purple-ieen"
          >
            <q-item-section avatar>
              <q-icon name="home" />
            </q-item-section>

            <q-item-section> Inicio </q-item-section>
          </q-item>
          <q-item
            v-if="catalagosList.some((element) => element == 'DASHBOARD')"
            :to="{ name: 'dashboard' }"
            :content-inset-level="2"
            :header-inset-level="2"
            clickable
            v-ripple
            class="text-grey-8 text-bold"
            active-class="text-purple-ieen"
          >
            <q-item-section avatar>
              <q-icon name="analytics" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Dashboard</q-item-label>
            </q-item-section>
          </q-item>
          <q-item
            v-if="catalagosList.some((element) => element == 'MIS-SOLIC')"
            :content-inset-level="2"
            :header-inset-level="2"
            clickable
            v-ripple
            class="text-grey-8 text-bold"
            :to="{ name: 'misSolicitudes' }"
            active-class="text-purple-ieen"
          >
            <q-item-section avatar>
              <q-icon name="person" />
            </q-item-section>
            <q-item-section>Mis solicitudes</q-item-section>
          </q-item>
          <q-item
            v-if="catalagosList.some((element) => element == 'SOLIC-AREA')"
            :content-inset-level="2"
            :header-inset-level="2"
            clickable
            v-ripple
            class="text-grey-8 text-bold"
            :to="{ name: 'solicitudesArea' }"
            active-class="text-purple-ieen"
          >
            <q-item-section avatar>
              <q-icon name="groups" />
            </q-item-section>
            <q-item-section>Solicitudes área</q-item-section>
          </q-item>
          <q-item
            v-if="catalagosList.some((element) => element == 'SOLIC-RF')"
            :content-inset-level="2"
            :header-inset-level="2"
            clickable
            v-ripple
            class="text-grey-8 text-bold"
            :to="{ name: 'solicitudesRecFinancieros' }"
            active-class="text-purple-ieen"
          >
            <q-item-section avatar>
              <q-icon name="currency_exchange" />
            </q-item-section>
            <q-item-section>Solicitudes recursos financieros</q-item-section>
          </q-item>
          <q-item
            v-if="catalagosList.some((element) => element == 'SOLIC-ADMON')"
            :content-inset-level="2"
            :header-inset-level="2"
            clickable
            v-ripple
            class="text-grey-8 text-bold"
            :to="{ name: 'administracion' }"
            active-class="text-purple-ieen"
          >
            <q-item-section avatar>
              <q-icon name="drive_file_move_outline" />
            </q-item-section>
            <q-item-section>Administración</q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>
    <q-page-container>
      <router-view />
    </q-page-container>
    <q-footer reveal bordered class="bg-purple-ieen">
      <q-toolbar>
        <q-toolbar-title>
          <div>&#169; Unidad Técnica de Informática y Estadística</div>
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { useQuasar, QSpinnerFacebook } from "quasar";
import { useAuthStore } from "src/stores/auth-store";
import { onBeforeMount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { EncryptStorage } from "storage-encryption";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { useNotificacionStore } from "../stores/notificaciones-store";
import { useMisSolicitudesStore } from "src/stores/mis-solicitudes-store";

//----------------------------------------------------------

function handleClick(e) {
  if (!document.startViewTransition) {
    updateTheDOMSomehow();
    return;
  }
  document.startViewTransition(() => updateTheDOMSomehow());
}
//----------------------------------------------------------

const leftDrawerOpen = ref(false);
const $q = useQuasar();
const route = useRoute();
const authStore = useAuthStore();
const router = useRouter();
const notificacionStore = useNotificacionStore();
const misSolictudesStore = useMisSolicitudesStore();
const encryptStorage = new EncryptStorage("SECRET_KEY", "sessionStorage");
const { notificaciones, no_notificaciones } = storeToRefs(notificacionStore);
const { modulos, sistemas, apps, usuario_Nombre } = storeToRefs(authStore);
const modo = ref(false);
const catalagosList = ref([]);
const onLine = ref(false);
const usuario = ref("");
const userName = ref("");
const Empleado = ref(null);

//----------------------------------------------------------

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

//----------------------------------------------------------

onBeforeMount(async () => {
  if (route.query.key) {
    $q.loading.show({
      spinner: QSpinnerFacebook,
      spinnerColor: "purple-ieen",
      spinnerSize: 140,
      backgroundColor: "purple-3",
      message: "Espere un momento, por favor...",
      messageColor: "black",
    });
    encryptStorage.encrypt("key", route.query.key);
    const resp = await authStore.validarToken(
      route.query.key,
      route.query.sistema
    );
    $q.loading.hide();
    if (resp.success == false) {
      encryptStorage.remove("key");
      window.location = "http://sistema.ieenayarit.org:9271?return=false";
    }
  }

  if (route.query.sistema) {
    encryptStorage.encrypt("sistema", route.query.sistema);
  }

  if (route.query.usr) {
    encryptStorage.encrypt("usuario", route.query.usr);
    usuario.value = encryptStorage.decrypt("usuario");
  } else {
    if (encryptStorage.decrypt("usuario") != null) {
      usuario.value = encryptStorage.decrypt("usuario");
    }
  }

  if (route.query.userNameL) {
    encryptStorage.encrypt("userNameL", route.query.userNameL);
  }

  if (encryptStorage.decrypt("userNameL")) {
    userName.value = route.query.userNameL;
  }
  Empleado.value = encryptStorage.decrypt("empleado");
  await loadMenu();
  notificacionStore.loadNotificaciones();
});

onMounted(() => {
  const connection = new HubConnectionBuilder()
    //https://localhost:7289/hubGastos
    //http://sistema.ieenayarit.org:9170/hubGastos
    //http://sistema.ieenayarit.org:9270/hubGastos
    .withUrl("http://sistema.ieenayarit.org:9270/hubGastos", {
      // accessTokenFactory: () => localStorage.getItem("key"),
      headers: {
        Authorization: `Bearer ${encryptStorage.decrypt("key")}`,
      },
    })
    .configureLogging(LogLevel.Information)
    .build();
  connection
    .start()
    .then(() => {
      onLine.value = true;
    })
    .catch((err) => {
      onLine.value = false;
    });
  connection.on("notificar", (data) => {
    notificacionStore.loadNotificaciones();
    notificacionStore.loadNotificacionesAll();
    misSolictudesStore.load_Mis_Solicitudes();
    $q.notify({
      message: data,
      icon: "announcement",
    });
  });
});

//----------------------------------------------------------

const loadMenu = async () => {
  handleClick();
  $q.loading.show({
    spinner: QSpinnerFacebook,
    spinnerColor: "purple-ieen",
    spinnerSize: 140,
    backgroundColor: "purple-3",
    message: "Espere un momento, por favor...",
    messageColor: "black",
  });
  await authStore.loadSistemas();
  await authStore.loadModulos();
  modulos.value.forEach((element) => {
    switch (element.siglas_Modulo) {
      case "MIS-SOLIC":
        catalagosList.value.push("MIS-SOLIC");
        break;
      case "SOLIC-AREA":
        catalagosList.value.push("SOLIC-AREA");
        break;
      case "SOLIC-RF":
        catalagosList.value.push("SOLIC-RF");
        break;
      case "SOLIC-ADMON":
        catalagosList.value.push("SOLIC-ADMON");
        break;
      case "DASHBOARD":
        catalagosList.value.push("DASHBOARD");
        break;
    }
  });

  $q.loading.hide();
};

const toNotificaciones = () => {
  router.push({
    name: "notificaciones",
  });
};

const toSolicitudes = async (id, tipo) => {
  $q.loading.show({
    spinner: QSpinnerFacebook,
    spinnerColor: "purple-ieen",
    spinnerSize: 140,
    backgroundColor: "purple-3",
    message: "Espere un momento, por favor...",
    messageColor: "black",
  });
  await notificacionStore.leerNotificacion(id);
  $q.loading.hide();
  let name = null;
  switch (tipo) {
    case 1:
      name = "misSolicitudes";
      break;
    case 2:
      name = "solicitudesArea";
      break;
    case 3:
      name = "solicitudesRecFinancieros";
      break;
  }
  router.push({
    name: name,
  });
};

const show = () => {
  $q.bottomSheet({
    message: "Aplicaciones",
    grid: true,
    actions: apps.value,
  }).onOk((action) => {
    if (action.label == "Cerrar sesión") {
      localStorage.clear();
      window.location = "http://sistema.ieenayarit.org:9271?return=false";
    } else if (action.label == "Ir a universo") {
      window.location = "http://sistema.ieenayarit.org:9271?return=true";
    } else {
      window.location =
        action.url +
        `/#/?key=${encryptStorage.decrypt("key")}&sistema=${
          action.id
        }&usr=${encryptStorage.decrypt("usuario")}`;
    }
  });
};
</script>
<style lang="scss">
::view-transition-group(root) {
  animation-timing-function: var(--expo-in);
}

::view-transition-new(root) {
  mask: url("https://media.tenor.com/Jz0aSpk9VIQAAAAi/i-love-you-love.gif")
    center / 0 no-repeat;
  animation: scale 1.5s;
}

::view-transition-old(root),
.dark::view-transition-old(root) {
  animation: scale 1.5s;
}

@keyframes scale {
  0% {
    mask-size: 0;
  }
  10% {
    mask-size: 50vmax;
  }
  90% {
    mask-size: 50vmax;
  }
  100% {
    mask-size: 2000vmax;
  }
}
.text-purple-ieen {
  color: #673e84 !important;
}
.bg-purple-ieen {
  background: #673e84 !important;
}
.text-purple-ieen-1 {
  color: #863399 !important;
}
.bg-purple-ieen-1 {
  background: #863399 !important;
}
.text-purple-ieen-2 {
  color: #a25eb5 !important;
}
.bg-purple-ieen-2 {
  background: #a25eb5 !important;
}
.text-purple-ieen-3 {
  color: #bb83ca !important;
}
.bg-purple-ieen-3 {
  background: #bb83ca !important;
}
.text-pink-ieen-1 {
  color: #b32572 !important;
}
.bg-pink-ieen-1 {
  background: #b32572 !important;
}
.text-pink-ieen-2 {
  color: #cc5599 !important;
}
.bg-pink-ieen-2 {
  background: #cc5599 !important;
}
.text-pink-ieen-3 {
  color: #dd85ba !important;
}
.bg-pink-ieen-3 {
  background: #dd85ba !important;
}
.text-gray-ieen-1 {
  color: #76777a !important;
}
.bg-gray-ieen-1 {
  background: #76777a !important;
}
.text-gray-ieen-2 {
  color: #98989a !important;
}
.bg-gray-ieen-2 {
  background: #98989a !important;
}
.text-gray-ieen-3 {
  color: #b1b1b1 !important;
}
.bg-gray-ieen-3 {
  background: #b1b1b1 !important;
}
</style>
