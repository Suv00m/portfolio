"use client";

import { useEffect } from "react";

export default function PrismLoader() {
  useEffect(() => {
    // Load Prism CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css";
    document.head.appendChild(link);

    // Load Prism JS
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js";
    script.async = true;
    script.onload = () => {
      // Load autoloader after core is loaded
      const autoloader = document.createElement("script");
      autoloader.src = "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js";
      autoloader.async = true;
      document.body.appendChild(autoloader);
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup
      document.head.removeChild(link);
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null;
}
