"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function subscribeToInstalled(callback: () => void) {
  const displayMode = window.matchMedia("(display-mode: standalone)");
  displayMode.addEventListener("change", callback);
  window.addEventListener("appinstalled", callback);
  return () => {
    displayMode.removeEventListener("change", callback);
    window.removeEventListener("appinstalled", callback);
  };
}

function getInstalledSnapshot(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

export function InstallAppButton() {
  const installPrompt = useRef<InstallPromptEvent | null>(null);
  const installed = useSyncExternalStore(
    subscribeToInstalled,
    getInstalledSnapshot,
    () => false,
  );
  const [installedByEvent, setInstalledByEvent] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      installPrompt.current = event as InstallPromptEvent;
    }

    function onAppInstalled() {
      setInstalledByEvent(true);
      installPrompt.current = null;
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  async function installApp() {
    if (!installPrompt.current) {
      setMessage(
        "En Chrome o Edge, abre el menú ⋮ y selecciona «Instalar aplicación» o «Instalar esta página como aplicación».",
      );
      return;
    }

    try {
      const prompt = installPrompt.current;
      installPrompt.current = null;
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === "accepted") {
        setMessage("Sigue los pasos del navegador para terminar la instalación.");
      }
    } catch (error) {
      console.error("No se pudo abrir la instalación de la aplicación.", error);
      setMessage(
        "No se pudo iniciar la instalación. Inténtalo desde el menú de Chrome o Edge.",
      );
    }
  }

  if (installed || installedByEvent) return null;

  return (
    <div className="install-app">
      <button type="button" className="install-app-button" onClick={installApp}>
        Instalar app
      </button>
      {message && (
        <p className="install-app-message" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
