"use client";

import { useState } from "react";

export function CourseHeroImage({ src, pexelsUrl, alt, gradient, icon, title, description, moduleCount, hasAssessment }: {
  src: string; pexelsUrl?: string; alt: string; gradient: string; icon: string;
  title: string; description?: string; moduleCount: number; hasAssessment: boolean;
}) {
  const [imgError, setImgError] = useState(false);
  const imgSrc = !imgError ? src : (pexelsUrl || src);

  return (
    <div className="rounded-xl overflow-hidden relative h-48 md:h-56">
      <img src={imgSrc} alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
        onError={() => setImgError(true)} />
      <div className={`absolute inset-0 bg-gradient-to-t ${gradient} opacity-85`} />
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shrink-0">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-white">{title}</h1>
            <p className="text-white/80 text-sm mt-1 max-w-2xl">{description}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-white/70">
              <span>{moduleCount} modules</span>
              <span>•</span>
              <span>{hasAssessment ? "IRT assessments" : "Self-paced"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
