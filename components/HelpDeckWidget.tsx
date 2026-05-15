"use client";
import { useEffect } from 'react';

export default function HelpDeckWidget() {
  useEffect(() => {
    (window as any).CRISP_WEBSITE_ID = "ws_1778827360039_2e19q7ezf";
    (window as any).CRISP_OWNER_ID = "c77uN9hZnAd7NUCxmcspVJxPapm1";
    (window as any).HELPDECK_USER = {
      name: "John Doe",
      email: "john@example.com",
      userId: "12345"
      // You can add more fields (e.g. company, plan) to see them in your sidebar
    };
    const s = document.createElement("script");
    s.src = "https://help-deck-gamma.vercel.app/widget-loader.js";
    s.async = true;
    document.head.appendChild(s);
  }, []);

  return null;
}
