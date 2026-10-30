/** Messages between the editor and the typesetter worker. `data` is the JSON from renderModel.ts. */
export type WorkerRequest =
  | { type: "warm"; id: number; fonts: string[] }
  | { type: "preview" | "pdf" | "text"; id: number; templateId: string; fonts: string[]; data: string }
  /** Text of a PDF the person picked (import). The file never leaves the device. */
  | { type: "extract"; id: number; bytes: Uint8Array }

export type WorkerResponse =
  | { type: "ready"; id: number }
  | { type: "preview"; id: number; svg: string; ms: number }
  | { type: "pdf"; id: number; bytes: Uint8Array; ms: number }
  | { type: "text"; id: number; text: string; pages: number; links: string[] }
  | { type: "error"; id: number; error: string; line: number | null }
