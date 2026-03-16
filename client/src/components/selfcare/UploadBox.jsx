import React from "react";

export default function UploadBox({ label, accept = "image/png,image/jpeg", file, onChange }) {
  return (
    <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition hover:border-pink-300 hover:bg-pink-50">
      <span className="mb-2 block text-3xl">📤</span>
      <span className="block text-sm font-medium text-slate-700">{label}</span>
      <span className="mt-1 block text-xs text-slate-500">JPG, PNG accepted</span>
      <input type="file" accept={accept} className="hidden" onChange={onChange} />
      {file ? <span className="mt-3 block text-sm text-violet-700">Selected: {file.name}</span> : null}
    </label>
  );
}
