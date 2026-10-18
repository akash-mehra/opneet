import { useEffect, useState } from "react";
import { ArrowDownToLine, X } from "lucide-react";
import { Dialog } from "./ui";

interface InstallEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
const DISMISS_KEY = "opneet.install-dismissed-until";
function appMode() {
  return window.matchMedia("(display-mode: standalone), (display-mode: fullscreen), (display-mode: minimal-ui), (display-mode: window-controls-overlay)").matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
}

export default function InstallPrompt({ enabled }: { enabled: boolean }) {
  const [standalone, setStandalone] = useState(appMode);
  const [installed, setInstalled] = useState(false);
  const [event, setEvent] = useState<InstallEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [help, setHelp] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const mode = window.matchMedia("(display-mode: standalone), (display-mode: fullscreen), (display-mode: minimal-ui), (display-mode: window-controls-overlay)");
    const update = () => setStandalone(appMode());
    const available = (e: Event) => { e.preventDefault(); setEvent(e as InstallEvent); };
    const onInstalled = () => { setInstalled(true); setEvent(null); setVisible(false); setHelp(false); };
    mode.addEventListener("change", update);
    window.addEventListener("beforeinstallprompt", available);
    window.addEventListener("appinstalled", onInstalled);
    let dismissed = false;
    try { dismissed = Number(localStorage.getItem(DISMISS_KEY)) > Date.now(); } catch { /* Optional preference. */ }
    const timer = setTimeout(() => { if (!dismissed) setVisible(true); }, 2000);
    return () => {
      clearTimeout(timer);
      mode.removeEventListener("change", update);
      window.removeEventListener("beforeinstallprompt", available);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);
  function dismiss() {
    setVisible(false);
    try { localStorage.setItem(DISMISS_KEY, String(Date.now() + 7 * 86400000)); } catch { /* Keep dismissal for this visit. */ }
  }
  async function install() {
    if (!event) { setHelp(true); return; }
    setBusy(true);
    try {
      await event.prompt();
      const choice = await event.userChoice;
      setEvent(null);
      if (choice.outcome === "accepted") {
        // Acceptance is not evidence that Android finished installing the app.
        setMessage("Installation requested. Look for opneet on your home screen or in your app list.");
      } else dismiss();
    } catch {
      setEvent(null);
      setHelp(true);
    } finally { setBusy(false); }
  }
  if (standalone || installed || !enabled) return null;
  return <>
    {visible && <aside className="install-prompt" aria-labelledby="install-title">
      <button className="icon-button install-close" aria-label="Dismiss install suggestion" onClick={dismiss}><X size={19} /></button>
      <ArrowDownToLine size={25} aria-hidden="true" />
      <h2 id="install-title">Keep opneet close.</h2>
      <p>Make it a web app on your home screen. Open your question bank with one tap.</p>
      {message ? <p role="status">{message}</p> : <div className="install-actions">
        <button className="button primary" onClick={install} disabled={busy}>{busy ? "Opening installer…" : event ? "Install opneet" : "How to install"}</button>
        <button className="button secondary" onClick={dismiss}>Not now</button>
      </div>}
      <button className="text-button" onClick={() => setHelp(true)}>Installation not working?</button>
    </aside>}
    {help && <Dialog title="Install opneet" onClose={() => setHelp(false)}>
      <div className="install-help">
        <p><strong>Android:</strong> open this site directly in Chrome, then choose <strong>Install app</strong> or <strong>Add to Home screen</strong> from the browser menu.</p>
        <p><strong>iPhone or iPad:</strong> open it in Safari, tap <strong>Share</strong>, then <strong>Add to Home Screen</strong>.</p>
        <p><strong>Desktop:</strong> use the install icon in the address bar or the browser’s app menu, if available.</p>
        <h3>“Already installed,” but it won’t open?</h3>
        <p>Check Android Settings → Apps for opneet and remove the broken installation if it appears there. If there is only a home-screen shortcut, remove that shortcut. Then return to this site in an updated Chrome and try installing again.</p>
        <p>You can keep studying in the browser. Export your study backup from Settings before clearing any browser site data.</p>
        <button className="button primary" onClick={() => setHelp(false)}>Got it</button>
      </div>
    </Dialog>}
  </>;
}
