import { ref } from "vue";
import { useQuasar } from "quasar";
import { EncryptStorage } from "storage-encryption";
import { useMisSolicitudesStore } from "src/stores/mis-solicitudes-store";
import { useSolicitudesAreaStore } from "src/stores/solicitudes-area-store";
import { useSolicitudesRFStore } from "src/stores/solicitudes-rf-store";
import * as signalR from "@microsoft/signalr";
import { urlSistemas } from "src/boot/axios";

const misSolicitudesStore = useMisSolicitudesStore();
const solicitudesAreasStore = useSolicitudesAreaStore();
const solicitudesRFStore = useSolicitudesRFStore();
const encryptStorage = new EncryptStorage("SECRET_KEY", "sessionStorage");
const onLine = ref(false);
const connection = new signalR.HubConnectionBuilder()
  .withUrl(`${urlSistemas}:9270/hubUniverso`, {
    accessTokenFactory: () => encryptStorage.decrypt("key"),
  })
  .withAutomaticReconnect()
  .configureLogging(signalR.LogLevel.Information)
  .build();

export function useNotifications() {
  const $q = useQuasar();

  const startConnection = async () => {
    try {
      await connection.start();
      onLine.value = true;
      console.info("SignalR Connected.");
    } catch (err) {
      onLine.value = false;
      console.error("SignalR Connection Error: ", err);
      setTimeout(startConnection, 5000);
    }
  };

  const onReceiveNotification = () => {
    connection.on("notificarUsuario", (data) => {
      $q.notify({
        position: "top-right",
        message: data.titulo,
        icon: data.tipo == "I" ? "announcement" : "warning",
        color:
          data.tipo == "I" ? "purple" : data.tipo == "E" ? "red" : "orange",
        caption: data.sistema,
        actions: [
          {
            icon: "close",
            color: "white",
            round: true,
            handler: () => {},
          },
        ],
      });
      cargarData();
    });
  };

  const cargarData = async () => {
    if (encryptStorage.decrypt("perfil") != "Personal") {
      await solicitudesAreasStore.load_Solicitudes_Area();
      await misSolicitudesStore.load_Mis_Solicitudes();
      await solicitudesRFStore.load_solicitudes_rec_financieros_aprobadas();
      await solicitudesRFStore.load_Solicitudes_RF();
    } else {
      await misSolicitudesStore.load_Mis_Solicitudes();
    }
    misSolicitudesStore.actualizarModal(false);
  };

  return { startConnection, onReceiveNotification, onLine };
}
