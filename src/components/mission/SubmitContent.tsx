import { useRef, useState } from "react";
import { IconUpload, IconClose } from "@/components/dashboard/icons";

type Props = {
  onSubmittedChange: (submitted: boolean) => void;
};

export const SubmitContent = ({ onSubmittedChange }: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [link, setLink] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateSubmitted = (f: File | null, l: string) => {
    const ok = !!f || /^https?:\/\/\S+\.\S+/.test(l.trim());
    onSubmittedChange(ok);
  };

  const handleFile = (f: File | null) => {
    setFile(f);
    updateSubmitted(f, link);
  };

  const handleLink = (v: string) => {
    setLink(v);
    updateSubmitted(file, v);
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Option A: Upload */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0] ?? null;
          handleFile(f);
        }}
        className={[
          "rounded-[14px] border-2 border-dashed p-7 text-center transition-all duration-200",
          file
            ? "border-success bg-success/5"
            : dragOver
            ? "border-accent bg-accent/10"
            : "border-border bg-bg-elevated/40 hover:border-accent",
        ].join(" ")}
      >
        {file ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <IconUpload className="h-6 w-6 flex-shrink-0 text-success" />
              <div className="min-w-0 text-left">
                <div className="truncate text-[13px] font-medium text-success">{file.name}</div>
                <div className="text-[11px] text-text3">{(file.size / 1024).toFixed(1)} KB</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleFile(null)}
              className="rounded-full p-1 text-text2 hover:bg-bg-elevated hover:text-foreground"
              aria-label="Remove file"
            >
              <IconClose className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-center">
              <IconUpload className="h-8 w-8 text-accent" />
            </div>
            <div className="mt-2 text-[14px] font-semibold text-foreground">Drop your file here</div>
            <div className="text-[13px] text-text3">or</div>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-[13px] font-medium text-accent hover:underline"
            >
              Browse files
            </button>
            <div className="mt-1.5 text-[12px] text-text3">Accepts PNG, JPG, PDF — max 10MB</div>
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,application/pdf"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
          </>
        )}
      </div>

      {/* Option B: Link */}
      <div>
        <label className="mb-2 block text-[13px] font-medium text-text2">Or paste a link</label>
        <input
          type="url"
          value={link}
          onChange={(e) => handleLink(e.target.value)}
          placeholder="e.g. https://figma.com/file/..."
          className="h-12 w-full rounded-[12px] border-[1.5px] border-border bg-card px-4 text-[14px] text-foreground placeholder:text-text3 focus:border-accent focus:shadow-[0_0_0_4px_hsl(var(--accent)/0.1)] focus:outline-none"
        />
        <div className="mt-2.5 flex flex-wrap gap-2">
          {["Figma", "Portfolio", "Google Drive"].map((chip) => (
            <span
              key={chip}
              className="cursor-default rounded-full border border-border bg-bg-elevated/60 px-3 py-1 text-[11px] font-medium text-text2 transition-colors hover:border-accent hover:text-accent"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
