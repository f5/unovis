// The vanilla TS examples self-mount onto `document.getElementById('vis-container')`,
// which exists inside #root-ts. The mount step is just the dynamic import — its
// side-effects do the rendering.
export async function mountTs (loadModule: () => Promise<unknown>): Promise<void> {
  await loadModule()
}
