"use client"

import { useSyncExternalStore } from "react"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { Check, Info, Loader2, TriangleAlert, X } from "lucide-react"

const PHONE = "(max-width: 639px)"

function usePhone() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(PHONE)
      m.addEventListener("change", cb)
      return () => m.removeEventListener("change", cb)
    },
    () => window.matchMedia(PHONE).matches,
    () => false
  )
}

/*
 * Toasts are printed slips: sheet paper, a 1px ink rule, 4px corners, an icon cell on the left and a mono
 * status tag beside the title. No blur, no glow. Phones get them at the top, under the safe area, so they
 * never cover the action bar or the tool sheet; desktop keeps them bottom right. Styles: .dx-toast in
 * workspace-redesign.css (the toaster mounts outside the .site scope, so it carries its own values).
 */
const Toaster = (props: ToasterProps) => {
  const phone = usePhone()
  return (
    <Sonner
      theme="light"
      position={phone ? "top-center" : "bottom-right"}
      offset={20}
      mobileOffset={{ top: "calc(env(safe-area-inset-top) + 0.5rem)", left: "0.5rem", right: "0.5rem" }}
      visibleToasts={3}
      gap={8}
      duration={4500}
      className="dx-toaster"
      icons={{
        success: <Check className="size-4" strokeWidth={2.5} />,
        error: <X className="size-4" strokeWidth={2.5} />,
        warning: <TriangleAlert className="size-4" strokeWidth={2.25} />,
        info: <Info className="size-4" strokeWidth={2.25} />,
        loading: <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "dx-toast",
          icon: "dx-toast-icon",
          content: "dx-toast-content",
          title: "dx-toast-title",
          description: "dx-toast-desc",
          actionButton: "dx-toast-action",
          cancelButton: "dx-toast-cancel",
          closeButton: "dx-toast-close",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
