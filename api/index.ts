export default async function handler(req: any, res: any) {
  try {
    const appModule = await import('../server/index');
    const app = appModule.default;
    return app(req, res);
  } catch (err: any) {
    console.error("FATAL INITIALIZATION ERROR:", err);
    res.status(500).json({
      error: "Fatal Serverless Initialization Error",
      message: err.message || String(err),
      stack: err.stack
    });
  }
}
