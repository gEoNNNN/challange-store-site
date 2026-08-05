export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startSyncScheduler } = await import("./lib/syncProducts");
    startSyncScheduler().catch(console.error);
  }
}
