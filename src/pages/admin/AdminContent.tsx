import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, Loader2, CheckCircle, Globe } from "lucide-react";
import { toast } from "sonner";

const weeks = [1, 2, 3, 4];

interface UploadedFile {
  name: string;
  weekId: number;
}

const AdminContent = () => {
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUploads = async () => {
    setLoading(true);
    const results: UploadedFile[] = [];
    for (const w of weeks) {
      const { data } = await supabase.storage.from("notebooks").list(`week-${w}`, { limit: 1 });
      if (data && data.length > 0) {
        results.push({ name: data[0].name, weekId: w });
      }
    }
    setUploads(results);
    setLoading(false);
  };

  useEffect(() => { fetchUploads(); }, []);

  const handleUpload = async (weekId: number, file: File) => {
    if (!file.name.endsWith(".ipynb")) {
      toast.error("Please upload a .ipynb file");
      return;
    }

    setUploading(weekId);

    const { data: existing } = await supabase.storage.from("notebooks").list(`week-${weekId}`);
    if (existing && existing.length > 0) {
      await supabase.storage.from("notebooks").remove(existing.map(f => `week-${weekId}/${f.name}`));
    }

    const { error } = await supabase.storage
      .from("notebooks")
      .upload(`week-${weekId}/${file.name}`, file, { upsert: true });

    if (error) {
      toast.error("Upload failed: " + error.message);
    } else {
      toast.success(`Week ${weekId} notebook published globally!`);
      fetchUploads();
    }
    setUploading(null);
  };

  const handleDelete = async (weekId: number, fileName: string) => {
    const { error } = await supabase.storage.from("notebooks").remove([`week-${weekId}/${fileName}`]);
    if (error) {
      toast.error("Delete failed");
    } else {
      toast.success("Notebook removed globally");
      fetchUploads();
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Globe className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Mass Content</h1>
          <p className="text-muted-foreground text-sm">Upload notebooks globally — visible to all students and teachers.</p>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {weeks.map(w => {
          const uploaded = uploads.find(u => u.weekId === w);
          const isUploading = uploading === w;

          return (
            <div key={w} className="rounded-lg bg-card shadow-subtle p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">{w}</span>
                </div>
                <div>
                  <div className="font-medium">Week {w}</div>
                  {uploaded ? (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      {uploaded.name}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No notebook uploaded</div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {uploaded && (
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(w, uploaded.name)}>
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                )}
                <label>
                  <input
                    type="file"
                    accept=".ipynb"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(w, file);
                      e.target.value = "";
                    }}
                  />
                  <Button variant="outline" size="sm" asChild disabled={isUploading}>
                    <span className="cursor-pointer">
                      {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      {uploaded ? "Replace" : "Upload"}
                    </span>
                  </Button>
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminContent;
