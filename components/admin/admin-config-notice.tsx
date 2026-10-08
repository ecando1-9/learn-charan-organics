import { AlertTriangle, ExternalLink } from "lucide-react";

export function AdminConfigNotice({ message }: { message: string }) {
  return (
    <div className="rounded-[2rem] border border-amber-300/70 bg-amber-50 p-6 text-amber-950 shadow-soft dark:border-amber-400/30 dark:bg-amber-950/30 dark:text-amber-50">
      <div className="flex items-start gap-4">
        <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-amber-200/70 text-amber-800 dark:bg-amber-400/20 dark:text-amber-200">
          <AlertTriangle size={22} />
        </div>
        <div className="space-y-3">
          <div>
            <h2 className="text-xl font-black">Admin data is not connected yet</h2>
            <p className="mt-1 text-sm font-semibold opacity-80">{message}</p>
          </div>
          <div className="rounded-2xl bg-white/70 p-4 text-sm dark:bg-white/10">
            <p className="font-bold">Fix this in `.env.local`:</p>
            <p className="mt-2 font-mono text-xs">SUPABASE_SERVICE_ROLE_KEY=your-service-role-key</p>
            <p className="mt-3 opacity-80">
              Get it from Supabase Dashboard, Project Settings, API, then copy the `service_role` secret key.
              Restart the dev server after saving the file.
            </p>
          </div>
          <a
            href="https://supabase.com/dashboard/project/frdkhfuarrgmulppqzis/settings/api"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2 text-sm font-bold text-white hover:bg-leaf"
          >
            Open Supabase API settings <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
